var ModelResponse = require("./../ModelResponse");
var checkCacheAndReport = require("./checkCacheAndReport");
var getRequestCycle = require("./getRequestCycle");
var noop = require("./../../support/noop");
var empty = { dispose: noop, unsubscribe: noop };
var collectLru = require("./../../lru/collect");
var getSize = require("./../../support/getSize");
var isFunction = require("./../../support/isFunction");

/**
 * The get response.  It takes in a model and paths and starts
 * the request cycle.  It has been optimized for cache first requests
 * and closures.
 * @param {Model} model -
 * @param {Array} paths -
 * @augments ModelResponse
 * @private
 */
var GetResponse = module.exports = function GetResponse(model, paths,
                                                        isJSONGraph,
                                                        isProgressive,
                                                        forceCollect,
                                                        initialCacheVersion,
                                                        recycleJSON) {

    if (paths && paths[0] && Array.isArray(paths[0].$keys)) {
        paths = paths[0];
    }

    this.model = model;
    this.currentRemainingPaths = paths;
    this.isJSONGraph = isJSONGraph || false;
    this.isProgressive = isProgressive || false;
    this.forceCollect = forceCollect || false;
    this.recycleJSON = undefined !== recycleJSON ? recycleJSON : model._recycleJSON;

    var currentVersion = model._root.cache[ƒ_version];

    if (typeof initialCacheVersion === "number") {
        this.initialCacheVersion = initialCacheVersion;
    } else if (typeof currentVersion === "number") {
        this.initialCacheVersion = currentVersion;
    } else {
        this.initialCacheVersion = model._root.version;
    }
};

GetResponse.prototype = Object.create(ModelResponse.prototype);

/**
 * Makes the output of a get response JSONGraph instead of json.
 * @private
 */
GetResponse.prototype._toJSONG = function _toJSONGraph() {
    return new GetResponse(this.model, this.currentRemainingPaths,
                           true, this.isProgressive, this.forceCollect,
                           this.initialCacheVersion, this.recycleJSON);
};

/**
 * Progressively responding to data in the cache instead of once the whole
 * operation is complete.
 * @public
 */
GetResponse.prototype.progressively = function progressively() {
    return new GetResponse(this.model, this.currentRemainingPaths,
                           this.isJSONGraph, true, this.forceCollect,
                           this.initialCacheVersion, this.recycleJSON);
};

/**
 * purely for the purposes of closure creation other than the initial
 * prototype created closure.
 *
 * @private
 */
GetResponse.prototype._subscribe = function _subscribe(observer) {

    var errors = [];
    var model = this.model;
    var modelRoot = model._root;
    var recycleJSON = this.recycleJSON;
    var isProgressive = this.isProgressive;
    var requestedPaths = this.currentRemainingPaths;
    var isJSONG = observer.isJSONG = this.isJSONGraph;
    var shouldRecycleJSONSeed = !isJSONG && !isProgressive && recycleJSON;
    var seed = [!shouldRecycleJSONSeed ? {} :
                 model._seed || (model._seed = {})];

    var results = checkCacheAndReport(model, requestedPaths,
                                      observer, isProgressive,
                                      isJSONG, seed, errors,
                                      recycleJSON);

    // If there are no results, finish.
    if (!results) {

        var modelRoot = model._root;
        var modelCache = modelRoot.cache;
        var currentVersion = modelCache[ƒ_version];

        if (this.forceCollect) {
            collectLru(modelRoot, modelRoot.expired, getSize(modelCache),
                       model._maxSize, model._collectRatio, currentVersion);
        }

        var initialCacheVersion = this.initialCacheVersion;
        var rootOnChangesCompletedHandler = modelRoot.onChangesCompleted;

        if (initialCacheVersion !== currentVersion && (
            modelRoot.syncRefCount <= 0) &&
            isFunction(rootOnChangesCompletedHandler)) {
            rootOnChangesCompletedHandler.call(modelRoot.topLevelModel);
        }
        return empty;
    }

    // Starts the async request cycle.
    return getRequestCycle(this, model, results,
                           observer, errors, 1,
                           this.initialCacheVersion,
                           requestedPaths, recycleJSON);
};
