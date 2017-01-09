var Call = require('./request/Call');
var ModelRoot = require('./ModelRoot');
var FalcorJSON = require('./cache/get/json/FalcorJSON');
var ModelDataSourceAdapter = require('./ModelDataSourceAdapter');
var TimeoutScheduler = require('./schedulers/TimeoutScheduler');
var ImmediateScheduler = require('./schedulers/ImmediateScheduler');
var collapse = require('@graphistry/falcor-path-utils/lib/collapse');

var lruCollect = require('./lru/collect');
var getSize = require('./support/getSize');
var isObject = require('./support/isObject');
var isJSONEnvelope = require('./support/isJSONEnvelope');
var getCachePosition = require('./cache/getCachePosition');
var isJSONGraphEnvelope = require('./support/isJSONGraphEnvelope');

var setCache = require('./cache/set/setPathMaps');
var setJSONGraphs = require('./cache/set/setJSONGraphs');

var getJSON = require('./cache/get/json');
var getCache = require('./cache/getCache');
var getJSONGraph = require('./cache/get/jsonGraph');

module.exports = Model;

/**
 * This callback is invoked when the Model's cache is changed.
 * @callback Model~onChange
 */

 /**
 * This function is invoked on every JSONGraph Error retrieved from the DataSource. This function allows Error objects to be transformed before being stored in the Model's cache.
 * @callback Model~errorSelector
 * @param {Object} jsonGraphError - the JSONGraph Error object to transform before it is stored in the Model's cache.
 * @returns {Object} the JSONGraph Error object to store in the Model cache.
 */

 /**
 * This function is invoked every time a value in the Model cache is about to be replaced with a new value. If the function returns true, the existing value is replaced with a new value and the version flag on all of the value's ancestors in the tree are incremented.
 * @callback Model~comparator
 * @param {Object} existingValue - the current value in the Model cache.
 * @param {Object} newValue - the value about to be set into the Model cache.
 * @returns {Boolean} the Boolean value indicating whether the new value and the existing value are equal.
 */

/**
 * A Model object is used to execute commands against a {@link JSONGraph} object. {@link Model}s can work with a local JSONGraph cache, or it can work with a remote {@link JSONGraph} object through a {@link DataSource}.
 * @constructor
 * @param {?Object} options - a set of options to customize behavior
 * @param {?DataSource} options.source - a data source to retrieve and manage the {@link JSONGraph}
 * @param {?JSONGraph} options.cache - initial state of the {@link JSONGraph}
 * @param {?number} options.maxSize - the maximum size of the cache. This value roughly correlates to item count (where itemCount = maxSize / 50). Each item by default is given a metadata `$size` of 50 (or its length when it's an array or string). You can get better control of falcor's memory usage by tweaking `$size`
 * @param {?number} options.collectRatio - the ratio of the maximum size to collect when the maxSize is exceeded
 * @param {?Model~errorSelector} options.errorSelector - a function used to translate errors before they are returned
 * @param {?Model~onChange} options.onChange - a function called whenever the Model's cache is changed
 * @param {?Model~comparator} options.comparator - a function called whenever a value in the Model's cache is about to be replaced with a new value.
 */
function Model(opts) {

    var options = opts || {};

    this._node = options._node;
    this._path = options._path || [];
    this._source = options.source || options._source;
    this._root = options._root || new ModelRoot(options, this);
    this._recycleJSON = options.recycleJSON === true || options._recycleJSON;
    this._scheduler = options.scheduler || options._scheduler || new ImmediateScheduler();

    if (options._seed) {
        this._recycleJSON = true;
        this._seed = options._seed;
        this._treatErrorsAsValues = true;
    } else if (this._recycleJSON) {
        this._treatErrorsAsValues = true;
        this._seed = {};
        this._seed.__proto__ = FalcorJSON.prototype;
    }

    this._boxed = options.boxed === true || options._boxed || false;
    this._materialized = options.materialized === true || options._materialized || false;
    this._treatErrorsAsValues = options.treatErrorsAsValues === true || options._treatErrorsAsValues || false;
    this._allowFromWhenceYouCame = options.allowFromWhenceYouCame === true || options._allowFromWhenceYouCame || false;

    if (options.cache) {
        this.setCache(options.cache);
    }
}

Model.prototype.constructor = Model;

/**
 * The get method retrieves several {@link Path}s or {@link PathSet}s from a {@link Model}. The get method loads each value into a JSON object and returns in a ModelResponse.
 * @function
 * @param {...PathSet} path - the path(s) to retrieve
 * @return {ModelResponse.<JSONEnvelope>} - the requested data as JSON
 */
Model.prototype.get = function get(...args) {
    var seed = this._seed;
    if (!seed) {
        seed = {};
        seed.__proto__ = FalcorJSON.prototype;
    }
    return new Call('get', this, args)._toJSON(seed, []);
}

/**
 * Sets the value at one or more places in the JSONGraph model. The set method accepts one or more {@link PathValue}s, each of which is a combination of a location in the document and the value to place there.  In addition to accepting  {@link PathValue}s, the set method also returns the values after the set operation is complete.
 * @function
 * @return {ModelResponse.<JSONEnvelope>} - an {@link Observable} stream containing the values in the JSONGraph model after the set was attempted
 */
Model.prototype.set = function set(...args) {
    var seed = {};
    seed.__proto__ = FalcorJSON.prototype;
    return new Call('set', this, args)._toJSON(seed, []);
}

/**
 * The preload method retrieves several {@link Path}s or {@link PathSet}s from a {@link Model} and loads them into the Model cache.
 * @function
 * @param {...PathSet} path - the path(s) to retrieve
 * @return {ModelResponse.<JSONEnvelope>} - a ModelResponse that completes when the data has been loaded into the cache.
 */
Model.prototype.preload = function preload(...args) {
    return new Call('get', this, args)._toJSON(null, []);
}

/**
 * Invokes a function in the JSON Graph.
 * @function
 * @param {Path} functionPath - the path to the function to invoke
 * @param {Array.<Object>} args - the arguments to pass to the function
 * @param {Array.<PathSet>} refPaths - the paths to retrieve from the JSON Graph References in the message returned from the function
 * @param {Array.<PathSet>} thisPaths - the paths to retrieve from function's this object after successful function execution
 * @return {ModelResponse.<JSONEnvelope> - a JSONEnvelope contains the values returned from the function
 */

Model.prototype.call = function call(...args) {
    var seed = {};
    seed.__proto__ = FalcorJSON.prototype;
    return new Call('call', this, args)._toJSON(seed, []);
}

/**
 * The invalidate method synchronously removes several {@link Path}s or {@link PathSet}s from a {@link Model} cache.
 * @function
 * @param {...PathSet} path - the  paths to remove from the {@link Model}'s cache.
 */
Model.prototype.invalidate = function invalidate(...args) {
    return new Call('invalidate', this, args)._toJSON(null, null).then();
}

/**
 * Returns a new {@link Model} bound to a location within the {@link
 * JSONGraph}. The bound location is never a {@link Reference}: any {@link
 * Reference}s encountered while resolving the bound {@link Path} are always
 * replaced with the {@link Reference}s target value. For subsequent operations
 * on the {@link Model}, all paths will be evaluated relative to the bound
 * path. Deref allows you to:
 * - Expose only a fragment of the {@link JSONGraph} to components, rather than
 *   the entire graph
 * - Hide the location of a {@link JSONGraph} fragment from components
 * - Optimize for executing multiple operations and path looksup at/below the
 *   same location in the {@link JSONGraph}
 * @method
 * @param {Object} responseObject - an object previously retrieved from the
 * Model
 * @return {Model} - the dereferenced {@link Model}
 * @example
var Model = falcor.Model;
var model = new Model({
  cache: {
    users: [
      Model.ref(['usersById', 32])
    ],
    usersById: {
      32: {
        name: 'Steve',
        surname: 'McGuire'
      }
    }
  }
});

model.
    get(['users', 0, 'name']).
    subscribe(function(jsonEnv) {
        var userModel = model.deref(jsonEnv.json.users[0]);
        console.log(model.getPath());
        console.log(userModel.getPath());
   });
});

// prints the following:
// []
// ['usersById', 32] - because userModel refers to target of reference at ['users', 0]
 */
Model.prototype.deref = require('./deref');

/**
 * A dereferenced model can become invalid when the reference from which it was
 * built has been removed/collected/expired/etc etc.  To fix the issue, a from
 * the parent request should be made (no parent, then from the root) for a valid
 * path and re-dereference performed to update what the model is bound too.
 *
 * @method
 * @private
 * @return {Boolean} - If the currently deref'd model is still considered a
 * valid deref.
 */
Model.prototype._hasValidParentReference = require('./deref/hasValidParentReference');

/**
 * Get data for a single {@link Path}.
 * @param {Path} path - the path to retrieve
 * @return {Observable.<*>} - the value for the path
 * @example
 var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json') });

 model.
     getValue('user.name').
     subscribe(function(name) {
         console.log(name);
     });

 // The code above prints 'Jim' to the console.
 */
Model.prototype.getValue = function getValue(path) {
    return new Call('get', this, [path])
        ._toJSON({}, [])
        .lift(function(subscriber) {
            return this.subscribe({
                onNext: function(data) {
                    var depth = -1;
                    var x = data.json;
                    var length = path.length;
                    while (x && !x.$type && ++depth < length) {
                        x = x[path[depth]];
                    }
                    subscriber.onNext(x);
                },
                onError: subscriber.onError.bind(subscriber),
                onCompleted: subscriber.onCompleted.bind(subscriber)
            })
        });
}

/**
 * Set value for a single {@link Path}.
 * @param {Path} path - the path to set
 * @param {Object} value - the value to set
 * @return {Observable.<*>} - the value for the path
 * @example
 var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json') });

 model.
     setValue('user.name', 'Jim').
     subscribe(function(name) {
         console.log(name);
     });

 // The code above prints 'Jim' to the console.
 */
Model.prototype.setValue = function setValue(path, value) {
    path = arguments.length === 1 ? path.path : path;
    value = arguments.length === 1 ? path : {path:path,value:value};
    return new Call('set', this, [value])
        ._toJSON({}, [])
        .lift(function(subscriber) {
            return this.subscribe({
                onNext: function(data) {
                    var depth = -1;
                    var x = data.json;
                    var length = path.length;
                    while (x && !x.$type && ++depth < length) {
                        x = x[path[depth]];
                    }
                    subscriber.onNext(x);
                },
                onError: subscriber.onError.bind(subscriber),
                onCompleted: subscriber.onCompleted.bind(subscriber)
            })
        });
}

/**
 * Set the local cache to a {@link JSONGraph} fragment. This method can be a useful way of mocking a remote document, or restoring the local cache from a previously stored state.
 * @param {JSONGraph} jsonGraph - the {@link JSONGraph} fragment to use as the local cache
 */
Model.prototype.setCache = function modelSetCache(cacheOrJSONGraphEnvelope) {

    var modelRoot = this._root;
    var cache = modelRoot.cache;

    if (cacheOrJSONGraphEnvelope !== cache) {

        var options = {
            _path: [],
            _boxed: false,
            _root: modelRoot,
            _materialized: false,
            _treatErrorsAsValues: false
        };

        modelRoot.cache = this._node = {};

        if (typeof cache !== 'undefined') {
            lruCollect(modelRoot, modelRoot.expired, getSize(cache), 0);
            if (this._recycleJSON) {
                this._seed = {};
                this._seed.__proto__ = FalcorJSON.prototype;
            }
        }

        var paths;
        if (isJSONGraphEnvelope(cacheOrJSONGraphEnvelope)) {
            paths = setJSONGraphs(options, [cacheOrJSONGraphEnvelope])[0];
        } else if (isJSONEnvelope(cacheOrJSONGraphEnvelope)) {
            paths = setCache(options, [cacheOrJSONGraphEnvelope])[0];
        } else if (isObject(cacheOrJSONGraphEnvelope)) {
            paths = setCache(options, [{ json: cacheOrJSONGraphEnvelope }])[0];
        }

        // performs promotion without producing output.
        if (paths) {
            getJSON(options, paths, null, false, false);
        }
    } else if (typeof cache === 'undefined') {
        this._root.cache = {};
    }
    return this;
};

/**
 * Get the local {@link JSONGraph} cache. This method can be a useful to store the state of the cache.
 * @param {...Array.<PathSet>} [pathSets] - The path(s) to retrieve. If no paths are specified, the entire {@link JSONGraph} is returned.
 * @return {JSONGraph} all of the {@link JSONGraph} data in the {@link Model} cache.
 * @example
 // Storing the boxshot of the first 10 titles in the first 10 genreLists to local storage.
 localStorage.setItem('cache', JSON.stringify(model.getCache('genreLists[0...10][0...10].boxshot')));
 */
Model.prototype.getCache = function _getCache() {

    var paths = Array.prototype.slice.call(arguments, 0);

    if (paths.length === 0) {
        return getCache(this._root.cache);
    }

    var seed = {};
    seed.__proto__ = FalcorJSON.prototype;

    var env = getJSONGraph({
        _path: [],
        _root: this._root,
        _boxed: this._boxed,
        _materialized: this._materialized,
        _treatErrorsAsValues: this._treatErrorsAsValues
    }, paths, seed).data;

    env.paths = collapse(paths);

    return env;
};

/**
 * Retrieves a number which is incremented every single time a value is changed underneath the Model or the object at an optionally-provided Path beneath the Model.
 * @param {Path?} path - a path at which to retrieve the version number
 * @return {Number} a version number which changes whenever a value is changed underneath the Model or provided Path
 */
Model.prototype.getVersion = function getVersion(path) {
    path = path || [];
    if (Array.isArray(path) === false) {
        throw new Error('Model#getVersion must be called with an Array path.');
    }
    if (this._path.length) {
        path = this._path.concat(path);
    }
    return this._getVersion(this, path);
};

/* eslint-disable guard-for-in */
Model.prototype._clone = function cloneModel(opts) {
    var clone = new Model(this);
    if (opts) {
        for (var key in opts) {
            var value = opts[key];
            if (value === 'delete') {
                delete clone[key];
            } else if (key === '_path') {
                clone[key] = value;
                if (false === opts.hasOwnProperty('_node')) {
                    delete clone['_node'];
                }
            } else {
                clone[key] = value;
            }
        }
    }
    if (clone._path.length > 0) {
        clone.setCache = void 0;
    }
    return clone;
};
/* eslint-enable */

/**
 * Returns a clone of the {@link Model} that enables batching. Within the configured time period, paths for get operations are collected and sent to the {@link DataSource} in a batch. Batching can be more efficient if the {@link DataSource} access the network, potentially reducing the number of HTTP requests to the server.
 * @param {?Scheduler|number} schedulerOrDelay - Either a {@link Scheduler} that determines when to send a batch to the {@link DataSource}, or the number in milliseconds to collect a batch before sending to the {@link DataSource}. If this parameter is omitted, then batch collection ends at the end of the next tick.
 * @return {Model} a Model which schedules a batch of get requests to the DataSource.
 */
Model.prototype.batch = function batch(schedulerOrDelay) {

    var scheduler;

    if (typeof schedulerOrDelay === 'number') {
        scheduler = new TimeoutScheduler(Math.round(Math.abs(schedulerOrDelay)));
    } else if (!schedulerOrDelay) {
        scheduler = new TimeoutScheduler(1);
    } else if (typeof schedulerOrDelay.schedule === 'function') {
        scheduler = schedulerOrDelay;
    } else if (typeof schedulerOrDelay === 'function') {
        scheduler = { scheudle: schedulerOrDelay };
    }

    return this._clone({ _scheduler: scheduler });
};

/**
 * Returns a clone of the {@link Model} that disables batching. This is the default mode. Each get operation will be executed on the {@link DataSource} separately.
 * @name unbatch
 * @memberof Model.prototype
 * @function
 * @return {Model} a {@link Model} that batches requests of the same type and sends them to the data source together
 */
Model.prototype.unbatch = function unbatch() {
    return this._clone({ _scheduler: new ImmediateScheduler() });
};

/**
 * Returns a clone of the {@link Model} that treats errors as values. Errors will be reported in the same callback used to report data. Errors will appear as objects in responses, rather than being sent to the {@link Observable~onErrorCallback} callback of the {@link ModelResponse}.
 * @return {Model}
 */
Model.prototype.treatErrorsAsValues = function treatErrorsAsValues() {
    return this._clone({ _treatErrorsAsValues: true });
};

/**
 * Adapts a Model to the {@link DataSource} interface.
 * @return {DataSource}
 * @example
var model =
    new falcor.Model({
        cache: {
            user: {
                name: 'Steve',
                surname: 'McGuire'
            }
        }
    }),
    proxyModel = new falcor.Model({ source: model.asDataSource() });

// Prints 'Steve'
proxyModel.getValue('user.name').
    then(function(name) {
        console.log(name);
    });
 */
Model.prototype.asDataSource = function asDataSource() {
    return new ModelDataSourceAdapter(this);
};

Model.prototype._materialize = function materialize() {
    return this._clone({
        _materialized: true
    });
};

Model.prototype._dematerialize = function dematerialize() {
    return this._clone({
        _materialized: 'delete'
    });
};

/**
 * Returns a clone of the {@link Model} that boxes values returning the wrapper ({@link Atom}, {@link Reference}, or {@link Error}), rather than the value inside it. This allows any metadata attached to the wrapper to be inspected.
 * @return {Model}
 */
Model.prototype.boxValues = function boxValues() {
    return this._clone({
        _boxed: true
    });
};

/**
 * Returns a clone of the {@link Model} that unboxes values, returning the value inside of the wrapper ({@link Atom}, {@link Reference}, or {@link Error}), rather than the wrapper itself. This is the default mode.
 * @return {Model}
 */
Model.prototype.unboxValues = function unboxValues() {
    return this._clone({
        _boxed: 'delete'
    });
};

/**
 * Returns a clone of the {@link Model} that only uses the local {@link JSONGraph} and never uses a {@link DataSource} to retrieve missing paths.
 * @return {Model}
 */
Model.prototype.withoutDataSource = function withoutDataSource() {
    return this._clone({
        _source: 'delete'
    });
};

/* implement inspect method for node's inspect utility */
Model.prototype.inspect = function inspect() {
    return '{ v: ' + this.getVersion() + ' p: [' + this._path.join(', ') + '] }';
}

Model.prototype.toJSON = function toJSON() {
    return {
        $type: 'ref',
        value: this.getPath()
    };
};

/**
 * Returns the {@link Path} to the object within the JSON Graph that this Model references.
 * @return {Path}
 * @example
var Model = falcor.Model;
var model = new Model({
  cache: {
    users: [
      Model.ref(['usersById', 32])
    ],
    usersById: {
      32: {
        name: 'Steve',
        surname: 'McGuire'
      }
    }
  }
});

model.
    get(['users', 0, 'name']).
    subscribe(function(jsonEnv) {
        var userModel = model.deref(jsonEnv.json.users[0]);
        console.log(model.getPath());
        console.log(userModel.getPath());
   });
});

// prints the following:
// []
// ['usersById', 32] - because userModel refers to target of reference at ['users', 0]
 */
Model.prototype.getPath = function getPath() {
    return this._path.slice(0);
};

/**
 * This one is actually private.  I would not use this without talking to
 * jhusain, sdesai, or michaelbpaulson (github).
 * @private
 */
Model.prototype._fromWhenceYouCame = function fromWhenceYouCame(allow) {
    return this._clone({
        _allowFromWhenceYouCame: allow === undefined ? true : allow
    });
};

Model.prototype._optimizePath = function _optimizePath(path) {
    var node = getCachePosition(this._root.cache, path);
    var abs_path = node && node[f_abs_path] || [];
    return abs_path.slice(0);
};

Model.prototype._getVersion = require('./cache/getVersion');
Model.prototype._getPathValuesAsPathMap = getJSON;
Model.prototype._getPathValuesAsJSONG = getJSONGraph;

Model.prototype._setPathValues = require('./cache/set/setPathValues');
Model.prototype._setPathMaps = require('./cache/set/setPathMaps');
Model.prototype._setJSONGs = require('./cache/set/setJSONGraphs');
Model.prototype._setCache = require('./cache/set/setPathMaps');

Model.prototype._invalidatePathValues = require('./cache/invalidate/invalidatePathSets');
Model.prototype._invalidatePathMaps = require('./cache/invalidate/invalidatePathMaps');
