var Subject = require('./Subject');
var $error = require('../types/error');
var Subscriber = require('./Subscriber');
var Subscription = require('./Subscription');
var InvalidSourceError = require('../errors/InvalidSourceError');

var setJSONGraphs = require('../cache/set/setJSONGraphs');
var setPathValues = require('../cache/set/setPathValues');
var invalidatePaths = require('../cache/invalidate/invalidatePathSets');

var toPaths = require('@graphistry/falcor-path-utils/lib/toPaths');
var toCollapseMap = require('@graphistry/falcor-path-utils/lib/toCollapseMap');
var toCollapseTrees = require('@graphistry/falcor-path-utils/lib/toCollapseTrees');
var hasIntersection = require('@graphistry/falcor-path-utils/lib/hasIntersection');

module.exports = Request;

function Request(type, queue, source, scheduler) {
    Subject.call(this, [], queue);
    this.tree = {};
    this.paths = [];
    this.type = type;
    this.data = null;
    this.active = false;
    this.responded = false;
    this.requested = [];
    this.optimized = [];
    this.disposable = null;
    this.dataSource = source;
    this.scheduler = scheduler;
}

Request.prototype = Object.create(Subject.prototype);

Request.prototype.next =
Request.prototype.onNext = function(env) {

    var queue = this.parent;

    if (!queue) {
        return;
    }

    if (this.responded === false) {
        this.responded = true;
        // Remove this request from the request queue as soon as we get
        // at least one response back. This ensures we won't be the target
        // of in-flight batch requests.
        queue.remove(this);
    }

    var jsonGraph = env.jsonGraph;
    var requested = this.requested;
    var modelRoot = queue.modelRoot;
    var invalidated = env.invalidated;
    var paths = env.paths || this.paths;

    // Run invalidations first.
    if (invalidated && invalidated.length) {
        invalidatePaths({ _root: modelRoot, _path: [] }, invalidated, false);
    }

    if (paths && paths.length && !(!jsonGraph || typeof jsonGraph !== 'object')) {
        setJSONGraphs(
            { _root: modelRoot },
            [{ paths: paths, jsonGraph: jsonGraph }],
            modelRoot.errorSelector, modelRoot.comparator, false
        );
    }

    this.observers.slice(0).forEach(function(observer, index) {
        observer.onNext({
            type: 'get', paths: requested[index] || paths
        });
    });
}

Request.prototype.error =
Request.prototype.onError = function(error) {

    var queue = this.parent;

    if (!queue) {
        return;
    }

    if (this.responded === false) {
        this.responded = true;
        // Remove this request from the request queue as soon as we get
        // at least one response back. This ensures we won't be the target
        // of in-flight batch requests.
        queue.remove(this);
    }

    error = error || {};

    // Converts errors to object we can insert into the cache.
    error = !(error instanceof Error) ?
        // if it's $type error, use it raw
        error.$type === $error && error ||
        // Otherwise make it an error
        { $type: $error, value: error } :
        // If it's instanceof Error, pluck error.message
        { $type: $error, value: { message: error.message }};

    var modelRoot = queue.modelRoot;

    var errorPathValues = toPaths(toCollapseTrees(
        this.requested.reduce(function(collapseMap, paths) {
            return toCollapseMap(paths, collapseMap);
        }, {})
    ))
    .map(function(path) { return { path: path, value: error }; });

    if (errorPathValues.length) {
        setPathValues(
            { _root: modelRoot, _path: [] },
            errorPathValues,
            modelRoot.errorSelector,
            modelRoot.comparator,
            false
        );
    }

    Subject.prototype.onError.call(this, error);
}

Request.prototype.complete =
Request.prototype.onCompleted = function() {
    if (this.responded === false) {
        this.onNext({});
    }
    Subject.prototype.onCompleted.call(this);
}

Request.prototype.remove = function(subscription) {
    var index = this.subscriptions.indexOf(subscription);
    if (~index) {
        this.requested.splice(index, 1);
        this.optimized.splice(index, 1);
        this.observers.splice(index, 1);
        this.subscriptions.splice(index, 1);
    }
    if (this.subscriptions.length === 0) {
        this.dispose();
    }
    return this;
}

Request.prototype.dispose =
Request.prototype.unsubscribe = function () {
    this.tree = {};
    this.data = null;
    this.paths = null;
    this.active = false;
    this.requested = [];
    this.optimized = [];
    var queue = this.parent;
    if (queue) {
        this.parent = null;
        queue.remove(this);
    }
    var disposable = this.disposable;
    if (disposable) {
        this.disposable = null;
        if (disposable.dispose) {
            disposable.dispose();
        } else if (disposable.unsubscribe) {
            disposable.unsubscribe();
        }
    }
    Subject.prototype.dispose.call(this);
}

Request.prototype.connect = function() {
    if (!this.active && !this.disposable) {
        var scheduledDisposable = this.scheduler.schedule(flush.bind(this));
        if (!this.disposable) {
            this.disposable = scheduledDisposable;
        }
    }
    return this;
}

Request.prototype.batch = function(requested, optimized,
                                   requestedComplements,
                                   optimizedComplements) {
    if (this.active) {
        var requestedIntersection = [];
        var optimizedIntersection = [];
        if (findIntersections(this.tree,
                              requested, optimized,
                              requestedComplements,
                              optimizedComplements,
                              requestedIntersection,
                              optimizedIntersection)) {
            this.requested.push(requestedIntersection);
            this.optimized.push(optimizedIntersection);
            return this;
        }
        return null;
    }
    this.requested.push(requested);
    this.optimized.push(optimized);
    return this;
}

function flush() {

    this.active = true;

    var obs, paths = this.paths = toPaths(this.tree = toCollapseTrees(
        this.optimized.reduce(function(collapseMap, paths) {
            return toCollapseMap(paths, collapseMap);
        }, {})
    ));

    try {
        switch (this.type) {
            case 'get':
                obs = this.dataSource.get(paths);
                break;
            case 'set':
                obs = this.dataSource.set({ paths: paths, jsonGraph: this.data });
                break;
            case 'call':
                obs = this.dataSource.call.apply(this.dataSource, this.data);
                break;
        }
        this.disposable = obs.subscribe(this);
    } catch (e) {
        this.disposable = {};
        Subject.prototype.onError.call(this, new InvalidSourceError(e));
    }
}

function findIntersections(tree,
                           requested, optimized,
                           requestedComplements,
                           optimizedComplements,
                           requestedIntersection,
                           optimizedIntersection) {

    var index = -1;
    var complementIndex = -1;
    var intersectionIndex = -1;
    var optTotal = optimized.length;
    var reqTotal = requested.length - 1;

    while (++index < optTotal) {
        var path = optimized[index];
        var pathLen = path.length;
        var subTree = tree[pathLen];
        if (subTree && hasIntersection(subTree, path, 0, pathLen)) {
            optimizedIntersection[++intersectionIndex] = path;
            requestedIntersection[intersectionIndex] = requested[
                index < reqTotal ? index : reqTotal
            ];
        } else {
            optimizedComplements[++complementIndex] = path;
            requestedComplements[complementIndex] = requested[
                index < reqTotal ? index : reqTotal
            ];
        }
    }

    return ~intersectionIndex;
}
