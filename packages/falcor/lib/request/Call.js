var Source = require('./Source');
var Subscriber = require('./Subscriber');
var lruCollect = require('../lru/collect');
var FalcorJSON = require('../cache/get/json/FalcorJSON');
var collapse = require('@graphistry/falcor-path-utils/lib/collapse');
var InvalidSourceError = require('../errors/InvalidSourceError');
var MaxRetryExceededError = require('../errors/MaxRetryExceededError');

module.exports = Call;

function Call(type, model, _args) {
    Source.call(this, type);
    if (model && _args) {
        this.type = type;
        this.source = this;
        this.model = model;
        this._args = _args;
    }
}

Call.prototype = Object.create(Source.prototype);

Call.prototype.lift = function(operator, source) {
    source = new Call(source || this);
    source.type = this.type;
    source.model = this.model;
    source._args = this._args;
    source.operator = operator;
    operator.data = operator.data || this.operator.data;
    operator.errors = operator.errors || this.operator.errors;
    operator.operation = operator.operation || this.operator.operation;
    operator.progressive = operator.progressive || this.operator.progressive;
    operator.maxRetryCount = operator.maxRetryCount || this.operator.maxRetryCount;
    return source;
}

Call.prototype.operator = function(subscriber) {
    return this._subscribe(subscriber);
}

Call.prototype._subscribe = function(subscriber) {
    subscriber.onNext({
        type: this.type,
        args: this._args,
        model: this.model,
        version: this.model._root.version
    });
    subscriber.onCompleted();
    return subscriber;
}

Call.prototype._toJSON = function(data = { __proto__: FalcorJSON.prototype }, errors) {
    return this.lift(new CallOperator(
        data, errors || this.operator.errors, 'json',
        this.operator.progressive, this.operator.maxRetryCount
    ), this.source);
}

Call.prototype._toJSONG = function(data = { __proto__: FalcorJSON.prototype }, errors) {
    return this.lift(new CallOperator(
        data, errors || this.operator.errors, 'jsonGraph',
        this.operator.progressive, this.operator.maxRetryCount
    ), this.source);
}

Call.prototype.retry = function(maxRetryCount) {
    return this.lift(new CallOperator(
        this.operator.data,
        this.operator.errors,
        this.operator.operation,
        this.operator.progresive,
        maxRetryCount
    ), this.source);
}

Call.prototype.progressively = function() {
    return this.lift(new CallOperator(
        this.operator.data,
        this.operator.errors,
        this.operator.operation,
        true,
        this.operator.maxRetryCount
    ), this.source);
}

function CallOperator(data, errors, operation, progressive, maxRetryCount) {
    this.data = data;
    this.errors = errors;
    this.operation = operation;
    this.progressive = progressive;
    this.maxRetryCount = maxRetryCount;
}

CallOperator.prototype.call = function(source, destination) {
    return source.subscribe(new CallSubscriber(
        destination, this.data, this.errors, this.operation, this.progressive
    ));
}

function CallSubscriber(destination, data, errors, operation, progressive, maxRetryCount) {
    Subscriber.call(this, destination);
    this.data = data;
    this.retryCount = -1;
    this.errors = errors;
    this.hasValue = false;
    this.completed = false;
    this.operation = operation;
    this.progressive = progressive;
    this.maxRetryCount = maxRetryCount;
}

CallSubscriber.prototype = Object.create(Subscriber.prototype);
CallSubscriber.prototype.operations = {
    get: require('../cache/get'),
    set: require('../cache/set'),
    call: require('../cache/call'),
    invalidate: require('../cache/invalidate')
};

CallSubscriber.prototype.next =
CallSubscriber.prototype.onNext = function(seed) {

    if (!this.started) {
        this.args = seed.args;
        this.type = seed.type;
        this.model = seed.model;
        this.version = seed.version;
        this.maxRetryCount = this.maxRetryCount || this.model._root.maxRetryCount;
        return;
    }

    var missing, fragments;
    var type = seed.type;
    var args = seed.args || seed.paths;

    var data = this.data;
    var model = this.model;
    var errors = this.errors;
    var results = this.results;
    var version = this.version;
    var hasValue = this.hasValue;
    var operation = this.operation;
    var progressive = this.progressive;

    var seedIsImmutable = progressive && data;

    // If we request paths as JSON in progressive mode, ensure each progressive
    // valueNode is immutable. If not in progressive mode, we can write into the
    // same JSON tree until the request is completed.
    if (seedIsImmutable) {
        data = { __proto__: FalcorJSON.prototype };
    }

    if (args && args.length) {

        results = this.operations[type]
            [operation](model, args, data,
                        progressive || !model._source,
                        this.retryCount === -1);

        // We must communicate critical errors from get, such as bound path is
        // broken or this is a JSONGraph request with a bound path.
        if (results.error) {
            return tryOnError(this, results.error);
        }

        errors && results.errors &&
            errors.push.apply(errors, results.errors);

        if (fragments = results.fragments) {
            args = results.args;
            this.fragments = fragments;
        }

        this.relative = results.relative;
        this.requested = results.requested;
        this.missing = missing = results.missing;
        this.hasValue = hasValue || (hasValue = results.hasValue);
    }

    // We are done when there are no missing paths or
    // the model does not have a dataSource to fetch from.
    this.completed = !missing || !model._source;

    if (type !== 'set') {
        this.args = args;
        if (seedIsImmutable) {
            this.data = mergeInto(data, this.data);
        }
    }

    if (progressive && hasValue && data && (data.json || data.jsonGraph)) {
        tryOnNext(data, operation, model._root, this.destination);
    }
}

CallSubscriber.prototype.error =
CallSubscriber.prototype.onError = function(error) {
    if (error instanceof InvalidSourceError) {
        return Subscriber.prototype.onError.call(this, error);
    }
    this.errored = true;
    this.onCompleted(error);
}

CallSubscriber.prototype.complete =
CallSubscriber.prototype.onCompleted = function(error) {

    var data, type, errors, errored;

    if (!this.started && (this.started = true)) {
        this.onNext(this);
    } else if (errored = this.errored) {
        this.onNext({ type: 'get', paths: this.relative });
    }

    if (errored || this.completed) {
        if (!this.progressive && this.hasValue && (
            (data = this.data) && data.json || data.jsonGraph)) {
            tryOnNext(data, this.operation, this.model._root, this.destination);
        }
        errors = this.errors;
        if (errored || error || errors && errors.length) {
            return tryOnError(this, errors.length && errors || error);
        }

        return Subscriber.prototype.onCompleted.call(this);
    }

    if (++this.retryCount >= this.maxRetryCount) {
        return tryOnError(this, new MaxRetryExceededError(
            this.retryCount,
            this.requested,
            this.relative,
            this.missing
        ));
    }

    this.request = this.model._root.requests[this.type](
        this.model, this.missing, this.relative, this.fragments
    ).subscribe(this);
}

CallSubscriber.prototype.dispose =
CallSubscriber.prototype.unsubscribe = function() {

    var model = this.model;
    var version = this.version;
    var request = this.request;

    this.args = null;
    this.data = null;
    this.model = null;
    this.errors = null;
    this.errored = false;
    this.started = false;
    this.hasValue = false;
    this.completed = false;

    Subscriber.prototype.dispose.call(this);

    if (request) {
        this.request = null;
        request.dispose();
    }

    if (model) {

        var modelRoot = model._root;
        var cache = modelRoot.cache;
        var shouldCollectCache = modelRoot.syncRefCount <= 0 &&
                                 version !== modelRoot.version;

        // Prune the cache via the LRU if this is the last request.
        if (shouldCollectCache) {

            if (cache) {
                lruCollect(modelRoot,
                           modelRoot.expired,
                           cache.$size || 0,
                           modelRoot.maxSize,
                           modelRoot.collectRatio,
                           modelRoot.version);
            }

            var rootOnChangesCompletedHandler = modelRoot.onChangesCompleted;

            if (rootOnChangesCompletedHandler) {
                rootOnChangesCompletedHandler.call(modelRoot.topLevelModel);
            }
        }
    }
}

function tryOnNext(data, operation, modelRoot, destination) {
    if (operation === 'jsonGraph' && data.paths) {
        data.paths = collapse(data.paths);
    }
    try {
        ++modelRoot.syncRefCount;
        destination.onNext(data);
    } catch(e) {
        throw e;
    } finally {
        --modelRoot.syncRefCount;
    }
}

function tryOnError(self, error) {
    try {
        throw error;
    } catch (err) {
        Subscriber.prototype.onError.call(self, err);
    }
}

function mergeInto(dest, node) {

    var destValue, nodeValue,
        key, keys = Object.keys(node),
        index = -1, length = keys.length;

    while (++index < length) {

        key = keys[index];

        if (key === f_meta_data) {
            dest[f_meta_data] = node[f_meta_data];
        } else {

            nodeValue = node[key];
            destValue = dest[key];

            if (destValue !== nodeValue) {
                if (!nodeValue || typeof nodeValue !== 'object') {
                    if (destValue === undefined) {
                        dest[key] = nodeValue;
                    }
                } else if (destValue === undefined) {
                    dest[key] = nodeValue;
                } else {
                    mergeInto(destValue, nodeValue);
                }
            }
        }
    }

    return dest;
}
