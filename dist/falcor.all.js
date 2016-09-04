/*!
 * Copyright 2015 Netflix, Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.falcor = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var falcor = require(2);
var Router = require(157);

falcor.Router = Router;

module.exports = falcor;

},{"157":157,"2":2}],2:[function(require,module,exports){
var falcor = require(39);
var jsong = require(121);

falcor.atom = jsong.atom;
falcor.ref = jsong.ref;
falcor.error = jsong.error;
falcor.pathValue = jsong.pathValue;

falcor.HttpDataSource = require(220);

module.exports = falcor;

},{"121":121,"220":220,"39":39}],3:[function(require,module,exports){
var ModelRoot = require(5);
var ModelDataSourceAdapter = require(4);

var RequestQueue = require(50);
var ModelResponse = require(58);
var CallResponse = require(56);
var InvalidateResponse = require(57);

var TimeoutScheduler = require(72);
var ImmediateScheduler = require(71);

var arrayClone = require(78);
var arraySlice = require(81);

var collectLru = require(46);
var pathSyntax = require(125);

var getSize = require(86);
var isObject = require(97);
var isFunction = require(93);
var isPrimitive = require(99);
var isJSONEnvelope = require(95);
var isJSONGraphEnvelope = require(96);

var setCache = require(74);
var setJSONGraphs = require(73);
var ID = 0;
var validateInput = require(113);
var noOp = function() {};
var getCache = require(20);
var get = require(25);
var GET_VALID_INPUT = require(65);

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
function Model(o) {

    var options = o || {};
    this._root = options._root || new ModelRoot(options, this);
    this._path = options.path || options._path || [];
    this._source = options.source || options._source;
    this._request = options.request || options._request || new RequestQueue(
        this, options.scheduler || new ImmediateScheduler()
    );
    this._ID = ID++;

    if (typeof options.maxSize === "number") {
        this._maxSize = options.maxSize;
    } else {
        this._maxSize = options._maxSize || Model.prototype._maxSize;
    }

    if (typeof options.collectRatio === "number") {
        this._collectRatio = options.collectRatio;
    } else {
        this._collectRatio = options._collectRatio || Model.prototype._collectRatio;
    }

    if (options.boxed || options.hasOwnProperty("_boxed")) {
        this._boxed = options.boxed || options._boxed;
    }

    if (options.materialized || options.hasOwnProperty("_materialized")) {
        this._materialized = options.materialized || options._materialized;
    }

    if (typeof options.treatErrorsAsValues === "boolean") {
        this._treatErrorsAsValues = options.treatErrorsAsValues;
    } else if (options.hasOwnProperty("_treatErrorsAsValues")) {
        this._treatErrorsAsValues = options._treatErrorsAsValues;
    }

    this._allowFromWhenceYouCame = options.allowFromWhenceYouCame ||
        options._allowFromWhenceYouCame || false;

    if (options.cache) {
        this.setCache(options.cache);
    }
}

Model.prototype.constructor = Model;

Model.prototype._materialized = false;
Model.prototype._boxed = false;
Model.prototype._progressive = false;
Model.prototype._treatErrorsAsValues = false;
Model.prototype._maxSize = Math.pow(2, 53) - 1;
Model.prototype._collectRatio = 0.75;

/**
 * The get method retrieves several {@link Path}s or {@link PathSet}s from a {@link Model}. The get method loads each value into a JSON object and returns in a ModelResponse.
 * @function
 * @param {...PathSet} path - the path(s) to retrieve
 * @return {ModelResponse.<JSONEnvelope>} - the requested data as JSON
 */
Model.prototype.get = require(63);

/**
 * The get method retrieves several {@link Path}s or {@link PathSet}s from a {@link Model}. The get method loads each value into a JSON object and returns in a ModelResponse.
 * @function
 * @private
 * @param {Array.<PathSet>} paths - the path(s) to retrieve
 * @return {ModelResponse.<JSONEnvelope>} - the requested data as JSON
 */
Model.prototype._getWithPaths = require(62);

/**
 * Sets the value at one or more places in the JSONGraph model. The set method accepts one or more {@link PathValue}s, each of which is a combination of a location in the document and the value to place there.  In addition to accepting  {@link PathValue}s, the set method also returns the values after the set operation is complete.
 * @function
 * @return {ModelResponse.<JSONEnvelope>} - an {@link Observable} stream containing the values in the JSONGraph model after the set was attempted
 */
Model.prototype.set = require(67);

/**
 * The preload method retrieves several {@link Path}s or {@link PathSet}s from a {@link Model} and loads them into the Model cache.
 * @function
 * @param {...PathSet} path - the path(s) to retrieve
 * @return {ModelResponse.<JSONEnvelope>} - a ModelResponse that completes when the data has been loaded into the cache.
 */
Model.prototype.preload = function preload() {
    var out = validateInput(arguments, GET_VALID_INPUT, "preload");
    if (out !== true) {
        return new ModelResponse(function(o) {
            o.onError(out);
        });
    }
    var args = Array.prototype.slice.call(arguments);
    var self = this;
    return new ModelResponse(function(obs) {
        return self.get.apply(self, args).subscribe(function() {
        }, function(err) {
            obs.onError(err);
        }, function() {
            obs.onCompleted();
        });
    });
};

/**
 * Invokes a function in the JSON Graph.
 * @function
 * @param {Path} functionPath - the path to the function to invoke
 * @param {Array.<Object>} args - the arguments to pass to the function
 * @param {Array.<PathSet>} refPaths - the paths to retrieve from the JSON Graph References in the message returned from the function
 * @param {Array.<PathSet>} thisPaths - the paths to retrieve from function's this object after successful function execution
 * @return {ModelResponse.<JSONEnvelope> - a JSONEnvelope contains the values returned from the function
 */
Model.prototype.call = function call() {
    var args;
    var argsIdx = -1;
    var argsLen = arguments.length;
    args = new Array(argsLen);
    while (++argsIdx < argsLen) {
        var arg = arguments[argsIdx];
        args[argsIdx] = arg;
        var argType = typeof arg;
        if (argsIdx > 1 && !Array.isArray(arg) ||
            argsIdx === 0 && !Array.isArray(arg) && argType !== "string" ||
            argsIdx === 1 && !Array.isArray(arg) && !isPrimitive(arg)) {
            /* eslint-disable no-loop-func */
            return new ModelResponse(function(o) {
                o.onError(new Error("Invalid argument"));
            });
            /* eslint-enable no-loop-func */
        }
    }

    return new CallResponse(this, args[0], args[1], args[2], args[3]);
};

/**
 * The invalidate method synchronously removes several {@link Path}s or {@link PathSet}s from a {@link Model} cache.
 * @function
 * @param {...PathSet} path - the  paths to remove from the {@link Model}'s cache.
 */
Model.prototype.invalidate = function invalidate() {
    var args;
    var argsIdx = -1;
    var argsLen = arguments.length;
    args = [];
    while (++argsIdx < argsLen) {
        args[argsIdx] = pathSyntax.fromPath(arguments[argsIdx]);
        if (!Array.isArray(args[argsIdx])) {
            throw new Error("Invalid argument");
        }
    }

    // creates the obs, subscribes and will throw the errors if encountered.
    (new InvalidateResponse(this, args)).
        subscribe(noOp, function(e) {
            throw e;
        });
};

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
      Model.ref(["usersById", 32])
    ],
    usersById: {
      32: {
        name: "Steve",
        surname: "McGuire"
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
// ["usersById", 32] - because userModel refers to target of reference at ["users", 0]
 */
Model.prototype.deref = require(8);

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
Model.prototype._hasValidParentReference = require(7);

/**
 * Get data for a single {@link Path}.
 * @param {Path} path - the path to retrieve
 * @return {Observable.<*>} - the value for the path
 * @example
 var model = new falcor.Model({source: new falcor.HttpDataSource("/model.json") });

 model.
     getValue('user.name').
     subscribe(function(name) {
         console.log(name);
     });

 // The code above prints "Jim" to the console.
 */
Model.prototype.getValue = require(22);

/**
 * Set value for a single {@link Path}.
 * @param {Path} path - the path to set
 * @param {Object} value - the value to set
 * @return {Observable.<*>} - the value for the path
 * @example
 var model = new falcor.Model({source: new falcor.HttpDataSource("/model.json") });

 model.
     setValue('user.name', 'Jim').
     subscribe(function(name) {
         console.log(name);
     });

 // The code above prints "Jim" to the console.
 */
Model.prototype.setValue = require(76);

// TODO: Does not throw if given a PathSet rather than a Path, not sure if it should or not.
// TODO: Doc not accurate? I was able to invoke directly against the Model, perhaps because I don't have a data source?
// TODO: Not clear on what it means to "retrieve objects in addition to JSONGraph values"
/**
 * Synchronously retrieves a single path from the local {@link Model} only and will not retrieve missing paths from the {@link DataSource}. This method can only be invoked when the {@link Model} does not have a {@link DataSource} or from within a selector function. See {@link Model.prototype.get}. The getValueSync method differs from the asynchronous get methods (ex. get, getValues) in that it can be used to retrieve objects in addition to JSONGraph values.
 * @method
 * @private
 * @arg {Path} path - the path to retrieve
 * @return {*} - the value for the specified path
 */
Model.prototype._getValueSync = require(38);

/**
 * @private
 */
Model.prototype._setValueSync = require(77);

/**
 * @private
 */
Model.prototype._derefSync = require(9);

/**
 * Set the local cache to a {@link JSONGraph} fragment. This method can be a useful way of mocking a remote document, or restoring the local cache from a previously stored state.
 * @param {JSONGraph} jsonGraph - the {@link JSONGraph} fragment to use as the local cache
 */
Model.prototype.setCache = function modelSetCache(cacheOrJSONGraphEnvelope) {
    var cache = this._root.cache;
    if (cacheOrJSONGraphEnvelope !== cache) {
        var modelRoot = this._root;
        var boundPath = this._path;
        this._path = [];
        this._root.cache = {};
        if (typeof cache !== "undefined") {
            collectLru(modelRoot, modelRoot.expired, getSize(cache), 0);
        }
        var out;
        if (isJSONGraphEnvelope(cacheOrJSONGraphEnvelope)) {
            out = setJSONGraphs(this, [cacheOrJSONGraphEnvelope])[0];
        } else if (isJSONEnvelope(cacheOrJSONGraphEnvelope)) {
            out = setCache(this, [cacheOrJSONGraphEnvelope])[0];
        } else if (isObject(cacheOrJSONGraphEnvelope)) {
            out = setCache(this, [{ json: cacheOrJSONGraphEnvelope }])[0];
        }

        // performs promotion without producing output.
        if (out) {
            get.getWithPathsAsPathMap(this, out, []);
        }
        this._path = boundPath;
    } else if (typeof cache === "undefined") {
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
 localStorage.setItem('cache', JSON.stringify(model.getCache("genreLists[0...10][0...10].boxshot")));
 */
Model.prototype.getCache = function _getCache() {
    var paths = arraySlice(arguments);
    if (paths.length === 0) {
        return getCache(this._root.cache);
    }

    var result = [{}];
    var path = this._path;
    get.getWithPathsAsJSONGraph(this, paths, result);
    this._path = path;
    return result[0].jsonGraph;
};

/**
 * Retrieves a number which is incremented every single time a value is changed underneath the Model or the object at an optionally-provided Path beneath the Model.
 * @param {Path?} path - a path at which to retrieve the version number
 * @return {Number} a version number which changes whenever a value is changed underneath the Model or provided Path
 */
Model.prototype.getVersion = function getVersion(pathArg) {
    var path = pathArg && pathSyntax.fromPath(pathArg) || [];
    if (Array.isArray(path) === false) {
        throw new Error("Model#getVersion must be called with an Array path.");
    }
    if (this._path.length) {
        path = this._path.concat(path);
    }
    return this._getVersion(this, path);
};

Model.prototype._syncCheck = function syncCheck(name) {
    if (Boolean(this._source) && this._root.syncRefCount <= 0 && this._root.unsafeMode === false) {
        throw new Error("Model#" + name + " may only be called within the context of a request selector.");
    }
    return true;
};

/* eslint-disable guard-for-in */
Model.prototype._clone = function cloneModel(opts) {
    var clone = new Model(this);
    for (var key in opts) {
        var value = opts[key];
        if (value === "delete") {
            delete clone[key];
        } else {
            clone[key] = value;
        }
    }
    clone.setCache = void 0;
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

    if (typeof schedulerOrDelay === "number") {
        scheduler = new TimeoutScheduler(Math.round(Math.abs(schedulerOrDelay)));
    } else if (!schedulerOrDelay) {
        scheduler = new TimeoutScheduler(1);
    } else if (isFunction(schedulerOrDelay.schedule)) {
        scheduler = schedulerOrDelay;
    } else if (isFunction(schedulerOrDelay)) {
        scheduler = { scheudle: schedulerOrDelay };
    }

    var clone = this._clone();
    clone._request = new RequestQueue(clone, scheduler);

    return clone;
};

/**
 * Returns a clone of the {@link Model} that disables batching. This is the default mode. Each get operation will be executed on the {@link DataSource} separately.
 * @name unbatch
 * @memberof Model.prototype
 * @function
 * @return {Model} a {@link Model} that batches requests of the same type and sends them to the data source together
 */
Model.prototype.unbatch = function unbatch() {
    var clone = this._clone();
    clone._request = new RequestQueue(clone, new ImmediateScheduler());
    return clone;
};

/**
 * Returns a clone of the {@link Model} that treats errors as values. Errors will be reported in the same callback used to report data. Errors will appear as objects in responses, rather than being sent to the {@link Observable~onErrorCallback} callback of the {@link ModelResponse}.
 * @return {Model}
 */
Model.prototype.treatErrorsAsValues = function treatErrorsAsValues() {
    return this._clone({
        _treatErrorsAsValues: true
    });
};

/**
 * Adapts a Model to the {@link DataSource} interface.
 * @return {DataSource}
 * @example
var model =
    new falcor.Model({
        cache: {
            user: {
                name: "Steve",
                surname: "McGuire"
            }
        }
    }),
    proxyModel = new falcor.Model({ source: model.asDataSource() });

// Prints "Steve"
proxyModel.getValue("user.name").
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
        _materialized: "delete"
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
        _boxed: "delete"
    });
};

/**
 * Returns a clone of the {@link Model} that only uses the local {@link JSONGraph} and never uses a {@link DataSource} to retrieve missing paths.
 * @return {Model}
 */
Model.prototype.withoutDataSource = function withoutDataSource() {
    return this._clone({
        _source: "delete"
    });
};

Model.prototype.toJSON = function toJSON() {
    return {
        $type: "ref",
        value: this._path
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
      Model.ref(["usersById", 32])
    ],
    usersById: {
      32: {
        name: "Steve",
        surname: "McGuire"
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
// ["usersById", 32] - because userModel refers to target of reference at ["users", 0]
 */
Model.prototype.getPath = function getPath() {
    return arrayClone(this._path);
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

Model.prototype._getBoundValue = require(19);
Model.prototype._getVersion = require(24);
Model.prototype.__getValueSync = require(23);

Model.prototype._getPathValuesAsPathMap = get.getWithPathsAsPathMap;
Model.prototype._getPathValuesAsJSONG = get.getWithPathsAsJSONGraph;

Model.prototype._setPathValues = require(75);
Model.prototype._setPathMaps = require(74);
Model.prototype._setJSONGs = require(73);
Model.prototype._setCache = require(74);

Model.prototype._invalidatePathValues = require(45);
Model.prototype._invalidatePathMaps = require(44);

},{"113":113,"125":125,"19":19,"20":20,"22":22,"23":23,"24":24,"25":25,"38":38,"4":4,"44":44,"45":45,"46":46,"5":5,"50":50,"56":56,"57":57,"58":58,"62":62,"63":63,"65":65,"67":67,"7":7,"71":71,"72":72,"73":73,"74":74,"75":75,"76":76,"77":77,"78":78,"8":8,"81":81,"86":86,"9":9,"93":93,"95":95,"96":96,"97":97,"99":99}],4:[function(require,module,exports){
function ModelDataSourceAdapter(model) {
    this._model = model._materialize().boxValues().treatErrorsAsValues();
}

ModelDataSourceAdapter.prototype.get = function get(pathSets) {
    return this._model.get.apply(this._model, pathSets)._toJSONG();
};

ModelDataSourceAdapter.prototype.set = function set(jsongResponse) {
    return this._model.set(jsongResponse)._toJSONG();
};

ModelDataSourceAdapter.prototype.call = function call(path, args, suffixes, paths) {
    var params = [path, args, suffixes].concat(paths);
    return this._model.call.apply(this._model, params)._toJSONG();
};

module.exports = ModelDataSourceAdapter;

},{}],5:[function(require,module,exports){
var hasOwn = require(89);
var isFunction = require(93);

function ModelRoot(o, topLevelModel) {

    var options = o || {};

    this.version = 0;
    this.syncRefCount = 0;
    this.expired = options.expired || [];
    this.unsafeMode = options.unsafeMode || false;
    this.cache = {};
    this.topLevelModel = topLevelModel;

    if (isFunction(options.comparator)) {
        this.comparator = options.comparator;
    }

    if (isFunction(options.branchSelector)) {
        this.branchSelector = options.branchSelector;
    }

    if (isFunction(options.errorSelector)) {
        this.errorSelector = options.errorSelector;
    }

    if (isFunction(options.branchSelector)) {
        this.branchSelector = options.branchSelector;
    }

    if (isFunction(options.onChange)) {
        this.onChange = options.onChange;
    }

    if (isFunction(options.onChangesCompleted)) {
        this.onChangesCompleted = options.onChangesCompleted;
    }
}

ModelRoot.prototype.errorSelector = function errorSelector(x, y) {
    return y;
};

ModelRoot.prototype.comparator = function comparator(cacheNode, messageNode) {
    if (hasOwn(cacheNode, "value") && hasOwn(messageNode, "value")) {
        // They are the same only if the following fields are the same.
        return cacheNode.value === messageNode.value &&
            cacheNode.$type === messageNode.$type &&
            cacheNode.$expires === messageNode.$expires;
    }
    return cacheNode === messageNode;
};

module.exports = ModelRoot;

},{"89":89,"93":93}],6:[function(require,module,exports){
(function (global){
var objectTypes = {
    "boolean": false,
    "function": true,
    "object": true,
    "number": false,
    "string": false,
    "undefined": false
};

/*eslint-disable */
var _root = (objectTypes[typeof self] && self) || (objectTypes[typeof window] && window);
var freeGlobal = objectTypes[typeof global] && global;

if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    _root = freeGlobal;
}
/*eslint-enable */

var _id = 0;

function ensureSymbol(root) {
    if (!root.Symbol) {
        root.Symbol = function symbolFuncPolyfill(description) {
            return "@@Symbol(" + description + "):" + (_id++) + "}";
        };
    }
    return root.Symbol;
}

function ensureObservable(Symbol) {
    /* eslint-disable dot-notation */
    if (!Symbol.observable) {
        if (typeof Symbol.for === "function") {
            Symbol["observable"] = Symbol.for("observable");
        } else {
            Symbol["observable"] = "@@observable";
        }
    }
    /* eslint-disable dot-notation */
}

function symbolForPolyfill(key) {
    return "@@" + key;
}

function ensureFor(Symbol) {
    /* eslint-disable dot-notation */
    if (!Symbol.for) {
        Symbol["for"] = symbolForPolyfill;
    }
    /* eslint-enable dot-notation */
}


function polyfillSymbol(root) {
    var Symbol = ensureSymbol(root);
    ensureObservable(Symbol);
    ensureFor(Symbol);
    return Symbol;
}

module.exports = polyfillSymbol(_root);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
module.exports = function fromWhenceYeCame() {
    var reference = this._referenceContainer;

    // Always true when this mode is false.
    if (!this._allowFromWhenceYouCame) {
        return true;
    }

    // If fromWhenceYouCame is true and the first set of keys did not have
    // a reference, this case can happen.  They are always valid.
    if (reference === true) {
        return true;
    }

    // was invalid before even derefing.
    if (reference === false) {
        return false;
    }

    // Its been disconnected (set over or collected) from the graph.
    if (reference && reference.ツparent === undefined) {
        return false;
    }

    // The reference has expired but has not been collected from the graph.
    if (reference && reference.ツinvalidated) {
        return false;
    }

    return true;
};

},{}],8:[function(require,module,exports){
var InvalidDerefInputError = require(12);
var getCachePosition = require(21);
var CONTAINER_DOES_NOT_EXIST = "e";
var $ref = require(118);

module.exports = function deref(boundJSONArg) {

    var absolutePath = boundJSONArg && boundJSONArg.$__path;
    var refPath = boundJSONArg && boundJSONArg.$__refPath;
    var toReference = boundJSONArg && boundJSONArg.$__toReference;
    var referenceContainer;

    // We deref and then ensure that the reference container is attached to
    // the model.
    if (absolutePath) {
        var validContainer = CONTAINER_DOES_NOT_EXIST;

        if (toReference) {
            validContainer = false;
            referenceContainer = getCachePosition(this._root.cache, toReference);

            // If the reference container is still a sentinel value then compare
            // the reference value with refPath.  If they are the same, then the
            // model is still valid.
            if (refPath && referenceContainer &&
                referenceContainer.$type === $ref) {

                var containerPath = referenceContainer.value;
                var i = 0;
                var len = refPath.length;

                validContainer = true;
                for (; validContainer && i < len; ++i) {
                    if (containerPath[i] !== refPath[i]) {
                        validContainer = false;
                    }
                }
            }
        }

        // Signal to the deref'd model that it has been disconnected from the
        // graph or there is no _fromWhenceYouCame
        if (!validContainer) {
            referenceContainer = false;
        }

        // The container did not exist, therefore there is no reference
        // container and fromWhenceYouCame should always return true.
        else if (validContainer === CONTAINER_DOES_NOT_EXIST) {
            referenceContainer = true;
        }

        return this._clone({
            _path: absolutePath,
            _referenceContainer: referenceContainer
        });
    }

    throw new InvalidDerefInputError();
};

},{"118":118,"12":12,"21":21}],9:[function(require,module,exports){
var pathSyntax = require(125);
var getBoundValue = require(19);
var InvalidModelError = require(14);

module.exports = function derefSync(boundPathArg) {

    var boundPath = pathSyntax.fromPath(boundPathArg);

    if (!Array.isArray(boundPath)) {
        throw new Error("Model#derefSync must be called with an Array path.");
    }

    var boundValue = getBoundValue(this, this._path.concat(boundPath), false);

    var path = boundValue.path;
    var node = boundValue.value;
    var found = boundValue.found;

    // If the node is not found or the node is found but undefined is returned,
    // this happens when a reference is expired.
    if (!found || node === undefined) {
        return undefined;
    }

    if (node.$type) {
        throw new InvalidModelError();
    }

    return this._clone({ _path: path });
};

},{"125":125,"14":14,"19":19}],10:[function(require,module,exports){
var NAME = "BoundJSONGraphModelError";
var MESSAGE = "It is not legal to use the JSON Graph " +
    "format from a bound Model. JSON Graph format" +
    " can only be used from a root model.";

/**
 * When a bound model attempts to retrieve JSONGraph it should throw an
 * error.
 *
 * @private
 */
function BoundJSONGraphModelError() {
    var err = Error.call(this, MESSAGE);
    err.name = this.name;
    this.stack = err.stack;
    this.message = err.message;
    return this;
}

// instanceof will be an error, but stack will be correct because its defined in the constructor.
BoundJSONGraphModelError.prototype = Object.create(Error.prototype);
BoundJSONGraphModelError.prototype.name = NAME;
BoundJSONGraphModelError.message = MESSAGE;

module.exports = BoundJSONGraphModelError;

},{}],11:[function(require,module,exports){
var NAME = "CircularReferenceError";

/**
 * Does not allow null in path
 */
function CircularReferenceError(referencePath) {
    var err = Error.call(this, "Encountered circular reference " +
        JSON.stringify(referencePath));
    err.name = NAME;
    this.stack = err.stack;
    this.message = err.message;
    return this;
}

// instanceof will be an error, but stack will be correct because its defined in the constructor.
CircularReferenceError.prototype = Object.create(Error.prototype);
CircularReferenceError.prototype.name = NAME;

module.exports = CircularReferenceError;

},{}],12:[function(require,module,exports){
var NAME = "InvalidDerefInputError";
var MESSAGE = "Deref can only be used with a non-primitive object from get, set, or call.";

/**
 * An invalid deref input is when deref is used with input that is not generated
 * from a get, set, or a call.
 *
 * @param {String} message
 * @private
 */
function InvalidDerefInputError() {
    var err = Error.call(this, MESSAGE);
    err.name = NAME;
    this.stack = err.stack;
    this.message = err.message;
    return this;
}

// instanceof will be an error, but stack will be correct because its defined in the constructor.
InvalidDerefInputError.prototype = Object.create(Error.prototype);
InvalidDerefInputError.prototype.name = NAME;
InvalidDerefInputError.message = MESSAGE;

module.exports = InvalidDerefInputError;

},{}],13:[function(require,module,exports){
var NAME = "InvalidKeySetError";
var MESSAGE = "Keysets can only contain Keys or Ranges";

/**
 * InvalidKeySetError happens when a dataSource syncronously throws
 * an exception during a get/set/call operation.
 *
 * @param {Error} error - The error that was thrown.
 * @private
 */
function InvalidKeySetError(path, keysOrRanges) {
    var err = Error.call(this,
        "The KeySet " + JSON.stringify(keysOrRanges) +
        " in path " + JSON.stringify(path) + " contains a KeySet. " + MESSAGE);
    err.name = NAME;
    this.stack = err.stack;
    this.message = err.message;
    return this;
}

// instanceof will be an error, but stack will be correct because its defined
// in the constructor.
InvalidKeySetError.prototype = Object.create(Error.prototype);
InvalidKeySetError.prototype.name = NAME;
InvalidKeySetError.is = function(e) {
    return e && e.name === NAME;
};

module.exports = InvalidKeySetError;

},{}],14:[function(require,module,exports){
var NAME = "InvalidModelError";
var MESSAGE = "The boundPath of the model is not valid since a value or error was found before the path end.";

/**
 * An InvalidModelError can only happen when a user binds, whether sync
 * or async to shorted value.  See the unit tests for examples.
 *
 * @param {String} message
 * @private
 */
function InvalidModelError(boundPath, shortedPath) {
    var err = Error.call(this, MESSAGE);
    err.name = NAME;
    this.stack = err.stack;
    this.message = err.message;
    this.boundPath = boundPath;
    this.shortedPath = shortedPath;
    return this;
}

// instanceof will be an error, but stack will be correct because its defined in the constructor.
InvalidModelError.prototype = Object.create(Error.prototype);
InvalidModelError.prototype.name = NAME;
InvalidModelError.message = MESSAGE;

module.exports = InvalidModelError;

},{}],15:[function(require,module,exports){
var NAME = "InvalidSourceError";
var MESSAGE = "An exception was thrown when making a request.";

/**
 * InvalidSourceError happens when a dataSource syncronously throws
 * an exception during a get/set/call operation.
 *
 * @param {Error} error - The error that was thrown.
 * @private
 */
function InvalidSourceError(error) {
    var err = Error.call(this, MESSAGE);
    err.name = NAME;
    this.stack = err.stack;
    this.message = err.message;
    this.innerError = error;
    return this;
}

// instanceof will be an error, but stack will be correct because its defined
// in the constructor.
InvalidSourceError.prototype = Object.create(Error.prototype);
InvalidSourceError.prototype.name = NAME;
InvalidSourceError.is = function(e) {
    return e && e.name === NAME;
};

module.exports = InvalidSourceError;

},{}],16:[function(require,module,exports){
var NAME = "MaxRetryExceededError";
var MESSAGE = "The allowed number of retries have been exceeded.";

/**
 * A request can only be retried up to a specified limit.  Once that
 * limit is exceeded, then an error will be thrown.
 *
 * @private
 */
function MaxRetryExceededError() {
    var err = Error.call(this, MESSAGE);
    err.name = NAME;
    this.stack = err.stack;
    this.message = err.message;
    return this;
}

// instanceof will be an error, but stack will be correct because its defined
// in the constructor.
MaxRetryExceededError.prototype = Object.create(Error.prototype);
MaxRetryExceededError.prototype.name = NAME;
MaxRetryExceededError.is = function(e) {
    return e && e.name === NAME;
};

module.exports = MaxRetryExceededError;

},{}],17:[function(require,module,exports){
var NAME = "NullInPathError";
var MESSAGE = "`null` is not allowed in branch key positions.";

/**
 * Does not allow null in path
 */
function NullInPathError() {
    var err = Error.call(this, MESSAGE);
    err.name = NAME;
    this.stack = err.stack;
    this.message = err.message;
    return this;
}

// instanceof will be an error, but stack will be correct because its defined in the constructor.
NullInPathError.prototype = Object.create(Error.prototype);
NullInPathError.prototype.name = NAME;
NullInPathError.message = MESSAGE;

module.exports = NullInPathError;

},{}],18:[function(require,module,exports){
var unicodePrefix = require(42);

module.exports = clone;

function clone(node) {

    var key, keys = Object.keys(node),
        json = {}, index = -1, length = keys.length;

    while (++index < length) {
        key = keys[index];
        if (key.charAt(0) === unicodePrefix) {
            continue;
        }
        json[key] = node[key];
    }

    return json;
}

},{"42":42}],19:[function(require,module,exports){
var getValueSync = require(23);
var InvalidModelError = require(14);

module.exports = function getBoundValue(model, pathArg, materialized) {

    var path = pathArg;
    var boundPath = pathArg;
    var boxed, treatErrorsAsValues,
        value, shorted, found;

    boxed = model._boxed;
    materialized = model._materialized;
    treatErrorsAsValues = model._treatErrorsAsValues;

    model._boxed = true;
    model._materialized = materialized === undefined || materialized;
    model._treatErrorsAsValues = true;

    value = getValueSync(model, path.concat(null), true);

    model._boxed = boxed;
    model._materialized = materialized;
    model._treatErrorsAsValues = treatErrorsAsValues;

    path = value.optimizedPath;
    shorted = value.shorted;
    found = value.found;
    value = value.value;

    while (path.length && path[path.length - 1] === null) {
        path.pop();
    }

    if (found && shorted) {
        throw new InvalidModelError(boundPath, path);
    }

    return {
        path: path,
        value: value,
        shorted: shorted,
        found: found
    };
};

},{"14":14,"23":23}],20:[function(require,module,exports){
var isInternalKey = require(94);

/**
 * decends and copies the cache.
 */
module.exports = function getCache(cache) {
    var out = {};
    _copyCache(cache, out);

    return out;
};

function cloneBoxedValue(boxedValue) {
    var clonedValue = {};

    var keys = Object.keys(boxedValue);
    var key;
    var i;
    var l;

    for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];

        if (!isInternalKey(key)) {
            clonedValue[key] = boxedValue[key];
        }
    }

    return clonedValue;
}

function _copyCache(node, out, fromKey) {
    // copy and return

    Object.
        keys(node).
        filter(function(k) {
            // Its not an internal key and the node has a value.  In the cache
            // there are 3 possibilities for values.
            // 1: A branch node.
            // 2: A $type-value node.
            // 3: undefined
            // We will strip out 3
            return !isInternalKey(k) && node[k] !== undefined;
        }).
        forEach(function(key) {
            var cacheNext = node[key];
            var outNext = out[key];

            if (!outNext) {
                outNext = out[key] = {};
            }

            // Paste the node into the out cache.
            if (cacheNext.$type) {
                var isObject = cacheNext.value && typeof cacheNext.value === "object";
                var isUserCreatedcacheNext = !cacheNext.ツmodelCreated;
                var value;
                if (isObject || isUserCreatedcacheNext) {
                    value = cloneBoxedValue(cacheNext);
                } else {
                    value = cacheNext.value;
                }

                out[key] = value;
                return;
            }

            _copyCache(cacheNext, outNext, key);
        });
}

},{"94":94}],21:[function(require,module,exports){
/**
 * getCachePosition makes a fast walk to the bound value since all bound
 * paths are the most possible optimized path.
 *
 * @param {Model} model -
 * @param {Array} path -
 * @returns {Mixed} - undefined if there is nothing in this position.
 * @private
 */
module.exports = function getCachePosition(cache, path) {
    var currentCachePosition = cache;
    var depth = -1;
    var maxDepth = path.length;

    // The loop is simple now, we follow the current cache position until
    //
    while (++depth < maxDepth &&
           currentCachePosition && !currentCachePosition.$type) {

        currentCachePosition = currentCachePosition[path[depth]];
    }

    return currentCachePosition;
};

},{}],22:[function(require,module,exports){
var ModelResponse = require(58);
var pathSyntax = require(125);

module.exports = function getValue(path) {
    var parsedPath = pathSyntax.fromPath(path);
    var pathIdx = 0;
    var pathLen = parsedPath.length;
    while (++pathIdx < pathLen) {
        if (typeof parsedPath[pathIdx] === "object") {
            /* eslint-disable no-loop-func */
            return new ModelResponse(function(o) {
                o.onError(new Error("Paths must be simple paths"));
            });
            /* eslint-enable no-loop-func */
        }
    }

    var self = this;
    return new ModelResponse(function(obs) {
        return self.get(parsedPath).subscribe(function(data) {
            var curr = data.json;
            var depth = -1;
            var length = parsedPath.length;

            while (curr && ++depth < length) {
                curr = curr[parsedPath[depth]];
            }
            obs.onNext(curr);
        }, function(err) {
            obs.onError(err);
        }, function() {
            obs.onCompleted();
        });
    });
};

},{"125":125,"58":58}],23:[function(require,module,exports){
var getReferenceTarget = require(27);
var clone = require(18);
var isExpired = require(92);
var promote = require(47);
var $ref = require(118);
var $atom = require(116);
var $error = require(117);

module.exports = function getValueSync(model, simplePath, noClone) {
    var modelRoot = model._root;
    var root = modelRoot.cache;
    var len = simplePath.length;
    var optimizedPath = [];
    var shorted = false, shouldShort = false;
    var depth = 0;
    var key, i, next = root, curr = root, out = root, type, ref, refNode;
    var found = true;
    var expired = false;

    while (next && depth < len) {
        key = simplePath[depth++];
        if (key !== null) {
            next = curr[key];
            optimizedPath[optimizedPath.length] = key;
        }

        if (!next) {
            out = undefined;
            shorted = true;
            found = false;
            break;
        }

        type = next.$type;

        // A materialized item.  There is nothing to deref to.
        if (type === $atom && next.value === undefined) {
            out = undefined;
            found = false;
            shorted = depth < len;
            break;
        }

        // Up to the last key we follow references, ensure that they are not
        // expired either.
        if (depth < len) {
            if (type === $ref) {

                // If the reference is expired then we need to set expired to
                // true.
                if (isExpired(next)) {
                    expired = true;
                    out = undefined;
                    break;
                }

                ref = getReferenceTarget(root, next, modelRoot);
                refNode = ref[0];

                // The next node is also set to undefined because nothing
                // could be found, this reference points to nothing, so
                // nothing must be returned.
                if (!refNode) {
                    out = void 0;
                    next = void 0;
                    found = false;
                    break;
                }
                type = refNode.$type;
                next = refNode;
                optimizedPath = ref[1];
            }

            if (type) {
                break;
            }
        }
        // If there is a value, then we have great success, else, report an undefined.
        else {
            out = next;
        }
        curr = next;
    }

    if (depth < len && !expired) {
        // Unfortunately, if all that follows are nulls, then we have not shorted.
        for (i = depth; i < len; ++i) {
            if (simplePath[depth] !== null) {
                shouldShort = true;
                break;
            }
        }
        // if we should short or report value.  Values are reported on nulls.
        if (shouldShort) {
            shorted = true;
            out = void 0;
        } else {
            out = next;
        }

        for (i = depth; i < len; ++i) {
            if (simplePath[i] !== null) {
                optimizedPath[optimizedPath.length] = simplePath[i];
            }
        }
    }

    // promotes if not expired
    if (out && type) {
        if (isExpired(out)) {
            out = void 0;
        } else {
            promote(model._root, out);
        }
    }

    // if (out && out.$type === $error && !model._treatErrorsAsValues) {
    if (out && type === $error && !model._treatErrorsAsValues) {
        /* eslint-disable no-throw-literal */
        throw {
            path: depth === len ? simplePath : simplePath.slice(0, depth),
            value: out.value
        };
        /* eslint-enable no-throw-literal */
    } else if (out && model._boxed) {
        out = Boolean(type) && !noClone ? clone(out) : out;
    } else if (!out && model._materialized) {
        out = {$type: $atom};
    } else if (out) {
        out = out.value;
    }

    return {
        value: out,
        shorted: shorted,
        optimizedPath: optimizedPath,
        found: found
    };
};

},{"116":116,"117":117,"118":118,"18":18,"27":27,"47":47,"92":92}],24:[function(require,module,exports){
module.exports = function _getVersion(model, path) {
    // ultra fast clone for boxed values.
    var gen = model.__getValueSync({
        _boxed: true,
        _root: model._root,
        _treatErrorsAsValues: model._treatErrorsAsValues
    }, path, true).value;
    var version = gen && gen.ツversion;
    return (version == null) ? -1 : version;
};

},{}],25:[function(require,module,exports){
module.exports = {
    getValueSync: require(23),
    getWithPathsAsPathMap: require(26),
    getWithPathsAsJSONGraph: require(31)
};

},{"23":23,"26":26,"31":31}],26:[function(require,module,exports){
var walkPathAndBuildOutput = require(30);
var getCachePosition = require(21);
var InvalidModelError = require(14);

module.exports = getJSON;

function getJSON(model, paths, values) {

    var node,
        referenceContainer,
        boundPath = model._path,
        modelRoot = model._root,
        cache = modelRoot.cache,
        requestedPath, requestedLength,
        optimizedPath, optimizedLength = boundPath.length;

    // If the model is bound, get the cache position.
    if (optimizedLength) {
        node = getCachePosition(cache, boundPath);
        // If there was a short, then we 'throw an error' to the outside
        // calling function which will onError the observer.
        if (node && node.$type) {
            return {
                criticalError: new InvalidModelError(boundPath, boundPath)
            };
        }
        // We need to get the new cache position and copy the bound path.
        optimizedPath = [];
        for (var i = 0; i < optimizedLength; ++i) {
            optimizedPath[i] = boundPath[i];
        }
        referenceContainer = model._referenceContainer;
    } else {
        node = cache;
        optimizedPath = [];
    }

    requestedPath = [];

    var boxValues = model._boxed,
        expired = modelRoot.expired,
        materialized = model._materialized,
        hasDataSource = Boolean(model._source),
        branchSelector = modelRoot.branchSelector,
        treatErrorsAsValues = model._treatErrorsAsValues,
        allowFromWhenceYouCame = model._allowFromWhenceYouCame,

        seed = values[0],
        json = seed && seed.json,
        results = { values: values },
        path, pathsIndex = -1, pathsCount = paths.length;

    while (++pathsIndex < pathsCount) {
        path = paths[pathsIndex];
        requestedLength = path.length;
        json = walkPathAndBuildOutput(cache, node, json, path,
                                   /* depth = */ 0, seed, results,
                                      requestedPath, requestedLength,
                                      optimizedPath, optimizedLength,
                     /* fromReference = */ false, referenceContainer,
                                      modelRoot, expired, branchSelector,
                                      boxValues, materialized, hasDataSource,
                                      treatErrorsAsValues, allowFromWhenceYouCame);
    }

    if (results.hasValue) {
        seed.json = json;
    }

    return results;
}

},{"14":14,"21":21,"30":30}],27:[function(require,module,exports){
var arr = new Array(3);
var $ref = require(118);
var promote = require(47);
var isExpired = require(92);
var createHardlink = require(83);
var CircularReferenceError = require(11);

module.exports = getReferenceTarget;

/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function getReferenceTarget(root, ref, modelRoot) {

    promote(modelRoot, ref);

    var context,
        key, type, depth = 0,
        followedRefsCount = 0,
        node = root, path = ref.value,
        copy = path, length = path.length;

    do {
        if (depth === 0 && undefined !== (context = ref.ツcontext)) {
            node = context;
            depth = length;
        } else {
            key = path[depth++];
            if (undefined === (node = node[key])) {
                break;
            }
        }

        if (depth === length) {
            type = node.$type;
            // If the reference points to an expired
            // value node, don't create a hard-link.
            if (undefined !== type && isExpired(node)) {
                break;
            }
            // If a reference points to itself, throw an error.
            else if (node === ref) {
                throw new CircularReferenceError(path);
            }
            // If the node we land on isn't the existing ref context,
            // create a hard-link between the reference and the node
            // it points to.
            else if (node !== context) {
                createHardlink(ref, node);
            }

            // If the reference points to another ref, follow the new ref
            // by resetting the relevant state and continuing from the top.
            if (type === $ref) {

                promote(modelRoot, node);

                depth = 0;
                ref = node;
                node = root;
                path = copy = ref.value;
                length = path.length;

                if (DEBUG) {
                    // If we follow too many references, we might have an indirect
                    // circular reference chain. Warn about this (but don't throw).
                    if (++followedRefsCount % 50 === 0) {
                        try {
                            throw new Error(
                                "Followed " + followedRefsCount + " references. " +
                                "This might indicate the presence of an indirect " +
                                "circular reference chain."
                            );
                        } catch (e) {
                            if (console) {
                                var reportFn = ((
                                    typeof console.warn === "function" && console.warn) || (
                                    typeof console.log === "function" && console.log));
                                if (reportFn) {
                                    reportFn.call(console, e.toString());
                                }
                            }
                        }
                    }
                }

                continue;
            }
            break;
        } else if (undefined !== node.$type) {
            break;
        }
    } while (true);

    if (depth < length && undefined !== node) {
        length = depth;
    }

    depth = -1;
    path = new Array(length);
    while (++depth < length) {
        path[depth] = copy[depth];
    }

    arr[0] = node;
    arr[1] = path;
    arr[2] = ref;

    return arr;
}
/* eslint-enable */

},{"11":11,"118":118,"47":47,"83":83,"92":92}],28:[function(require,module,exports){
var clone = require(18);

module.exports = onError;

function onError(node, depth, results,
                 requestedPath, fromReference, boxValues) {

    var index = -1;
    var length = depth + !!fromReference; // depth + 1 if fromReference === true
    var errorPath = new Array(length);
    var errorValue = !boxValues ? node.value : clone(node);

    while (++index < length) {
        errorPath[index] = requestedPath[index];
    }

    (results.errors || (results.errors = [])).push({
        path: errorPath,
        value: errorValue
    });
}


},{"18":18}],29:[function(require,module,exports){
var clone = require(18);
var onError = require(28);
var $atom = require(116);
var $error = require(117);

module.exports = onJSONValue;

function onJSONValue(node, type, depth, seed, results,
                     requestedPath, optimizedPath, optimizedLength,
                     fromReference, boxValues, materialized,
                     treatErrorsAsValues) {

    if ($error === type && !treatErrorsAsValues) {
        return onError(node, depth, results, requestedPath,
                       fromReference, boxValues);
    }

    var value = node && node.value;
    var requiresMaterializedToReport = type && value === undefined;

    if (requiresMaterializedToReport) {
        if (materialized) {
            results.hasValue = true;
            return { $type: $atom };
        }
        return undefined;
    }

    results.hasValue = true;

    // boxValues always clones the node
    if (boxValues) {
        return clone(node);
    }

    return value;
}

},{"116":116,"117":117,"18":18,"28":28}],30:[function(require,module,exports){
var isArray = Array.isArray;
var $ref = require(118);
var onValue = require(29);
var onMissing = require(36);
var onValueType = require(37);
var isExpired = require(92);
var getReferenceTarget = require(27);
var NullInPathError = require(17);
var InvalidKeySetError = require(13);

module.exports = walkPathAndBuildOutput;

/* eslint-disable camelcase */
/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function walkPathAndBuildOutput(cacheRoot, node, json, path,
                                depth, seed, results,
                                requestedPath, requestedLength,
                                optimizedPath, optimizedLength,
                                fromReference, referenceContainer,
                                modelRoot, expired, branchSelector,
                                boxValues, materialized, hasDataSource,
                                treatErrorsAsValues, allowFromWhenceYouCame) {

    var type, refTarget;

    // ============ Check for base cases ================

    // If there's nowhere to go, we've reached a terminal node, or hit
    // the end of the path, stop now. Either build missing paths or report the value.
    if (node === undefined || (
        type = node.$type) || (
        depth === requestedLength)) {
        return onValueType(node, type,
                           path, depth, seed, results,
                           requestedPath, requestedLength,
                           optimizedPath, optimizedLength,
                           fromReference, modelRoot, expired,
                           boxValues, materialized, hasDataSource,
                           treatErrorsAsValues, onValue, onMissing);
    }

    var next, nextKey,
        keyset, keyIsRange,
        nextDepth = depth + 1,
        rangeEnd, keysOrRanges,
        nextJSON, nextReferenceContainer,
        keysetIndex = -1, keysetLength = 0,
        nextOptimizedLength, nextOptimizedPath,
        optimizedLengthNext = optimizedLength + 1;

    keyset = path[depth];

    // If `null` appears before the end of the path, throw an error.
    // If `null` is at the end of the path, but the reference doesn't
    // point to a sentinel value, throw an error.
    //
    // Inserting `null` at the end of the path indicates the target of a ref
    // should be returned, rather than the ref itself. When `null` is the last
    // key, the path is lengthened by one, ensuring that if a ref is encountered
    // just before the `null` key, the reference is followed before terminating.
    if (null === keyset) {
        if (nextDepth < requestedLength) {
            throw new NullInPathError();
        }
        return json;
    }

    // Iterate over every key in the keyset. This loop is perhaps a bit clever,
    // but we do it this way because this is a performance-sensitive code path.
    // This loop simulates a recursive function if we encounter a Keyset that
    // contains Keys or Ranges. This is accomplished by a nifty dance between an
    // outer loop and an inner loop.
    //
    // The outer loop is responsible for identifying if the value at this depth
    // is a Key, Range, or Keyset. If it encounters a Keyset, the `keysetIndex`,
    // `keysetLength`, and `keysOrRanges` variables are assigned and the outer
    // loop restarts. If it encounters a Key or Range, `nextKey`, `keyIsRange`,
    // and `rangeEnd` are assigned values which signal whether the inner loop
    // should iterate a Range or exit after the first run.
    //
    // The inner loop steps `nextKey` one level down in the cache. If a Range
    // was encountered in the outer loop, the inner loop will iterate until the
    // Range has been exhausted. If a Key was encountered, the inner loop exits
    // after the first execution.
    //
    // After the inner loop exits, the outer loop iterates the `keysetIndex`
    // until the Keyset is exhausted. `keysetIndex` and `keysetLength` are
    // initialized to -1 and 0 respectively, so if a Keyset wasn't encountered
    // at this depth in the path, then the outer loop exits after one execution.

    iteratingKeyset: do {

        // If the keyset is a primitive value, we've found our `nextKey`.
        if ("object" !== typeof keyset) {
            nextKey = keyset;
            rangeEnd = undefined;
            keyIsRange = false;
        }
        // If we encounter a Keyset, either iterate through the Keys and Ranges,
        // or throw an error if we're already iterating a Keyset. Keysets cannot
        // contain other Keysets.
        else if (isArray(keyset)) {
            // If we've already encountered an Array keyset, throw an error.
            if (keysOrRanges !== undefined) {
                throw new InvalidKeySetError(path, keysOrRanges);
            }
            keysetIndex = 0;
            keysOrRanges = keyset;
            keysetLength = keyset.length;
            // If an Array of keys or ranges is empty, terminate the graph walk
            // and return the json constructed so far. An example of an empty
            // Keyset is: ['lolomo', [], 'summary']. This should short circuit
            // without building missing paths.
            if (0 === keysetLength) {
                break iteratingKeyset;
            }
            // Assign `keyset` to the first value in the Keyset. Re-entering the
            // outer loop mimics a singly-recursive function call.
            keyset = keysOrRanges[keysetIndex];
            continue iteratingKeyset;
        }
        // If the Keyset isn't a primitive or Array, then it must be a Range.
        else {
            rangeEnd = keyset.to;
            nextKey = keyset.from || 0;
            if ("number" !== typeof rangeEnd) {
                rangeEnd = nextKey + (keyset.length || 0) - 1;
            }
            if ((rangeEnd - nextKey) < 0) {
                break iteratingKeyset;
            }
            keyIsRange = true;
        }

        // Now that we have the next key, step down one level in the cache.
        do {
            fromReference = false;
            nextJSON = json && json[nextKey];
            nextOptimizedPath = optimizedPath;
            nextOptimizedLength = optimizedLengthNext;
            nextReferenceContainer = referenceContainer;

            next = node[nextKey];
            requestedPath[depth] = nextKey;
            optimizedPath[optimizedLength] = nextKey;

            // If we encounter a ref, inline the reference target and continue
            // evaluating the path.
            if (next &&
                nextDepth < requestedLength &&
                // If the reference is expired, it will be invalidated and
                // reported as missing in the next call to walkPath below.
                next.$type === $ref && !isExpired(next)) {

                // Retrieve the reference target and next referenceContainer (if
                // this reference points to other references) and continue
                // following the path. If the reference resolves to a missing
                // path or leaf node, it will be handled in the next call to
                // walkPath.
                refTarget = getReferenceTarget(cacheRoot, next, modelRoot);

                next = refTarget[0];
                fromReference = true;
                nextOptimizedPath = refTarget[1];
                nextReferenceContainer = refTarget[2];
                nextOptimizedLength = nextOptimizedPath.length;
                refTarget[0] = refTarget[1] = refTarget[2] = undefined;
            }

            // Continue following the path

            nextJSON = walkPathAndBuildOutput(
                cacheRoot, next, nextJSON, path, nextDepth, seed,
                results, requestedPath, requestedLength, nextOptimizedPath,
                nextOptimizedLength, fromReference, nextReferenceContainer,
                modelRoot, expired, branchSelector, boxValues, materialized,
                hasDataSource, treatErrorsAsValues, allowFromWhenceYouCame
            );

            // Inspect the return value from the step and determine whether to
            // create or write into the JSON branch at this level.
            //
            // 1. If the next node was a leaf value, nextJSON is the value.
            // 2. If the next node was a missing path, nextJSON is undefined.
            // 3. If the next node was a branch, then nextJSON will either be an
            //    Object or undefined. If nextJSON is undefined, all paths under
            //    this step resolved to missing paths. If it's an Object, then
            //    at least one path resolved to a successful leaf value.
            //
            // This check defers creating branches until we see at least one
            // cache hit. Otherwise, don't waste the cycles creating a branch
            // if everything underneath is a cache miss.

            if (undefined !== nextJSON) {
                // The json value will initially be undefined. If we're here,
                // then at least one leaf value was encountered, so create a
                // branch to contain it.
                if (undefined === json) {
                    // Enable developers to instrument branch node creation by
                    // providing a custom function. If they do, delegate branch
                    // node creation to them.
                    if (branchSelector) {

                        // branchSelector = (
                        //     nodeKey: String|Number|null,
                        //     nodePath: Array|null,
                        //     nodeVersion: Number,
                        //     requestedPath: Array,
                        //     requestedDepth: Number,
                        //     referencePath: Array|null,
                        //     pathToReference: Array|null
                        // ) => Object { $__path?, $__refPath?, $__toReference? }

                        json = branchSelector(node.ツkey,
                                              node.ツabsolutePath,
                                              node.ツversion, path, depth,
                                              allowFromWhenceYouCame && referenceContainer &&
                                                  referenceContainer.value || undefined,
                                              allowFromWhenceYouCame && referenceContainer &&
                                                  referenceContainer.ツabsolutePath || undefined);

                    }
                    // Otherwise, create a branch ourselves and assign the required metadata
                    else {
                        json = {};
                        // Only assign the $__path if this isn't the top-level
                        // branch (e.g. { json: {} <-- this one }).
                        if (depth > 0) {
                            json.$__path = node.ツabsolutePath;
                        }
                        if (allowFromWhenceYouCame && referenceContainer) {
                            json.$__refPath = referenceContainer.value;
                            json.$__toReference = referenceContainer.ツabsolutePath;
                        }
                    }
                }

                // Set the reported branch or leaf into this branch.
                json[nextKey] = nextJSON;
            }

        }
        // Re-enter the inner loop and continue iterating the Range, or exit
        // here if we encountered a Key.
        while (keyIsRange && ++nextKey <= rangeEnd);

        // If we've exhausted the Keyset (or never encountered one at all),
        // exit the outer loop.
        if (++keysetIndex === keysetLength) {
            break iteratingKeyset;
        }

        // Otherwise get the next Key or Range from the Keyset and re-enter the
        // outer loop from the top.
        keyset = keysOrRanges[keysetIndex];
    } while (true);

    // `json` will either be a branch, or undefined if all paths were cache misses
    return json;
}
/* eslint-enable */

},{"118":118,"13":13,"17":17,"27":27,"29":29,"36":36,"37":37,"92":92}],31:[function(require,module,exports){
var walkPathAndBuildOutput = require(35);
var BoundJSONGraphModelError = require(10);

module.exports = getJSONGraph;

function getJSONGraph(model, paths, values) {

    var node, cache,
        boundPath = model._path,
        modelRoot = model._root,
        requestedPath, requestedLength,
        optimizedPath, optimizedLength = boundPath.length;

    // If the model is bound, then get that cache position.
    if (optimizedLength) {
        // JSONGraph output cannot ever be bound or else it will
        // throw an error.
        return {
            criticalError: new BoundJSONGraphModelError()
        };
    } else {
        optimizedPath = [];
        cache = node = modelRoot.cache;
    }

    requestedPath = [];

    var boxValues = model._boxed,
        expired = modelRoot.expired,
        materialized = model._materialized,
        hasDataSource = Boolean(model._source),
        treatErrorsAsValues = model._treatErrorsAsValues,

        seed = values[0],
        results = { values: values },
        path, pathsIndex = -1, pathsCount = paths.length;

    while (++pathsIndex < pathsCount) {
        path = paths[pathsIndex];
        requestedLength = path.length;
        walkPathAndBuildOutput(cache, node, path,
                            /* depth = */ 0, seed, results,
                               requestedPath, requestedLength,
                               optimizedPath, optimizedLength,
              /* fromReference = */ false, modelRoot, expired,
                               boxValues, materialized, hasDataSource,
                               treatErrorsAsValues);
    }

    return results;
}

},{"10":10,"35":35}],32:[function(require,module,exports){
var arr = new Array(2);
var clone = require(18);
var $ref = require(118);
var inlineValue = require(33);
var promote = require(47);
var isExpired = require(92);
var createHardlink = require(83);
var CircularReferenceError = require(11);

module.exports = getReferenceTarget;

/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function getReferenceTarget(root, ref, modelRoot, seed, boxValues, materialized) {

    promote(modelRoot, ref);

    var context,
        key, type, depth = 0,
        followedRefsCount = 0,
        node = root, path = ref.value,
        copy = path, length = path.length;

    do {
        if (depth === 0 && undefined !== (context = ref.ツcontext)) {
            node = context;
            depth = length;
        } else {
            key = path[depth++];
            if (undefined === (node = node[key])) {
                break;
            }
        }

        if (depth === length) {
            type = node.$type;
            // If the reference points to an expired
            // value node, don't create a hard-link.
            if (undefined !== type && isExpired(node)) {
                break;
            }
            // If a reference points to itself, throw an error.
            else if (node === ref) {
                throw new CircularReferenceError(path);
            }
            // If the node we land on isn't the existing ref context,
            // create a hard-link between the reference and the node
            // it points to.
            else if (node !== context) {
                createHardlink(ref, node);
            }

            // If the reference points to another ref, follow the new ref
            // by resetting the relevant state and continuing from the top.
            if (type === $ref) {

                promote(modelRoot, node);

                inlineValue(clone(node), path, length, seed);

                depth = 0;
                ref = node;
                node = root;
                path = copy = ref.value;
                length = path.length;

                if (DEBUG) {
                    // If we follow too many references, we might have an indirect
                    // circular reference chain. Warn about this (but don't throw).
                    if (++followedRefsCount % 50 === 0) {
                        try {
                            throw new Error(
                                "Followed " + followedRefsCount + " references. " +
                                "This might indicate the presence of an indirect " +
                                "circular reference chain."
                            );
                        } catch (e) {
                            if (console) {
                                var reportFn = ((
                                    typeof console.warn === "function" && console.warn) || (
                                    typeof console.log === "function" && console.log));
                                if (reportFn) {
                                    reportFn.call(console, e.toString());
                                }
                            }
                        }
                    }
                }

                continue;
            }
            break;
        } else if (undefined !== node.$type) {
            break;
        }
    } while (true);

    if (depth < length && undefined !== node) {
        length = depth;
    }

    depth = -1;
    path = new Array(length);
    while (++depth < length) {
        path[depth] = copy[depth];
    }

    arr[0] = node;
    arr[1] = path;

    return arr;
}
/* eslint-enable */

},{"11":11,"118":118,"18":18,"33":33,"47":47,"83":83,"92":92}],33:[function(require,module,exports){
module.exports = inlineJSONGraphValue;

/* eslint-disable no-constant-condition */
function inlineJSONGraphValue(node, path, length, seed) {

    var key, depth = 0, prev,
        curr = seed.jsonGraph;

    if (!curr) {
        curr = {};
        seed.jsonGraph = curr;
    }

    do {
        prev = curr;
        key = path[depth++];
        if (depth >= length) {
            curr = prev[key] = node;
            break;
        }
        curr = prev[key] || (prev[key] = {});
    } while (true);

    return curr;
}
/* eslint-enable */

},{}],34:[function(require,module,exports){
var clone = require(18);
var $ref = require(118);
var $atom = require(116);
var $error = require(117);
var inlineValue = require(33);

module.exports = onJSONGraphValue;

function onJSONGraphValue(node, type, depth, seed, results,
                          requestedPath, optimizedPath, optimizedLength,
                          fromReference, boxValues, materialized) {

    var value = node && node.value;
    var requiresMaterializedToReport = type && value === undefined;

    if (requiresMaterializedToReport) {
        if (materialized) {
            value = { $type: $atom };
        } else {
            return undefined;
        }
    }
    // boxValues always clones the node
    else if (boxValues ||
            /*
             * JSON Graph should always clone errors, refs, atoms we didn't
             * create, and atoms we created to wrap Object values.
             */
             $ref === type ||
             $error === type ||
             !node.ツmodelCreated ||
             "object" === typeof value) {
        value = clone(node);
    }

    if (results && requestedPath) {
        results.hasValue = true;
        inlineValue(value, optimizedPath, optimizedLength,
                    seed, boxValues, materialized);
        (seed.paths || (seed.paths = [])).push(
            requestedPath.slice(0, depth + !!fromReference) // depth + 1 if fromReference === true
        );
    }

    return value;
}

},{"116":116,"117":117,"118":118,"18":18,"33":33}],35:[function(require,module,exports){
var isArray = Array.isArray;
var clone = require(18);
var $ref = require(118);
var onValue = require(34);
var onMissing = require(36);
var inlineValue = require(33);
var onValueType = require(37);
var isExpired = require(92);
var getReferenceTarget = require(32);
var NullInPathError = require(17);
var InvalidKeySetError = require(13);

module.exports = walkPathAndBuildOutput;

/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function walkPathAndBuildOutput(cacheRoot, node, path,
                                depth, seed, results,
                                requestedPath, requestedLength,
                                optimizedPath, optimizedLength,
                                fromReference, modelRoot, expired,
                                boxValues, materialized, hasDataSource,
                                treatErrorsAsValues) {

    var type, refTarget;

    // ============ Check for base cases ================

    // If there's nowhere to go, we've reached a terminal node, or hit
    // the end of the path, stop now. Either build missing paths or report the value.
    if (node === undefined || (
        type = node.$type) || (
        depth === requestedLength)) {
        return onValueType(node, type,
                           path, depth, seed, results,
                           requestedPath, requestedLength,
                           optimizedPath, optimizedLength,
                           fromReference, modelRoot, expired,
                           boxValues, materialized, hasDataSource,
                           treatErrorsAsValues, onValue, onMissing);
    }

    var next, nextKey,
        keyset, keyIsRange,
        nextDepth = depth + 1,
        rangeEnd, keysOrRanges,
        keysetIndex = -1, keysetLength = 0,
        nextOptimizedLength, nextOptimizedPath,
        optimizedLengthNext = optimizedLength + 1;

    keyset = path[depth];

    // If `null` appears before the end of the path, throw an error.
    // If `null` is at the end of the path, but the reference doesn't
    // point to a sentinel value, throw an error.
    //
    // Inserting `null` at the end of the path indicates the target of a ref
    // should be returned, rather than the ref itself. When `null` is the last
    // key, the path is lengthened by one, ensuring that if a ref is encountered
    // just before the `null` key, the reference is followed before terminating.
    if (null === keyset) {
        if (nextDepth < requestedLength) {
            throw new NullInPathError();
        }
        return undefined;
    }

    // Iterate over every key in the keyset. This loop is perhaps a bit clever,
    // but we do it this way because this is a performance-sensitive code path.
    // This loop simulates a recursive function if we encounter a Keyset that
    // contains Keys or Ranges. This is accomplished by a nifty dance between an
    // outer loop and an inner loop.
    //
    // The outer loop is responsible for identifying if the value at this depth
    // is a Key, Range, or Keyset. If it encounters a Keyset, the `keysetIndex`,
    // `keysetLength`, and `keysOrRanges` variables are assigned and the outer
    // loop restarts. If it encounters a Key or Range, `nextKey`, `keyIsRange`,
    // and `rangeEnd` are assigned values which signal whether the inner loop
    // should iterate a Range or exit after the first run.
    //
    // The inner loop steps `nextKey` one level down in the cache. If a Range
    // was encountered in the outer loop, the inner loop will iterate until the
    // Range has been exhausted. If a Key was encountered, the inner loop exits
    // after the first execution.
    //
    // After the inner loop exits, the outer loop iterates the `keysetIndex`
    // until the Keyset is exhausted. `keysetIndex` and `keysetLength` are
    // initialized to -1 and 0 respectively, so if a Keyset wasn't encountered
    // at this depth in the path, then the outer loop exits after one execution.

    iteratingKeyset: do {

        // If the keyset is a primitive value, we've found our `nextKey`.
        if ("object" !== typeof keyset) {
            nextKey = keyset;
            rangeEnd = undefined;
            keyIsRange = false;
        }
        // If we encounter a Keyset, either iterate through the Keys and Ranges,
        // or throw an error if we're already iterating a Keyset. Keysets cannot
        // contain other Keysets.
        else if (isArray(keyset)) {
            // If we've already encountered an Array keyset, throw an error.
            if (keysOrRanges !== undefined) {
                throw new InvalidKeySetError(path, keysOrRanges);
            }
            keysetIndex = 0;
            keysOrRanges = keyset;
            keysetLength = keyset.length;
            // If an Array of keys or ranges is empty, terminate the graph walk
            // and return the json constructed so far. An example of an empty
            // Keyset is: ['lolomo', [], 'summary']. This should short circuit
            // without building missing paths.
            if (0 === keysetLength) {
                break iteratingKeyset;
            }
            keyset = keysOrRanges[keysetIndex];
            // Assign `keyset` to the first value in the Keyset. Re-entering the
            // outer loop mimics a singly-recursive function call.
            continue iteratingKeyset;
        }
        // If the Keyset isn't a primitive or Array, then it must be a Range.
        else {
            rangeEnd = keyset.to;
            nextKey = keyset.from || 0;
            if ("number" !== typeof rangeEnd) {
                rangeEnd = nextKey + (keyset.length || 0) - 1;
            }
            if ((rangeEnd - nextKey) < 0) {
                break iteratingKeyset;
            }
            keyIsRange = true;
        }

        // Now that we have the next key, step down one level in the cache.
        do {
            fromReference = false;
            nextOptimizedPath = optimizedPath;
            nextOptimizedLength = optimizedLengthNext;

            next = node[nextKey];
            requestedPath[depth] = nextKey;
            optimizedPath[optimizedLength] = nextKey;

            // If we encounter a ref, inline the reference target and continue
            // evaluating the path.
            if (next &&
                nextDepth < requestedLength &&
                // If the reference is expired, it will be invalidated and
                // reported as missing in the next call to walkPath below.
                next.$type === $ref && !isExpired(next)) {

                // Write the cloned ref value into the jsonGraph at the
                // optimized path. JSONGraph must always clone references.
                inlineValue(clone(next), optimizedPath, nextOptimizedLength, seed);

                // Retrieve the reference target and next referenceContainer (if
                // this reference points to other references) and continue
                // following the path. If the reference resolves to a missing
                // path or leaf node, it will be handled in the next call to
                // walkPath.
                refTarget = getReferenceTarget(cacheRoot, next, modelRoot, seed, boxValues, materialized);

                next = refTarget[0];
                fromReference = true;
                nextOptimizedPath = refTarget[1];
                nextOptimizedLength = nextOptimizedPath.length;
                refTarget[0] = refTarget[1] = undefined;
            }

            walkPathAndBuildOutput(
                cacheRoot, next, path, nextDepth, seed,
                results, requestedPath, requestedLength, nextOptimizedPath,
                nextOptimizedLength, fromReference, modelRoot, expired,
                boxValues, materialized, hasDataSource, treatErrorsAsValues
            );
        }
        // Re-enter the inner loop and continue iterating the Range, or exit
        // here if we encountered a Key.
        while (keyIsRange && ++nextKey <= rangeEnd);

        // If we've exhausted the Keyset (or never encountered one at all),
        // exit the outer loop.
        if (++keysetIndex === keysetLength) {
            break iteratingKeyset;
        }

        // Otherwise get the next Key or Range from the Keyset and re-enter the
        // outer loop from the top.
        keyset = keysOrRanges[keysetIndex];
    } while (true);

    return undefined;
}
/* eslint-enable */

},{"118":118,"13":13,"17":17,"18":18,"32":32,"33":33,"34":34,"36":36,"37":37,"92":92}],36:[function(require,module,exports){
var isArray = Array.isArray;

module.exports = onMissing;

/* eslint-disable no-constant-condition */
function onMissing(path, depth, results,
                   requestedPath, requestedLength,
                   optimizedPath, optimizedLength) {

    var keyset,
        restPathIndex = -1,
        restPathCount = requestedLength - depth,
        restPath = restPathCount && new Array(restPathCount) || undefined;

    while (++restPathIndex < restPathCount) {
        keyset = path[restPathIndex + depth];
        if (isEmptyKeySet(keyset)) {
            return;
        }
        restPath[restPathIndex] = keyset;
    }

    var lastKeyIsNull = keyset === null;
    var missDepth = depth,
        missTotal = requestedLength,
        missingPath = requestedPath,
        missingPaths = results.requestedMissingPaths || (
        results.requestedMissingPaths = []);

    var isRequestedPath = true,
        index, count, mPath;

    do {
        if (restPathCount < requestedLength || !isRequestedPath) {
            index = -1;
            count = missDepth;
            mPath = new Array(missTotal);
            while (++index < count) {
                mPath[index] = missingPath[index];
            }
            restPathIndex = -1;
            while (index < missTotal) {
                mPath[index++] = restPath[++restPathIndex];
            }
            missingPaths.push(mPath);
        } else {
            missingPaths.push(restPath);
        }

        isRequestedPath = !isRequestedPath;

        if (isRequestedPath) {
            break;
        }

        missDepth = optimizedLength;
        missTotal = optimizedLength + restPathCount - Number(lastKeyIsNull);
        missingPath = optimizedPath;
        missingPaths = results.optimizedMissingPaths || (
            results.optimizedMissingPaths = []);
    } while (true);
}
/* eslint-enable */

function isEmptyKeySet(keyset) {

    // false if the keyset is a primitive
    if ("object" !== typeof keyset) {
        return false;
    } else if (keyset === null) {
        return false;
    }

    if (isArray(keyset)) {
        // return true if the keyset is an empty array
        return keyset.length === 0;
    }

    var rangeEnd = keyset.to,
        from = keyset.from || 0;
    if ("number" !== typeof rangeEnd) {
        rangeEnd = from + (keyset.length || 0);
    }

    // false if trying to request incorrect or empty ranges
    // e.g. { from: 10, to: 0 } or { from: 5, length: 0 }
    return from >= rangeEnd;
}

},{}],37:[function(require,module,exports){
var $atom = require(116);
var promote = require(47);
var isExpired = require(92);
var expireNode = require(84);

module.exports = onValueType;

function onValueType(node, type,
                     path, depth, seed, results,
                     requestedPath, requestedLength,
                     optimizedPath, optimizedLength,
                     fromReference, modelRoot, expired,
                     boxValues, materialized, hasDataSource,
                     treatErrorsAsValues, onValue, onMissing) {

    if (!node || !type) {
        if (materialized && !hasDataSource) {
            if (seed) {
                results.hasValue = true;
                return { $type: $atom };
            }
            return undefined;
        } else {
            return onMissing(path, depth, results,
                             requestedPath, requestedLength,
                             optimizedPath, optimizedLength);
        }
    } else if (isExpired(node)) {
        if (!node.ツinvalidated) {
            expireNode(node, expired, modelRoot);
        }
        return onMissing(path, depth, results,
                         requestedPath, requestedLength,
                         optimizedPath, optimizedLength);
    }

    promote(modelRoot, node);

    if (seed) {
        if (fromReference) {
            requestedPath[depth] = null;
        }
        return onValue(node, type, depth, seed, results,
                       requestedPath, optimizedPath, optimizedLength,
                       fromReference, boxValues, materialized, treatErrorsAsValues);
    }

    return undefined;
}

},{"116":116,"47":47,"84":84,"92":92}],38:[function(require,module,exports){
var pathSyntax = require(125);

module.exports = function getValueSync(pathArg) {
    var path = pathSyntax.fromPath(pathArg);
    if (Array.isArray(path) === false) {
        throw new Error("Model#getValueSync must be called with an Array path.");
    }
    if (this._path.length) {
        path = this._path.concat(path);
    }
    this._syncCheck("getValueSync");
    return this.__getValueSync(this, path).value;
};

},{"125":125}],39:[function(require,module,exports){
"use strict";

var Model = require(3);
var internalKeys = require(40);
var QL = require(149);
var jsong = require(121);

function falcor(opts) {
    return new Model(opts);
}

Model.QL = QL;
Model.prototype.QL = QL;

falcor.QL = QL;
falcor.Model = Model;
falcor.ref = Model.ref = jsong.ref;
falcor.atom = Model.atom = jsong.atom;
falcor.error = Model.error = jsong.error;

falcor.pathValue = Model.pathValue = jsong.pathValue;
falcor.pathInvalidation = Model.pathInvalidation = jsong.pathInvalidation;

/**
 * A filtering method for keys from a falcor json response.  The only gotcha
 * to this method is when the incoming json is undefined, then undefined will
 * be returned.
 *
 * @public
 * @param {Object} json - The json response from a falcor model.
 * @returns {Array} - the keys that are in the model response minus the deref
 * _private_ meta data.
 */
falcor.keys = function getJSONKeys(json) {
    if (!json) {
        return undefined;
    }

    return Object.
        keys(json).
        filter(function(key) {
            return !(key in internalKeys);
        });
};

module.exports = falcor;

},{"121":121,"149":149,"3":3,"40":40}],40:[function(require,module,exports){
/**
 * The list of internal keys.  Instead of a bunch of little files,
 * have them as one exports.  This makes the bundling overhead smaller!
 */
module.exports = {
    $__path: "$__path",
    $__refPath: "$__refPath",
    $__version: "$__version",
    $__toReference: "$__toReference"
};

},{}],41:[function(require,module,exports){
module.exports = require(42) + "ref";

},{"42":42}],42:[function(require,module,exports){
module.exports = "ツ";


},{}],43:[function(require,module,exports){
module.exports = require(42) + "version";

},{"42":42}],44:[function(require,module,exports){
var createHardlink = require(83);
var __prefix = require(42);

var $ref = require(118);

var getCachePosition = require(21);

var promote = require(47);
var getSize = require(86);
var hasOwn = require(89);
var isObject = require(97);
var isExpired = require(92);
var isFunction = require(93);
var isPrimitive = require(99);
var expireNode = require(84);
var updateNodeAncestors = require(112);
var removeNodeAndDescendants = require(106);

/**
 * Sets a list of PathMaps into a JSON Graph.
 * @function
 * @param {Object} model - the Model for which to insert the PathMaps.
 * @param {Array.<PathMapEnvelope>} pathMapEnvelopes - the a list of @PathMapEnvelopes to set.
 */

module.exports = function invalidatePathMaps(model, pathMapEnvelopes) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = modelRoot.version++;
    var comparator = modelRoot._comparator;
    var errorSelector = modelRoot._errorSelector;
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = getCachePosition(cache, bound);
    var parent = node.ツparent || cache;
    var initialVersion = cache.ツversion;

    var pathMapIndex = -1;
    var pathMapCount = pathMapEnvelopes.length;

    while (++pathMapIndex < pathMapCount) {

        var pathMapEnvelope = pathMapEnvelopes[pathMapIndex];

        invalidatePathMap(
            pathMapEnvelope.json, 0, cache, parent, node,
            version, expired, lru, comparator, errorSelector
        );
    }

    var newVersion = cache.ツversion;
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }
};

function invalidatePathMap(pathMap, depth, root, parent, node, version, expired, lru, comparator, errorSelector) {

    if (isPrimitive(pathMap) || pathMap.$type) {
        return;
    }

    for (var key in pathMap) {
        if (key[0] !== __prefix && key[0] !== "$" && hasOwn(pathMap, key)) {
            var child = pathMap[key];
            var branch = isObject(child) && !child.$type;
            var results = invalidateNode(
                root, parent, node,
                key, child, branch, false,
                version, expired, lru, comparator, errorSelector
            );
            var nextNode = results[0];
            var nextParent = results[1];
            if (nextNode) {
                if (branch) {
                    invalidatePathMap(
                        child, depth + 1,
                        root, nextParent, nextNode,
                        version, expired, lru, comparator, errorSelector
                    );
                } else if (removeNodeAndDescendants(nextNode, nextParent, key, lru)) {
                    updateNodeAncestors(nextParent, getSize(nextNode), lru, version);
                }
            }
        }
    }
}

function invalidateReference(value, root, node, version, expired, lru, comparator, errorSelector) {

    if (isExpired(node)) {
        expireNode(node, expired, lru);
        return [undefined, root];
    }

    promote(lru, node);

    var container = node;
    var reference = node.value;
    var parent = root;

    node = node.ツcontext;

    if (node != null) {
        parent = node.ツparent || root;
    } else {

        var index = 0;
        var count = reference.length - 1;

        parent = node = root;

        do {
            var key = reference[index];
            var branch = index < count;
            var results = invalidateNode(
                root, parent, node,
                key, value, branch, true,
                version, expired, lru, comparator, errorSelector
            );
            node = results[0];
            if (isPrimitive(node)) {
                return results;
            }
            parent = results[1];
        } while (index++ < count);

        if (container.ツcontext !== node) {
            createHardlink(container, node);
        }
    }

    return [node, parent];
}

function invalidateNode(
    root, parent, node,
    key, value, branch, reference,
    version, expired, lru, comparator, errorSelector) {

    var type = node.$type;

    while (type === $ref) {

        var results = invalidateReference(value, root, node, version, expired, lru, comparator, errorSelector);

        node = results[0];

        if (isPrimitive(node)) {
            return results;
        }

        parent = results[1];
        type = node && node.$type;
    }

    if (type !== void 0) {
        return [node, parent];
    }

    if (key == null) {
        if (branch) {
            throw new Error("`null` is not allowed in branch key positions.");
        } else if (node) {
            key = node.ツkey;
        }
    } else {
        parent = node;
        node = parent[key];
    }

    return [node, parent];
}

},{"106":106,"112":112,"118":118,"21":21,"42":42,"47":47,"83":83,"84":84,"86":86,"89":89,"92":92,"93":93,"97":97,"99":99}],45:[function(require,module,exports){
var __ref = require(41);

var $ref = require(118);

var getCachePosition = require(21);

var promote = require(47);
var getSize = require(86);
var isExpired = require(92);
var isFunction = require(93);
var isPrimitive = require(99);
var expireNode = require(84);
var iterateKeySet = require(136).iterateKeySet;
var updateNodeAncestors = require(112);
var removeNodeAndDescendants = require(106);

/**
 * Invalidates a list of Paths in a JSON Graph.
 * @function
 * @param {Object} model - the Model for which to insert the PathValues.
 * @param {Array.<PathValue>} paths - the PathValues to set.
 */

module.exports = function invalidatePathSets(model, paths) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = modelRoot.version++;
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = getCachePosition(cache, bound);
    var parent = node.ツparent || cache;
    var initialVersion = cache.ツversion;

    var pathIndex = -1;
    var pathCount = paths.length;

    while (++pathIndex < pathCount) {

        var path = paths[pathIndex];

        invalidatePathSet(
            path, 0, cache, parent, node,
            version, expired, lru
        );
    }

    var newVersion = cache.ツversion;
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }
};

function invalidatePathSet(
    path, depth, root, parent, node,
    version, expired, lru) {

    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet(keySet, note);

    do {
        var results = invalidateNode(
            root, parent, node,
            key, branch, false,
            version, expired, lru
        );
        var nextNode = results[0];
        var nextParent = results[1];
        if (nextNode) {
            if (branch) {
                invalidatePathSet(
                    path, depth + 1,
                    root, nextParent, nextNode,
                    version, expired, lru
                );
            } else if (removeNodeAndDescendants(nextNode, nextParent, key, lru)) {
                updateNodeAncestors(nextParent, getSize(nextNode), lru, version);
            }
        }
        key = iterateKeySet(keySet, note);
    } while (!note.done);
}

function invalidateReference(root, node, version, expired, lru) {

    if (isExpired(node)) {
        expireNode(node, expired, lru);
        return [undefined, root];
    }

    promote(lru, node);

    var container = node;
    var reference = node.value;
    var parent = root;

    node = node.ツcontext;

    if (node != null) {
        parent = node.ツparent || root;
    } else {

        var index = 0;
        var count = reference.length - 1;

        parent = node = root;

        do {
            var key = reference[index];
            var branch = index < count;
            var results = invalidateNode(
                root, parent, node,
                key, branch, true,
                version, expired, lru
            );
            node = results[0];
            if (isPrimitive(node)) {
                return results;
            }
            parent = results[1];
        } while (index++ < count);

        if (container.ツcontext !== node) {
            var backRefs = node.ツrefsLength || 0;
            node.ツrefsLength = backRefs + 1;
            node[__ref + backRefs] = container;
            container.ツcontext = node;
            container.ツrefIndex = backRefs;
        }
    }

    return [node, parent];
}

function invalidateNode(
    root, parent, node,
    key, branch, reference,
    version, expired, lru) {

    var type = node.$type;

    while (type === $ref) {

        var results = invalidateReference(root, node, version, expired, lru);

        node = results[0];

        if (isPrimitive(node)) {
            return results;
        }

        parent = results[1];
        type = node.$type;
    }

    if (type !== void 0) {
        return [node, parent];
    }

    if (key == null) {
        if (branch) {
            throw new Error("`null` is not allowed in branch key positions.");
        } else if (node) {
            key = node.ツkey;
        }
    } else {
        parent = node;
        node = parent[key];
    }

    return [node, parent];
}

},{"106":106,"112":112,"118":118,"136":136,"21":21,"41":41,"47":47,"84":84,"86":86,"92":92,"93":93,"99":99}],46:[function(require,module,exports){
var removeNode = require(105);
var updateNodeAncestors = require(112);

module.exports = function collect(lru, expired, totalArg, max, ratioArg, version) {

    var total = totalArg;
    var ratio = ratioArg;

    if (typeof ratio !== "number") {
        ratio = 0.75;
    }

    var shouldUpdate = typeof version === "number";
    var targetSize = max * ratio;
    var parent, node, size;

    node = expired.pop();

    while (node) {
        size = node.$size || 0;
        total -= size;
        if (shouldUpdate === true) {
            updateNodeAncestors(node, size, lru, version);
        } else if (parent = node.ツparent) {  // eslint-disable-line no-cond-assign
            removeNode(node, parent, node.ツkey, lru);
        }
        node = expired.pop();
    }

    if (total >= max) {
        var prev = lru.ツtail;
        node = prev;
        while ((total >= targetSize) && node) {
            prev = prev.ツprev;
            size = node.$size || 0;
            total -= size;
            if (shouldUpdate === true) {
                updateNodeAncestors(node, size, lru, version);
            }
            node = prev;
        }

        lru.ツtail = lru.ツprev = node;
        if (node == null) {
            lru.ツhead = lru.ツnext = undefined;
        } else {
            node.ツnext = undefined;
        }
    }
};

},{"105":105,"112":112}],47:[function(require,module,exports){
var EXPIRES_NEVER = require(119);

// [H] -> Next -> ... -> [T]
// [T] -> Prev -> ... -> [H]
module.exports = function lruPromote(root, object) {
    // Never promote node.$expires === 1.  They cannot expire.
    if (object.$expires === EXPIRES_NEVER) {
        return;
    }

    var head = root.ツhead;

    // Nothing is in the cache.
    if (!head) {
        root.ツhead = root.ツtail = object;
        return;
    }

    if (head === object) {
        return;
    }

    // The item always exist in the cache since to get anything in the
    // cache it first must go through set.
    var prev = object.ツprev;
    var next = object.ツnext;
    if (next) {
        next.ツprev = prev;
    }
    if (prev) {
        prev.ツnext = next;
    }
    object.ツprev = undefined;

    // Insert into head position
    root.ツhead = object;
    object.ツnext = head;
    head.ツprev = object;

    // If the item we promoted was the tail, then set prev to tail.
    if (object === root.ツtail) {
        root.ツtail = prev;
    }
};

},{"119":119}],48:[function(require,module,exports){
module.exports = function lruSplice(root, object) {

    // Its in the cache.  Splice out.
    var prev = object.ツprev;
    var next = object.ツnext;
    if (next) {
        next.ツprev = prev;
    }
    if (prev) {
        prev.ツnext = next;
    }
    object.ツprev = object.ツnext = undefined;

    if (object === root.ツhead) {
        root.ツhead = next;
    }
    if (object === root.ツtail) {
        root.ツtail = prev;
    }
};

},{}],49:[function(require,module,exports){
var complement = require(52);
var flushGetRequest = require(53);
var REQUEST_ID = 0;
var GetRequestType = require(51).GetRequest;
var setJSONGraphs = require(73);
var setPathValues = require(75);
var noop = require(102);
var $error = require(117);
var emptyArray = [];
var InvalidSourceError = require(15);

/**
 * Creates a new GetRequest.  This GetRequest takes a scheduler and
 * the request queue.  Once the scheduler fires, all batched requests
 * will be sent to the server.  Upon request completion, the data is
 * merged back into the cache and all callbacks are notified.
 *
 * @param {Scheduler} scheduler -
 * @param {RequestQueueV2} requestQueue -
 */
var GetRequestV2 = function(scheduler, requestQueue) {
    this.sent = false;
    this.scheduled = false;
    this.requestQueue = requestQueue;
    this.id = ++REQUEST_ID;
    this.type = GetRequestType;

    this._scheduler = scheduler;
    this._pathMap = {};
    this._optimizedPaths = [];
    this._requestedPaths = [];
    this._callbacks = [];
    this._count = 0;
    this._disposable = null;
    this._collapsed = null;
    this._disposed = false;
};

GetRequestV2.prototype = {
    /**
     * batches the paths that are passed in.  Once the request is complete,
     * all callbacks will be called and the request will be removed from
     * parent queue.
     * @param {Array} requestedPaths -
     * @param {Array} optimizedPaths -
     * @param {Function} callback -
     */
    batch: function(requestedPaths, optimizedPaths, callback) {
        var self = this;
        var oPaths = self._optimizedPaths;
        var rPaths = self._requestedPaths;
        var callbacks = self._callbacks;
        var idx = oPaths.length;

        // If its not sent, simply add it to the requested paths
        // and callbacks.
        oPaths[idx] = optimizedPaths;
        rPaths[idx] = requestedPaths;
        callbacks[idx] = callback;
        ++self._count;

        // If it has not been scheduled, then schedule the action
        if (!self.scheduled) {
            self.scheduled = true;

            var flushedDisposable;
            var scheduleDisposable = self._scheduler.schedule(function() {
                self._disposable = flushedDisposable = interopDisposable(
                    flushGetRequest(self, oPaths, function(err, data) {
                        var i, fn, len;
                        self.requestQueue.removeRequest(self);
                        self._disposed = true;

                        if (err instanceof InvalidSourceError) {
                            for (i = 0, len = callbacks.length; i < len; ++i) {
                                fn = callbacks[i];
                                if (fn) {
                                    fn(err);
                                }
                            }
                            return;
                        }

                        // If there is at least one callback remaining, then
                        // callback the callbacks.
                        if (self._count) {
                            self._merge(rPaths, err, data);

                            // Call the callbacks.  The first one inserts all
                            // the data so that the rest do not have consider
                            // if their data is present or not.
                            for (i = 0, len = callbacks.length; i < len; ++i) {
                                fn = callbacks[i];
                                if (fn) {
                                    fn(err, data);
                                }
                            }
                        }
                    }));
            });

            // There is a race condition here. If the scheduler is sync then it
            // exposes a condition where the flush request cannot be disposed.
            // To correct this issue, if there is no flushedDisposable, then the
            // scheduler is async and should use scheduler disposable, else use
            // the flushedDisposable.
            self._disposable = interopDisposable(flushedDisposable || scheduleDisposable);
        }

        // Disposes this batched request.  This does not mean that the
        // entire request has been disposed, but just the local one, if all
        // requests are disposed, then the outer disposable will be removed.
        return createDisposable(self, idx);
    },

    /**
     * Attempts to add paths to the outgoing request.  If there are added
     * paths then the request callback will be added to the callback list.
     *
     * @returns {Array} - the remaining paths in the request.
     */
    add: function(requested, optimized, callback) {
        // uses the length tree complement calculator.
        var self = this;
        var complementTuple = complement(requested, optimized, self._pathMap);
        var optimizedComplement;
        var requestedComplement;

        if (complementTuple) {
            requestedComplement = complementTuple[2];
            optimizedComplement = complementTuple[1];
        } else {
            requestedComplement = requested;
            optimizedComplement = optimized;
        }

        var inserted = false;
        var disposable = false;

        // If the out paths is less than the passed in paths, then there
        // has been an intersection and the complement has been returned.
        // Therefore, this can be deduped across requests.
        if (optimizedComplement.length < optimized.length) {
            inserted = true;
            var idx = self._callbacks.length;
            self._callbacks[idx] = callback;
            self._requestedPaths[idx] = complementTuple[0];
            self._optimizedPaths[idx] = [];
            ++self._count;

            disposable = createDisposable(self, idx);
        }

        return [inserted, requestedComplement, optimizedComplement, disposable];
    },

    /**
     * merges the response into the model"s cache.
     */
    _merge: function(requested, err, data) {
        var self = this;
        var model = self.requestQueue.model;
        var modelRoot = model._root;
        var errorSelector = modelRoot.errorSelector;
        var comparator = modelRoot.comparator;
        var boundPath = model._path;

        model._path = emptyArray;

        // flatten all the requested paths, adds them to the
        var nextPaths = flattenRequestedPaths(requested);

        // Insert errors in every requested position.
        if (err) {
            var error = err;

            // Converts errors to objects, a more friendly storage
            // of errors.
            if (error instanceof Error) {
                error = {
                    message: error.message
                };
            }

            // Not all errors are value $types.
            if (!error.$type) {
                error = {
                    $type: $error,
                    value: error
                };
            }

            var pathValues = nextPaths.map(function(x) {
                return {
                    path: x,
                    value: error
                };
            });
            setPathValues(model, pathValues, errorSelector, comparator);
        }

        // Insert the jsonGraph from the dataSource.
        else {
            setJSONGraphs(model, [{
                paths: nextPaths,
                jsonGraph: data.jsonGraph
            }], errorSelector, comparator);
        }

        // return the model"s boundPath
        model._path = boundPath;
    }
};

// Creates a more efficient closure of the things that are
// needed.  So the request and the idx.  Also prevents code
// duplication.
function createDisposable(request, idx) {
    var disposed = false;
    return function() {
        if (disposed || request._disposed) {
            return;
        }

        disposed = true;
        request._callbacks[idx] = null;
        request._optimizedPaths[idx] = [];
        request._requestedPaths[idx] = [];

        // If there are no more requests, then dispose all of the request.
        var count = --request._count;
        if (count === 0) {
            request._disposable.dispose();
            request.requestQueue.removeRequest(request);
        }
    };
}

function flattenRequestedPaths(requested) {
    var out = [];
    var outLen = -1;
    for (var i = 0, len = requested.length; i < len; ++i) {
        var paths = requested[i];
        for (var j = 0, innerLen = paths.length; j < innerLen; ++j) {
            out[++outLen] = paths[j];
        }
    }
    return out;
}

function interopDisposable(disposable) {
    if (!disposable) {
        return { dispose: noop, unsubscribe: noop };
    }
    if (!disposable.unsubscribe) {
        disposable.unsubscribe = disposable.dispose;
    } else if (!disposable.dispose) {
        disposable.dispose = disposable.unsubscribe;
    }
    return disposable;
}

module.exports = GetRequestV2;

},{"102":102,"117":117,"15":15,"51":51,"52":52,"53":53,"73":73,"75":75}],50:[function(require,module,exports){
var RequestTypes = require(51);
var sendSetRequest = require(54);
var GetRequest = require(49);
var falcorPathUtils = require(136);

/**
 * The request queue is responsible for queuing the operations to
 * the model"s dataSource.
 *
 * @param {Model} model -
 * @param {Scheduler} scheduler -
 */
function RequestQueueV2(model, scheduler) {
    this.model = model;
    this.scheduler = scheduler;
    this.requests = this._requests = [];
}

RequestQueueV2.prototype = {
    /**
     * Sets the scheduler, but will not affect any current requests.
     */
    setScheduler: function(scheduler) {
        this.scheduler = scheduler;
    },

    /**
     * performs a set against the dataSource.  Sets, though are not batched
     * currently could be batched potentially in the future.  Since no batching
     * is required the setRequest action is simplified significantly.
     *
     * @param {JSONGraphEnvelope) jsonGraph -
     */
    set: function(jsonGraph, cb) {
        jsonGraph.paths = falcorPathUtils.collapse(jsonGraph.paths);
        return sendSetRequest(jsonGraph, this.model, cb);
    },

    /**
     * Creates a get request to the dataSource.  Depending on the current
     * scheduler is how the getRequest will be flushed.
     * @param {Array} requestedPaths -
     * @param {Array} optimizedPaths -
     * @param {Function} cb -
     */
    get: function(requestedPaths, optimizedPaths, cb) {
        var self = this;
        var disposables = [];
        var count = 0;
        var requests = self._requests;
        var i, len;
        var oRemainingPaths = optimizedPaths;
        var rRemainingPaths = requestedPaths;
        var disposed = false;
        var request;

        for (i = 0, len = requests.length; i < len; ++i) {
            request = requests[i];
            if (request.type !== RequestTypes.GetRequest) {
                continue;
            }

            // The request has been sent, attempt to jump on the request
            // if possible.
            if (request.sent) {
                var results = request.add(
                    rRemainingPaths, oRemainingPaths, refCountCallback);

                // Checks to see if the results were successfully inserted
                // into the outgoing results.  Then our paths will be reduced
                // to the complement.
                if (results[0]) {
                    rRemainingPaths = results[1];
                    oRemainingPaths = results[2];
                    disposables[disposables.length] = results[3];
                    ++count;
                }
            }

            // If there is a non sent request, then we can batch and leave.
            else {
                request.batch(
                    rRemainingPaths, oRemainingPaths, refCountCallback);
                oRemainingPaths = [];
                rRemainingPaths = [];
                ++count;
            }

            // If there are no more remaining paths then exit the loop.
            if (!oRemainingPaths.length) {
                break;
            }
        }

        // After going through all the available requests if there are more
        // paths to process then a new request must be made.
        if (oRemainingPaths.length) {
            request = new GetRequest(self.scheduler, self);
            requests[requests.length] = request;
            ++count;
            var disposable = request.batch(
                rRemainingPaths, oRemainingPaths, refCountCallback);
            disposables[disposables.length] = disposable;
        }

        // This is a simple refCount callback.
        function refCountCallback(err) {
            if (disposed) {
                return;
            }

            --count;

            // If the count becomes 0, then its time to notify the
            // listener that the request is done.
            if (count === 0) {
                cb(err);
            }
        }

        // When disposing the request all of the outbound requests will be
        // disposed of.
        return function() {
            if (disposed || count === 0) {
                return;
            }

            disposed = true;
            var length = disposables.length;
            for (var idx = 0; idx < length; ++idx) {
                disposables[idx]();
            }
        };
    },

    /**
     * Removes the request from the request
     */
    removeRequest: function(request) {
        var requests = this._requests;
        var i = requests.length;
        while (--i >= 0) {
            if (requests[i].id === request.id) {
                requests.splice(i, 1);
                break;
            }
        }
    }
};

module.exports = RequestQueueV2;

},{"136":136,"49":49,"51":51,"54":54}],51:[function(require,module,exports){
module.exports = {
    GetRequest: "GET"
};

},{}],52:[function(require,module,exports){
var hasIntersection = require(136).hasIntersection;
var arraySlice = require(81);

/**
 * creates the complement of the requested and optimized paths
 * based on the provided tree.
 *
 * If there is no complement then this is just a glorified
 * array copy.
 */
module.exports = function complement(requested, optimized, tree) {
    var optimizedComplement = [];
    var requestedComplement = [];
    var requestedIntersection = [];
    var intersectionLength = -1, complementLength = -1;
    var intersectionFound = false;

    for (var i = 0, len = optimized.length; i < len; ++i) {
        // If this does not intersect then add it to the output.
        var path = optimized[i];
        var subTree = tree[path.length];

        // If there is no subtree to look into or there is no intersection.
        if (!subTree || !hasIntersection(subTree, path, 0, path.length)) {

            if (intersectionFound) {
                optimizedComplement[++complementLength] = path;
                requestedComplement[complementLength] = requested[i];
            }
        } else {
            // If there has been no intersection yet and
            // i is bigger than 0 (meaning we have had only complements)
            // then we need to update our complements to match the current
            // reality.
            if (!intersectionFound && i > 0) {
                requestedComplement = arraySlice(requested, 0, i);
                optimizedComplement = arraySlice(optimized, 0, i);
            }

            requestedIntersection[++intersectionLength] = requested[i];
            intersectionFound = true;
        }
    }

    if (!intersectionFound) {
        return null;
    }

    return [requestedIntersection, optimizedComplement, requestedComplement ];
};

},{"136":136,"81":81}],53:[function(require,module,exports){
var pathUtils = require(136);
var toTree = pathUtils.toTree;
var toPaths = pathUtils.toPaths;
var InvalidSourceError = require(15);

/**
 * Flushes the current set of requests.  This will send the paths to the
 * dataSource.  * The results of the dataSource will be sent to callback which
 * should perform the zip of all callbacks.
 * @param {GetRequest} request -
 * @param {Array} listOfPaths -
 * @param {Function} callback -
 * @private
 */
module.exports = function flushGetRequest(request, listOfPaths, callback) {
    if (request._count === 0) {
        request.requestQueue.removeRequest(request);
        return null;
    }

    request.sent = true;
    request.scheduled = false;

    // TODO: Move this to the collapse algorithm,
    // TODO: we should have a collapse that returns the paths and
    // TODO: the trees.

    // Take all the paths and add them to the pathMap by length.
    // Since its a list of paths
    var pathMap = request._pathMap;
    var listKeys = Object.keys(listOfPaths);
    var listIdx = 0, listLen = listKeys.length;
    for (; listIdx < listLen; ++listIdx) {
        var paths = listOfPaths[listIdx];
        for (var j = 0, pathLen = paths.length; j < pathLen; ++j) {
            var pathSet = paths[j];
            var len = pathSet.length;

            if (!pathMap[len]) {
                pathMap[len] = [pathSet];
            } else {
                var pathSetsByLength = pathMap[len];
                pathSetsByLength[pathSetsByLength.length] = pathSet;
            }
        }
    }

    // now that we have them all by length, convert each to a tree.
    var pathMapKeys = Object.keys(pathMap);
    var pathMapIdx = 0, pathMapLen = pathMapKeys.length;
    for (; pathMapIdx < pathMapLen; ++pathMapIdx) {
        var pathMapKey = pathMapKeys[pathMapIdx];
        pathMap[pathMapKey] = toTree(pathMap[pathMapKey]);
    }

    // Take the pathMapTree and create the collapsed paths and send those
    // off to the server.
    var collapsedPaths = request._collasped = toPaths(pathMap);
    var jsonGraphData;

    // Make the request.
    // You are probably wondering why this is not cancellable.  If a request
    // goes out, and all the requests are removed, the request should not be
    // cancelled.  The reasoning is that another request could come in, after
    // all callbacks have been removed and be deduped.  Might as well keep this
    // around until it comes back.  If at that point there are no requests then
    // we cancel at the callback above.
    var getRequest;
    try {
        getRequest = request.
            requestQueue.
            model._source.
            get(collapsedPaths);
    } catch (e) {
        callback(new InvalidSourceError());
        return null;
    }

    // Ensures that the disposable is available for the outside to cancel.
    var disposable = getRequest.
        subscribe(function(data) {
            jsonGraphData = data;
        }, function(err) {
            callback(err, jsonGraphData);
        }, function() {
            callback(null, jsonGraphData);
        });

    return disposable;
};


},{"136":136,"15":15}],54:[function(require,module,exports){
var arrayMap = require(80);
var setJSONGraphs = require(73);
var setPathValues = require(75);
var InvalidSourceError = require(15);

var emptyArray = [];
var emptyDisposable = {dispose: function() {}};

/**
 * A set request is not an object like GetRequest.  It simply only needs to
 * close over a couple values and its never batched together (at least not now).
 *
 * @private
 * @param {JSONGraphEnvelope} jsonGraph -
 * @param {Model} model -
 * @param {Function} callback -
 */
var sendSetRequest = function(originalJsonGraph, model, callback) {
    var paths = originalJsonGraph.paths;
    var modelRoot = model._root;
    var errorSelector = modelRoot.errorSelector;
    var comparator = modelRoot.comparator;
    var boundPath = model._path;
    var resultingJsonGraphEnvelope;

    // This is analogous to GetRequest _merge / flushGetRequest
    // SetRequests are just considerably simplier.
    var setObservable;
    try {
        setObservable = model._source.
            set(originalJsonGraph);
    } catch (e) {
        callback(new InvalidSourceError());
        return emptyDisposable;
    }

    var disposable = setObservable.
        subscribe(function onNext(jsonGraphEnvelope) {
            // When disposed, no data is inserted into.  This can sync resolve
            // and if thats the case then its undefined.
            if (disposable && disposable.disposed) {
                return;
            }

            // onNext will insert all data into the model then save the json
            // envelope from the incoming result.
            model._path = emptyArray;

            var successfulPaths = setJSONGraphs(model, [{
                paths: paths,
                jsonGraph: jsonGraphEnvelope.jsonGraph
            }], errorSelector, comparator);

            jsonGraphEnvelope.paths = successfulPaths[1];

            model._path = boundPath;
            resultingJsonGraphEnvelope = jsonGraphEnvelope;
        }, function onError(dataSourceError) {
            if (disposable && disposable.disposed) {
                return;
            }
            model._path = emptyArray;

            setPathValues(model, arrayMap(paths, function(path) {
                return {
                    path: path,
                    value: dataSourceError
                };
            }), errorSelector, comparator);

            model._path = boundPath;

            callback(dataSourceError);
        }, function onCompleted() {
            callback(null, resultingJsonGraphEnvelope);
        });

    return disposable;
};

module.exports = sendSetRequest;

},{"15":15,"73":73,"75":75,"80":80}],55:[function(require,module,exports){
/**
 * Will allow for state tracking of the current disposable.  Also fulfills the
 * disposable interface.
 * @private
 */
var AssignableDisposable = function AssignableDisposable(disosableCallback) {
    this.disposed = false;
    this.currentDisposable = disosableCallback;
};


AssignableDisposable.prototype = {

    unsubscribe: function unsubscribe() {
        return this.dispose();
    },
    /**
     * Disposes of the current disposable.  This would be the getRequestCycle
     * disposable.
     */
    dispose: function dispose() {

        if (this.disposed || !this.currentDisposable) {
            return;
        }

        this.disposed = true;

        // If the current disposable fulfills the disposable interface or just
        // a disposable function.
        var currentDisposable = this.currentDisposable;
        this.currentDisposable = null;

        if (currentDisposable.dispose) {
            currentDisposable.dispose();
        } else if (currentDisposable.unsubscribe) {
            currentDisposable.unsubscribe();
        } else if (typeof currentDisposable === "function") {
            currentDisposable();
        }
    }
};


module.exports = AssignableDisposable;

},{}],56:[function(require,module,exports){
var SetResponse = require(66);
var ModelResponse = require(58);
var InvalidSourceError = require(15);

var pathSyntax = require(125);
var __version = require(43);

/**
 * @private
 * @augments ModelResponse
 */
function CallResponse(model, callPath, args, suffix, paths) {
    this.callPath = pathSyntax.fromPath(callPath);
    this.args = args;

    if (paths) {
        this.paths = paths.map(pathSyntax.fromPath);
    }
    if (suffix) {
        this.suffix = suffix.map(pathSyntax.fromPath);
    }
    this.model = model;

    var currentVersion = model._root.cache[__version];

    if (typeof currentVersion === "number") {
        this.initialCacheVersion = currentVersion;
    } else {
        this.initialCacheVersion = model._root.version;
    }
}

CallResponse.prototype = Object.create(ModelResponse.prototype);
CallResponse.prototype._subscribe = function _subscribe(observer) {
    var callPath = this.callPath;
    var callArgs = this.args;
    var suffixes = this.suffix;
    var extraPaths = this.paths;
    var model = this.model;
    var rootModel = model._clone({
        _path: []
    });
    var boundPath = model._path;
    var boundCallPath = boundPath.concat(callPath);
    var initialCacheVersion = this.initialCacheVersion;

    /* eslint-disable consistent-return */
    // Precisely the same error as the router when a call function does not
    // exist.
    if (!model._source) {
        observer.onError(new Error("function does not exist"));
        return;
    }

    var response, obs;
    try {
        obs = model._source.
            call(boundCallPath, callArgs, suffixes, extraPaths);
    } catch (e) {
        observer.onError(new InvalidSourceError(e));
        return;
    }

    return obs.
        subscribe(function(res) {
            response = res;
        }, function(err) {
            observer.onError(err);
        }, function() {

            // Run the invalidations first then the follow up JSONGraph set.
            var invalidations = response.invalidated;
            if (invalidations && invalidations.length) {
                // Increment `syncRefCount` here to block calling the _root's
                // onChangesCompleted handler.
                ++model._root.syncRefCount;
                rootModel.invalidate.apply(rootModel, invalidations);
                --model._root.syncRefCount;
            }

            // Use the SetResponse directly so we can specify the
            // initialCacheVersion from before the call operation was invoked.
            return new SetResponse(rootModel.withoutDataSource(), [response],
                false, false, initialCacheVersion).subscribe(function(x) {
                    observer.onNext(x);
                }, function(err) {
                    observer.onError(err);
                }, function() {
                    observer.onCompleted();
                });
        });
    /* eslint-enable consistent-return */
};

module.exports = CallResponse;

},{"125":125,"15":15,"43":43,"58":58,"66":66}],57:[function(require,module,exports){
var isArray = Array.isArray;
var ModelResponse = require(58);
var isPathValue = require(98);
var isJSONEnvelope = require(95);
var noop = require(102);
var empty = { dispose: noop, unsubscribe: noop };
var __version = require(43);
var isFunction = require(93);

function InvalidateResponse(model, args, initialCacheVersion) {
    // TODO: This should be removed.  There should only be 1 type of arguments
    // coming in, but we have strayed from documentation.
    this._model = model;

    var groups = [];
    var group, groupType;
    var argIndex = -1;
    var argCount = args.length;

    var currentVersion = model._root.cache[__version];

    if (typeof initialCacheVersion === "number") {
        this.initialCacheVersion = initialCacheVersion;
    } else if (typeof currentVersion === "number") {
        this.initialCacheVersion = currentVersion;
    } else {
        this.initialCacheVersion = model._root.version;
    }

    // Validation of arguments have been moved out of this function.
    while (++argIndex < argCount) {
        var arg = args[argIndex];
        var argType;
        if (isArray(arg)) {
            argType = "PathValues";
        } else if (isPathValue(arg)) {
            argType = "PathValues";
        } else if (isJSONEnvelope(arg)) {
            argType = "PathMaps";
        } else {
            throw new Error("Invalid Input");
        }

        if (groupType !== argType) {
            groupType = argType;
            group = {
                inputType: argType,
                arguments: []
            };
            groups.push(group);
        }

        group.arguments.push(arg);
    }

    this._groups = groups;
}

InvalidateResponse.prototype = Object.create(ModelResponse.prototype);
InvalidateResponse.prototype.progressively = function progressively() {
    return this;
};
InvalidateResponse.prototype._toJSONG = function _toJSONG() {
    return this;
};

InvalidateResponse.prototype._subscribe = function _subscribe(observer) {

    var model = this._model;
    this._groups.forEach(function(group) {
        var inputType = group.inputType;
        var methodArgs = group.arguments;
        var operationName = "_invalidate" + inputType;
        var operationFunc = model[operationName];
        operationFunc(model, methodArgs);
    });
    observer.onCompleted();

    var modelRoot = model._root;
    var modelCache = modelRoot.cache;
    var currentVersion = modelCache[__version];
    var initialCacheVersion = this.initialCacheVersion;
    var rootOnChangesCompletedHandler = modelRoot.onChangesCompleted;

    if (initialCacheVersion !== currentVersion && (
        modelRoot.syncRefCount <= 0) &&
        isFunction(rootOnChangesCompletedHandler)) {
        rootOnChangesCompletedHandler.call(modelRoot.topLevelModel);
    }

    return empty;
};

module.exports = InvalidateResponse;

},{"102":102,"43":43,"58":58,"93":93,"95":95,"98":98}],58:[function(require,module,exports){
(function (Promise){
var noop = require(102);
var Symbol = require(6);
var toEsObservable = require(115);

/**
 * A ModelResponse is a container for the results of a get, set, or call operation performed on a Model. The ModelResponse provides methods which can be used to specify the output format of the data retrieved from a Model, as well as how that data is delivered.
 * @constructor ModelResponse
 * @augments Observable
*/
function ModelResponse(subscribe) {
    this._subscribe = subscribe;
}

ModelResponse.prototype[Symbol.observable] = function SymbolObservable() {
    return toEsObservable(this);
};

ModelResponse.prototype._toJSONG = function toJSONG() {
    return this;
};

/**
 * The progressively method breaks the response up into two parts: the data immediately available in the Model cache, and the data in the Model cache after the missing data has been retrieved from the DataSource.
 * The progressively method creates a ModelResponse that immediately returns the requested data that is available in the Model cache. If any requested paths are not available in the cache, the ModelResponse will send another JSON message with all of the requested data after it has been retrieved from the DataSource.
 * @name progressively
 * @memberof ModelResponse.prototype
 * @function
 * @return {ModelResponse.<JSONEnvelope>} the values found at the requested paths.
 * @example
var dataSource = (new falcor.Model({
  cache: {
    user: {
      name: "Steve",
      surname: "McGuire",
      age: 31
    }
  }
})).asDataSource();

var model = new falcor.Model({
  source: dataSource,
  cache: {
    user: {
      name: "Steve",
      surname: "McGuire"
    }
  }
});

model.
  get(["user",["name", "surname", "age"]]).
  progressively().
  // this callback will be invoked twice, once with the data in the
  // Model cache, and again with the additional data retrieved from the DataSource.
  subscribe(function(json){
    console.log(JSON.stringify(json,null,4));
  });

// prints...
// {
//     "json": {
//         "user": {
//             "name": "Steve",
//             "surname": "McGuire"
//         }
//     }
// }
// ...and then prints...
// {
//     "json": {
//         "user": {
//             "name": "Steve",
//             "surname": "McGuire",
//             "age": 31
//         }
//     }
// }
*/
ModelResponse.prototype.progressively = function progressively() {
    return this;
};

ModelResponse.prototype.subscribe =
ModelResponse.prototype.forEach = function subscribe(a, b, c) {
    var observer = a;
    if (observer && typeof observer === "object") {
        if (!(observer.onNext || observer.onError || observer.onCompleted)) {
            observer = {
                onNext: (observer.next || noop).bind(observer),
                onError: (observer.error || noop).bind(observer),
                onCompleted: (observer.complete || noop).bind(observer)
            };
        }
    } else {
        observer = {
            onNext: a || noop,
            onError: b || noop,
            onCompleted: c || noop
        };
    }
    var subscription = this._subscribe(observer);
    switch (typeof subscription) {
        case "function":
            return { dispose: subscription, unsubscribe: subscription };
        case "object":
            return subscription || { dispose: noop, unsubscribe: noop };
        default:
            return { dispose: noop, unsubscribe: noop };
    }
};

ModelResponse.prototype.then = function then(onNext, onError) {
    /* global Promise */
    var self = this;
    if (!self._promise) {
        self._promise = new Promise(function(resolve, reject) {
            var rejected = false;
            var values = [];
            self.subscribe(
                function(value) {
                    values[values.length] = value;
                },
                function(errors) {
                    rejected = true;
                    reject(errors);
                },
                function() {
                    var value = values;
                    if (values.length <= 1) {
                        value = values[0];
                    }

                    if (rejected === false) {
                        resolve(value);
                    }
                }
            );
        });
    }
    return self._promise.then(onNext, onError);
};

module.exports = ModelResponse;

}).call(this,typeof Promise === "function" ? Promise : require(225))
},{"102":102,"115":115,"225":225,"6":6}],59:[function(require,module,exports){
var ModelResponse = require(58);
var checkCacheAndReport = require(60);
var getRequestCycle = require(61);
var noop = require(102);
var empty = { dispose: noop, unsubscribe: noop };
var collectLru = require(46);
var getSize = require(86);
var __version = require(43);
var isFunction = require(93);

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
                                                        initialCacheVersion) {
    this.model = model;
    this.currentRemainingPaths = paths;
    this.isJSONGraph = isJSONGraph || false;
    this.isProgressive = isProgressive || false;
    this.forceCollect = forceCollect || false;

    var currentVersion = model._root.cache[__version];

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
                           this.initialCacheVersion);
};

/**
 * Progressively responding to data in the cache instead of once the whole
 * operation is complete.
 * @public
 */
GetResponse.prototype.progressively = function progressively() {
    return new GetResponse(this.model, this.currentRemainingPaths,
                           this.isJSONGraph, true, this.forceCollect,
                           this.initialCacheVersion);
};

/**
 * purely for the purposes of closure creation other than the initial
 * prototype created closure.
 *
 * @private
 */
GetResponse.prototype._subscribe = function _subscribe(observer) {

    var seed = [{}];
    var errors = [];
    var model = this.model;
    var isJSONG = observer.isJSONG = this.isJSONGraph;
    var isProgressive = this.isProgressive;
    var results = checkCacheAndReport(model, this.currentRemainingPaths,
                                      observer, isProgressive, isJSONG, seed,
                                      errors);

    // If there are no results, finish.
    if (!results) {

        var modelRoot = model._root;
        var modelCache = modelRoot.cache;
        var currentVersion = modelCache[__version];

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
                           this.initialCacheVersion);
};

},{"102":102,"43":43,"46":46,"58":58,"60":60,"61":61,"86":86,"93":93}],60:[function(require,module,exports){
var gets = require(25);
var mergeInto = require(64);
var collapse = require(136).collapse;
var getWithPathsAsPathMap = gets.getWithPathsAsPathMap;
var getWithPathsAsJSONGraph = gets.getWithPathsAsJSONGraph;

/**
 * Checks cache for the paths and reports if in progressive mode.  If
 * there are missing paths then return the cache hit results.
 *
 * @param {Model} model - The model that the request was made with.
 * @param {Array} requestedMissingPaths -
 * @param {Boolean} progressive -
 * @param {Boolean} isJSONG -
 * @param {Function} onNext -
 * @param {Function} onError -
 * @param {Function} onCompleted -
 * @param {Object} seed - The state of the output
 * @private
 */
module.exports = function checkCacheAndReport(model, requestedPaths, observer,
                                              progressive, isJSONG, seed,
                                              errors) {

    var originalSeed, isSeedImmutable = progressive && !isJSONG && seed;

    // If we request paths as JSON in progressive mode, ensure each progressive
    // valueNode is immutable. If not in progressive mode, we can write into the
    // same JSON tree until the request is completed.
    if (isSeedImmutable) {
        originalSeed = seed[0];
        seed[0] = {};
    }

    // checks the cache for the data.
    var results;
    if (isJSONG) {
        results = getWithPathsAsJSONGraph(model, requestedPaths, seed);
    } else {
        results = getWithPathsAsPathMap(model, requestedPaths, seed);
    }

    // We must communicate critical errors from get that are critical
    // errors such as bound path is broken or this is a JSONGraph request
    // with a bound path.
    if (results.criticalError) {
        observer.onError(results.criticalError);
        return null;
    }

    var hasValues = results.hasValue;
    var valueNode = results.values[0];
    var hasValueOverall = Boolean(valueNode.json || valueNode.jsonGraph);

    // We are done when there are no missing paths or the model does not
    // have a dataSource to continue on fetching from.
    var completed = !results.requestedMissingPaths ||
                    !results.requestedMissingPaths.length ||
                    !model._source;

    // Copy the errors into the total errors array.
    if (results.errors) {
        var errs = results.errors;
        var errorsLength = errors.length;
        for (var i = 0, len = errs.length; i < len; ++i, ++errorsLength) {
            errors[errorsLength] = errs[i];
        }
    }

    // If the valueNode should be immutable, merge the previous valueNode into
    // the one that was just created.
    if (isSeedImmutable && originalSeed) {
        valueNode = mergeInto(valueNode, originalSeed);
    }

    // If there are values to report, then report.
    // Which are under two conditions:
    // 1.  This request for data yielded at least one value (hasValue) and  the
    // request is progressive
    //
    // 2.  The request if finished and the json key off
    // the valueNode has a value.
    if (hasValues && progressive || hasValueOverall && completed) {
        try {
            if (isJSONG && valueNode) {
                var jsonGraphPaths = valueNode.paths;
                if (jsonGraphPaths && jsonGraphPaths.length > 0) {
                    valueNode.paths = collapse(jsonGraphPaths);
                }
            }
            ++model._root.syncRefCount;
            observer.onNext(valueNode);
        } catch (e) {
            throw e;
        } finally {
            --model._root.syncRefCount;
        }
    }

    // if there are missing paths, then lets return them.
    if (completed) {
        if (errors.length) {
            observer.onError(errors);
        } else {
            observer.onCompleted();
        }

        return null;
    }

    // Return the results object.
    return results;
};

},{"136":136,"25":25,"64":64}],61:[function(require,module,exports){
var checkCacheAndReport = require(60);
var MaxRetryExceededError = require(16);
var collectLru = require(46);
var getSize = require(86);
var AssignableDisposable = require(55);
var InvalidSourceError = require(15);
var isFunction = require(93);

/**
 * The get request cycle for checking the cache and reporting
 * values.  If there are missing paths then the async request cycle to
 * the data source is performed until all paths are resolved or max
 * requests are made.
 * @param {GetResponse} getResponse -
 * @param {Model} model - The model that the request was made with.
 * @param {Object} results -
 * @param {Function} onNext -
 * @param {Function} onError -
 * @param {Function} onCompleted -
 * @private
 */
module.exports = function getRequestCycle(getResponse, model, results, observer,
                                          errors, count, initialCacheVersion) {
    // we have exceeded the maximum retry limit.
    if (count === 10) {
        throw new MaxRetryExceededError();
    }

    var requestQueue = model._request;
    var requestedMissingPaths = results.requestedMissingPaths;
    var optimizedMissingPaths = results.optimizedMissingPaths;
    var disposable = new AssignableDisposable();

    // We need to prepend the bound path to all requested missing paths and
    // pass those into the requestQueue.
    var boundRequestedMissingPaths = [];
    var boundPath = model._path;
    if (boundPath.length) {
        for (var i = 0, len = requestedMissingPaths.length; i < len; ++i) {
            boundRequestedMissingPaths[i] =
                fastCat(boundPath, requestedMissingPaths[i]);
        }
    }

    // No bound path, no array copy and concat.
    else {
        boundRequestedMissingPaths = requestedMissingPaths;
    }

    var currentRequestDisposable = requestQueue.
        get(boundRequestedMissingPaths, optimizedMissingPaths, function(err) {

            if (err instanceof InvalidSourceError) {
                observer.onError(err);
                return;
            }

            // Once the request queue finishes, check the cache and bail if
            // we can.
            var nextResults = checkCacheAndReport(model, requestedMissingPaths,
                                                  observer,
                                                  getResponse.isProgressive,
                                                  getResponse.isJSONGraph,
                                                  results.values, errors);

            // If there are missing paths coming back form checkCacheAndReport
            // the its reported from the core cache check method.
            if (nextResults) {

                // update the which disposable to use.
                disposable.currentDisposable =
                    getRequestCycle(getResponse, model, nextResults, observer,
                                    errors, count + 1, initialCacheVersion);
            }

            // We have finished.  Since we went to the dataSource, we must
            // collect on the cache.
            else {

                var modelRoot = model._root;
                var modelCache = modelRoot.cache;
                var currentVersion = modelCache.ツversion;

                collectLru(modelRoot, modelRoot.expired, getSize(modelCache),
                        model._maxSize, model._collectRatio, currentVersion);

                var rootOnChangesCompletedHandler = modelRoot.onChangesCompleted;

                if (initialCacheVersion !== currentVersion && (
                    modelRoot.syncRefCount <= 0) &&
                    isFunction(rootOnChangesCompletedHandler)) {
                    rootOnChangesCompletedHandler.call(modelRoot.topLevelModel);
                }
            }

        });
    disposable.currentDisposable = currentRequestDisposable;
    return disposable;
};

function fastCat(arr1, arr2) {
    var a = [], i, len, j;
    for (i = 0, len = arr1.length; i < len; i++) {
        a[i] = arr1[i];
    }
    for (j = 0, len = arr2.length; j < len; j++) {
        a[i++] = arr2[j];
    }
    return a;
}

},{"15":15,"16":16,"46":46,"55":55,"60":60,"86":86,"93":93}],62:[function(require,module,exports){
var GetResponse = require(59);

/**
 * Performs a get on the cache and if there are missing paths
 * then the request will be forwarded to the get request cycle.
 * @private
 */
module.exports = function getWithPaths(paths) {
    return new GetResponse(this, paths);
};

},{"59":59}],63:[function(require,module,exports){
var pathSyntax = require(125);
var ModelResponse = require(58);
var GET_VALID_INPUT = require(65);
var validateInput = require(113);
var GetResponse = require(59);

/**
 * Performs a get on the cache and if there are missing paths
 * then the request will be forwarded to the get request cycle.
 * @private
 */
module.exports = function get() {
    // Validates the input.  If the input is not pathSets or strings then we
    // will onError.
    var out = validateInput(arguments, GET_VALID_INPUT, "get");
    if (out !== true) {
        return new ModelResponse(function(o) {
            o.onError(out);
        });
    }

    var paths = pathSyntax.fromPathsOrPathValues(arguments);
    return new GetResponse(this, paths);
};

},{"113":113,"125":125,"58":58,"59":59,"65":65}],64:[function(require,module,exports){
module.exports = mergeInto;

/* eslint-disable camelcase */
function mergeInto(dest, node) {

    var destValue, nodeValue,
        key, keys = Object.keys(node),
        index = -1, length = keys.length;

    while (++index < length) {

        key = keys[index];

        if (key !== "$__path" &&
            key !== "$__refPath" &&
            key !== "$__toReference") {

            nodeValue = node[key];
            destValue = dest[key];

            if (destValue !== nodeValue) {
                if (destValue === undefined || "object" !== typeof nodeValue) {
                    dest[key] = nodeValue;
                }
                else {
                    mergeInto(destValue, nodeValue);
                }
            }
        }
    }

    var $__path = node.$__path;

    if ($__path) {
        dest.$__path = $__path;
        var $__refPath = node.$__refPath;
        var $__toReference = node.$__toReference;
        if ($__refPath && $__toReference) {
            dest.$__refPath = $__refPath;
            dest.$__toReference = $__toReference;
        }
    }

    return dest;
}
/* eslint-enable */

},{}],65:[function(require,module,exports){
module.exports = {
    path: true,
    pathSyntax: true
};

},{}],66:[function(require,module,exports){
var ModelResponse = require(58);
var pathSyntax = require(125);
var isArray = Array.isArray;
var isPathValue = require(98);
var isJSONGraphEnvelope = require(96);
var isJSONEnvelope = require(95);
var setRequestCycle = require(69);
var __version = require(43);

/**
 *  The set response is responsible for doing the request loop for the set
 * operation and subscribing to the follow up get.
 *
 * The constructors job is to parse out the arguments and put them in their
 * groups.  The following subscribe will do the actual cache set and dataSource
 * operation remoting.
 *
 * @param {Model} model -
 * @param {Array} args - The array of arguments that can be JSONGraph, JSON, or
 * pathValues.
 * @param {Boolean} isJSONGraph - if the request is a jsonGraph output format.
 * @param {Boolean} isProgressive - progressive output.
 * @augments ModelResponse
 * @private
 */
var SetResponse = module.exports = function SetResponse(model, args,
                                                        isJSONGraph,
                                                        isProgressive,
                                                        initialCacheVersion) {

    // The response properties.
    this._model = model;
    this._isJSONGraph = isJSONGraph || false;
    this._isProgressive = isProgressive || false;
    this._initialArgs = args;
    this._value = [{}];

    var currentVersion = model._root.cache[__version];

    if (typeof initialCacheVersion === "number") {
        this.initialCacheVersion = initialCacheVersion;
    } else if (typeof currentVersion === "number") {
        this.initialCacheVersion = currentVersion;
    } else {
        this.initialCacheVersion = model._root.version;
    }

    var groups = [];
    var group, groupType;
    var argIndex = -1;
    var argCount = args.length;

    // Validation of arguments have been moved out of this function.
    while (++argIndex < argCount) {
        var arg = args[argIndex];
        var argType;
        if (isArray(arg) || typeof arg === "string") {
            arg = pathSyntax.fromPath(arg);
            argType = "PathValues";
        } else if (isPathValue(arg)) {
            arg.path = pathSyntax.fromPath(arg.path);
            argType = "PathValues";
        } else if (isJSONGraphEnvelope(arg)) {
            argType = "JSONGs";
        } else if (isJSONEnvelope(arg)) {
            argType = "PathMaps";
        }

        if (groupType !== argType) {
            groupType = argType;
            group = {
                inputType: argType,
                arguments: []
            };
            groups.push(group);
        }

        group.arguments.push(arg);
    }

    this._groups = groups;
};

SetResponse.prototype = Object.create(ModelResponse.prototype);

/**
 * The subscribe function will setup the remoting of the operation and cache
 * setting.
 *
 * @private
 */
SetResponse.prototype._subscribe = function _subscribe(observer) {
    var groups = this._groups;
    var model = this._model;
    var isJSONGraph = this._isJSONGraph;
    var isProgressive = this._isProgressive;

    // Starts the async request cycle.
    return setRequestCycle(model, observer, groups,
                           isJSONGraph, isProgressive,
                           0, this.initialCacheVersion);
};

/**
 * Makes the output of a get response JSONGraph instead of json.
 * @private
 */
SetResponse.prototype._toJSONG = function _toJSONGraph() {
    return new SetResponse(this._model, this._initialArgs,
                           true, this._isProgressive, this.initialCacheVersion);
};

/**
 * Progressively responding to data in the cache instead of once the whole
 * operation is complete.
 * @public
 */
SetResponse.prototype.progressively = function progressively() {
    return new SetResponse(this._model, this._initialArgs,
                           this._isJSONGraph, true, this.initialCacheVersion);
};

},{"125":125,"43":43,"58":58,"69":69,"95":95,"96":96,"98":98}],67:[function(require,module,exports){
var setValidInput = require(70);
var validateInput = require(113);
var SetResponse = require(66);
var ModelResponse = require(58);

module.exports = function set() {
    var out = validateInput(arguments, setValidInput, "set");
    if (out !== true) {
        return new ModelResponse(function(o) {
            o.onError(out);
        });
    }

    var argsIdx = -1;
    var argsLen = arguments.length;
    var args = [];
    while (++argsIdx < argsLen) {
        args[argsIdx] = arguments[argsIdx];
    }
    return new SetResponse(this, args);
};

},{"113":113,"58":58,"66":66,"70":70}],68:[function(require,module,exports){
var arrayFlatMap = require(79);

/**
 * Takes the groups that are created in the SetResponse constructor and sets
 * them into the cache.
 */
module.exports = function setGroupsIntoCache(model, groups) {
    var modelRoot = model._root;
    var errorSelector = modelRoot.errorSelector;
    var groupIndex = -1;
    var groupCount = groups.length;
    var requestedPaths = [];
    var optimizedPaths = [];
    var returnValue = {
        requestedPaths: requestedPaths,
        optimizedPaths: optimizedPaths
    };

    // Takes each of the groups and normalizes their input into
    // requested paths and optimized paths.
    while (++groupIndex < groupCount) {

        var group = groups[groupIndex];
        var inputType = group.inputType;
        var methodArgs = group.arguments;

        if (methodArgs.length > 0) {
            var operationName = "_set" + inputType;
            var operationFunc = model[operationName];
            var successfulPaths = operationFunc(model, methodArgs, errorSelector);

            optimizedPaths.push.apply(optimizedPaths, successfulPaths[1]);

            if (inputType === "PathValues") {
                requestedPaths.push.apply(requestedPaths, methodArgs.map(pluckPath));
            } else if (inputType === "JSONGs") {
                requestedPaths.push.apply(requestedPaths, arrayFlatMap(methodArgs, pluckEnvelopePaths));
            } else {
                requestedPaths.push.apply(requestedPaths, successfulPaths[0]);
            }
        }
    }

    return returnValue;
};

function pluckPath(pathValue) {
    return pathValue.path;
}

function pluckEnvelopePaths(jsonGraphEnvelope) {
    return jsonGraphEnvelope.paths;
}

},{"79":79}],69:[function(require,module,exports){
var emptyArray = [];
var AssignableDisposable = require(55);
var GetResponse = require(59);
var setGroupsIntoCache = require(68);
var getWithPathsAsPathMap = require(25).getWithPathsAsPathMap;
var InvalidSourceError = require(15);
var MaxRetryExceededError = require(16);

/**
 * The request cycle for set.  This is responsible for requesting to dataSource
 * and allowing disposing inflight requests.
 */
module.exports = function setRequestCycle(model, observer, groups,
                                          isJSONGraph, isProgressive, count,
                                          initialCacheVersion) {
    // we have exceeded the maximum retry limit.
    if (count === 10) {
        throw new MaxRetryExceededError();
    }

    var requestedAndOptimizedPaths = setGroupsIntoCache(model, groups);
    var optimizedPaths = requestedAndOptimizedPaths.optimizedPaths;
    var requestedPaths = requestedAndOptimizedPaths.requestedPaths;
    var isMaster = model._source === undefined;

    // Local set only.  We perform a follow up get.  If performance is ever
    // a requirement simply requiring in checkCacheAndReport and use get request
    // internals.  Figured this is more "pure".
    if (isMaster) {
        return subscribeToFollowupGet(model, observer, requestedPaths,
                              isJSONGraph, isProgressive, initialCacheVersion);
    }


    // Progressively output the data from the first set.
    if (isProgressive) {
        var results = getWithPathsAsPathMap(model, requestedPaths, [{}]);
        if (results.criticalError) {
            observer.onError(results.criticalError);
            return null;
        }
        observer.onNext(results.values[0]);
    }

    var currentJSONGraph = getJSONGraph(model, optimizedPaths);
    var disposable = new AssignableDisposable();

    // Sends out the setRequest.  The Queue will call the callback with the
    // JSONGraph envelope / error.
    var requestDisposable = model._request.
        // TODO: There is error handling that has not been addressed yet.

        // If disposed before this point then the sendSetRequest will not
        // further any callbacks.  Therefore, if we are at this spot, we are
        // not disposed yet.
        set(currentJSONGraph, function(error, jsonGraphEnv) {
            if (typeof error === InvalidSourceError) {
                observer.onError(error);
                return;
            }

            // TODO: This seems like there are errors with this approach, but
            // for sanity sake I am going to keep this logic in here until a
            // rethink can be done.
            var isCompleted = false;
            if (error || optimizedPaths.length === jsonGraphEnv.paths.length) {
                isCompleted = true;
            }

            // Happy case.  One request to the dataSource will fulfill the
            // required paths.
            if (isCompleted) {
                disposable.currentDisposable =
                    subscribeToFollowupGet(model, observer, requestedPaths,
                                          isJSONGraph, isProgressive, initialCacheVersion);
            }

            // TODO: The unhappy case.  I am unsure how this can even be
            // achieved.
            else {
                // We need to restart the setRequestCycle.
                setRequestCycle(model, observer, groups, isJSONGraph,
                                isProgressive, count + 1, initialCacheVersion);
            }
        });

    // Sets the current disposable as the requestDisposable.
    disposable.currentDisposable = requestDisposable;

    return disposable;
};

function getJSONGraph(model, optimizedPaths) {
    var boundPath = model._path;
    var envelope = {};
    model._path = emptyArray;
    model._getPathValuesAsJSONG(model._materialize().withoutDataSource(), optimizedPaths, [envelope]);
    model._path = boundPath;

    return envelope;
}

function subscribeToFollowupGet(model, observer, requestedPaths, isJSONGraph,
                               isProgressive, initialCacheVersion) {

    // Creates a new response and subscribes to it with the original observer.
    // Also sets forceCollect to true, incase the operation is synchronous and
    // exceeds the cache limit size
    var response = new GetResponse(model, requestedPaths, isJSONGraph,
                                   isProgressive, true, initialCacheVersion);
    return response.subscribe(observer);
}

},{"15":15,"16":16,"25":25,"55":55,"59":59,"68":68}],70:[function(require,module,exports){
module.exports = {
    pathValue: true,
    pathSyntax: true,
    json: true,
    jsonGraph: true
};


},{}],71:[function(require,module,exports){
var empty = {dispose: function() {}};

function ImmediateScheduler() {}

ImmediateScheduler.prototype.schedule = function schedule(action) {
    action();
    return empty;
};

ImmediateScheduler.prototype.scheduleWithState = function scheduleWithState(state, action) {
    action(this, state);
    return empty;
};

module.exports = ImmediateScheduler;

},{}],72:[function(require,module,exports){
function TimeoutScheduler(delay) {
    this.delay = delay;
}

var TimerDisposable = function TimerDisposable(id) {
    this.id = id;
    this.disposed = false;
};

TimeoutScheduler.prototype.schedule = function schedule(action) {
    var id = setTimeout(action, this.delay);
    return new TimerDisposable(id);
};

TimeoutScheduler.prototype.scheduleWithState = function scheduleWithState(state, action) {
    var self = this;
    var id = setTimeout(function() {
        action(self, state);
    }, this.delay);
    return new TimerDisposable(id);
};

TimerDisposable.prototype.dispose = function() {
    if (this.disposed) {
        return;
    }

    clearTimeout(this.id);
    this.disposed = true;
};

module.exports = TimeoutScheduler;

},{}],73:[function(require,module,exports){
var arr = new Array(5);
var $ref = require(118);
var createHardlink = require(83);
var isExpired = require(91);
var isFunction = require(93);
var isPrimitive = require(99);
var expireNode = require(84);
var iterateKeySet = require(136).iterateKeySet;
var mergeJSONGraphNode = require(100);
var NullInPathError = require(17);

/**
 * Merges a list of {@link JSONGraphEnvelope}s into a {@link JSONGraph}.
 * @function
 * @param {Object} model - the Model for which to merge the {@link JSONGraphEnvelope}s.
 * @param {Array.<PathValue>} jsonGraphEnvelopes - the {@link JSONGraphEnvelope}s to merge.
 * @return {Array.<Array.<Path>>} - an Array of Arrays where each inner Array is a list of requested and optimized paths (respectively) for the successfully set values.
 */

module.exports = function setJSONGraphs(model, jsonGraphEnvelopes, errorSelector, comparator) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = modelRoot.version++;
    var cache = modelRoot.cache;
    var initialVersion = cache.ツversion;

    var requestedPath = [];
    var optimizedPath = [];
    var requestedPaths = [];
    var optimizedPaths = [];
    var jsonGraphEnvelopeIndex = -1;
    var jsonGraphEnvelopeCount = jsonGraphEnvelopes.length;

    while (++jsonGraphEnvelopeIndex < jsonGraphEnvelopeCount) {

        var jsonGraphEnvelope = jsonGraphEnvelopes[jsonGraphEnvelopeIndex];
        var paths = jsonGraphEnvelope.paths;
        var jsonGraph = jsonGraphEnvelope.jsonGraph;

        var pathIndex = -1;
        var pathCount = paths.length;

        while (++pathIndex < pathCount) {

            var path = paths[pathIndex];
            optimizedPath.index = 0;

            setJSONGraphPathSet(
                path, 0,
                cache, cache, cache,
                jsonGraph, jsonGraph, jsonGraph,
                requestedPaths, optimizedPaths, requestedPath, optimizedPath,
                version, expired, lru, comparator, errorSelector
            );
        }
    }

    arr[0] = undefined;
    arr[1] = undefined;
    arr[2] = undefined;
    arr[3] = undefined;
    arr[4] = undefined;

    var newVersion = cache.ツversion;
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }

    return [requestedPaths, optimizedPaths];
};

/* eslint-disable no-constant-condition */
function setJSONGraphPathSet(
    path, depth, root, parent, node,
    messageRoot, messageParent, message,
    requestedPaths, optimizedPaths, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector) {

    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet(keySet, note);
    var optimizedIndex = optimizedPath.index;

    do {

        requestedPath.depth = depth;

        var results = setNode(
            root, parent, node, messageRoot, messageParent, message,
            key, branch, false, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector
        );

        requestedPath[depth] = key;
        requestedPath.index = depth;

        var nextNode = results[0];
        var nextParent = results[1];
        var nextOptimizedPath = results[4];
        nextOptimizedPath[nextOptimizedPath.index++] = key;

        if (nextNode) {
            if (branch) {
                setJSONGraphPathSet(
                    path, depth + 1, root, nextParent, nextNode,
                    messageRoot, results[3], results[2],
                    requestedPaths, optimizedPaths, requestedPath, nextOptimizedPath,
                    version, expired, lru, comparator, errorSelector
                );
            } else {
                requestedPaths.push(requestedPath.slice(0, requestedPath.index + 1));
                optimizedPaths.push(nextOptimizedPath.slice(0, nextOptimizedPath.index));
            }
        }
        key = iterateKeySet(keySet, note);
        if (note.done) {
            break;
        }
        optimizedPath.index = optimizedIndex;
    } while (true);
}
/* eslint-enable */

function setReference(
    root, node, messageRoot, message, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector) {

    var parent;
    var messageParent;
    var reference = node.value;
    optimizedPath = reference.slice(0);

    if (isExpired(node)) {
        expireNode(node, expired, lru);
        node = undefined;
        parent = root;
        messageParent = messageRoot;
        optimizedPath.index = reference.length;
    } else {

        var index = 0;
        var container = node;
        var count = reference.length - 1;
        parent = node = root;
        messageParent = message = messageRoot;

        do {
            var key = reference[index];
            var branch = index < count;
            optimizedPath.index = index;

            var results = setNode(
                root, parent, node, messageRoot, messageParent, message,
                key, branch, true, requestedPath, optimizedPath,
                version, expired, lru, comparator, errorSelector
            );
            node = results[0];
            optimizedPath = results[4];
            if (isPrimitive(node)) {
                optimizedPath.index = index;
                return results;
            }
            parent = results[1];
            message = results[2];
            messageParent = results[3];
        } while (index++ < count);

        optimizedPath.index = index;

        if (container.ツcontext !== node) {
            createHardlink(container, node);
        }
    }

    arr[0] = node;
    arr[1] = parent;
    arr[2] = message;
    arr[3] = messageParent;
    arr[4] = optimizedPath;

    return arr;
}

function setNode(
    root, parent, node, messageRoot, messageParent, message,
    key, branch, reference, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector) {

    var type = node.$type;

    while (type === $ref) {

        var results = setReference(
            root, node, messageRoot, message, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector
        );

        node = results[0];

        if (isPrimitive(node)) {
            return results;
        }

        parent = results[1];
        message = results[2];
        messageParent = results[3];
        optimizedPath = results[4];
        type = node.$type;
    }

    if (type === undefined) {
        if (key == null) {
            if (branch) {
                throw new NullInPathError();
            } else if (node) {
                key = node.ツkey;
            }
        } else {
            parent = node;
            messageParent = message;
            node = parent[key];
            message = messageParent && messageParent[key];
        }

        node = mergeJSONGraphNode(
            parent, node, message, key, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector
        );
    }

    arr[0] = node;
    arr[1] = parent;
    arr[2] = message;
    arr[3] = messageParent;
    arr[4] = optimizedPath;

    return arr;
}

},{"100":100,"118":118,"136":136,"17":17,"83":83,"84":84,"91":91,"93":93,"99":99}],74:[function(require,module,exports){
var arr = new Array(3);
var isArray = Array.isArray;
var $ref = require(118);
var __prefix = require(42);
var createHardlink = require(83);
var getCachePosition = require(21);
var hasOwn = require(89);
var isObject = require(97);
var isExpired = require(92);
var isFunction = require(93);
var isPrimitive = require(99);
var expireNode = require(84);
var mergeValueOrInsertBranch = require(101);
var NullInPathError = require(17);

/**
 * Sets a list of {@link PathMapEnvelope}s into a {@link JSONGraph}.
 * @function
 * @param {Object} model - the Model for which to insert the PathMaps.
 * @param {Array.<PathMapEnvelope>} pathMapEnvelopes - the a list of {@link PathMapEnvelope}s to set.
 * @return {Array.<Array.<Path>>} - an Array of Arrays where each inner Array is a list of requested and optimized paths (respectively) for the successfully set values.
 */

module.exports = function setPathMaps(model, pathMapEnvelopes, errorSelector, comparator) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = modelRoot.version++;
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = getCachePosition(cache, bound);
    var parent = node.ツparent || cache;
    var initialVersion = cache.ツversion;

    var requestedPath = [];
    var requestedPaths = [];
    var optimizedPaths = [];
    var optimizedIndex = bound.length;
    var pathMapIndex = -1;
    var pathMapCount = pathMapEnvelopes.length;

    while (++pathMapIndex < pathMapCount) {

        var pathMapEnvelope = pathMapEnvelopes[pathMapIndex];
        var optimizedPath = bound.slice(0);
        optimizedPath.index = optimizedIndex;

        setPathMap(
            pathMapEnvelope.json, 0, cache, parent, node,
            requestedPaths, optimizedPaths, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector
        );
    }

    arr[0] = undefined;
    arr[1] = undefined;
    arr[2] = undefined;

    var newVersion = cache.ツversion;
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }

    return [requestedPaths, optimizedPaths];
};

/* eslint-disable no-constant-condition */
function setPathMap(
    pathMap, depth, root, parent, node,
    requestedPaths, optimizedPaths, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector) {

    var keys = getKeys(pathMap);

    if (keys && keys.length) {

        var keyIndex = 0;
        var keyCount = keys.length;
        var optimizedIndex = optimizedPath.index;

        do {
            var key = keys[keyIndex];
            var child = pathMap[key];
            var branch = isObject(child) && !child.$type;

            requestedPath.depth = depth;

            var results = setNode(
                root, parent, node, key, child,
                branch, false, requestedPath, optimizedPath,
                version, expired, lru, comparator, errorSelector
            );

            requestedPath[depth] = key;
            requestedPath.index = depth;

            var nextNode = results[0];
            var nextParent = results[1];
            var nextOptimizedPath = results[2];
            nextOptimizedPath[nextOptimizedPath.index++] = key;

            if (nextNode) {
                if (branch) {
                    setPathMap(
                        child, depth + 1,
                        root, nextParent, nextNode,
                        requestedPaths, optimizedPaths, requestedPath, nextOptimizedPath,
                        version, expired, lru, comparator, errorSelector
                    );
                } else {
                    requestedPaths.push(requestedPath.slice(0, requestedPath.index + 1));
                    optimizedPaths.push(nextOptimizedPath.slice(0, nextOptimizedPath.index));
                }
            }
            if (++keyIndex >= keyCount) {
                break;
            }
            optimizedPath.index = optimizedIndex;
        } while (true);
    }
}
/* eslint-enable */

function setReference(
    value, root, node, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector) {

    var parent;
    var reference = node.value;
    optimizedPath = reference.slice(0);

    if (isExpired(node)) {
        expireNode(node, expired, lru);
        node = undefined;
        parent = root;
        optimizedPath.index = reference.length;
    } else {
        var container = node;
        parent = root;

        node = node.ツcontext;

        if (node != null) {
            parent = node.ツparent || root;
            optimizedPath.index = reference.length;
        } else {

            var index = 0;
            var count = reference.length - 1;
            optimizedPath.index = index;

            parent = node = root;

            do {
                var key = reference[index];
                var branch = index < count;
                var results = setNode(
                    root, parent, node, key, value,
                    branch, true, requestedPath, optimizedPath,
                    version, expired, lru, comparator, errorSelector
                );
                node = results[0];
                optimizedPath = results[2];
                if (isPrimitive(node)) {
                    optimizedPath.index = index;
                    return results;
                }
                parent = results[1];
            } while (index++ < count);

            optimizedPath.index = index;

            if (container.ツcontext !== node) {
                createHardlink(container, node);
            }
        }
    }

    arr[0] = node;
    arr[1] = parent;
    arr[2] = optimizedPath;

    return arr;
}

function setNode(
    root, parent, node, key, value,
    branch, reference, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector) {

    var type = node.$type;

    while (type === $ref) {

        var results = setReference(
            value, root, node, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector);

        node = results[0];

        if (isPrimitive(node)) {
            return results;
        }

        parent = results[1];
        optimizedPath = results[2];
        type = node && node.$type;
    }

    if (type === void 0) {
        if (key == null) {
            if (branch) {
                throw new NullInPathError();
            } else if (node) {
                key = node.ツkey;
            }
        } else {
            parent = node;
            node = parent[key];
        }

        node = mergeValueOrInsertBranch(
            parent, node, key, value,
            branch, reference, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector
        );
    }

    arr[0] = node;
    arr[1] = parent;
    arr[2] = optimizedPath;

    return arr;
}

function getKeys(pathMap) {

    if (isObject(pathMap) && !pathMap.$type) {
        var keys = [];
        var itr = 0;
        if (isArray(pathMap)) {
            keys[itr++] = "length";
        }
        for (var key in pathMap) {
            if (key[0] === __prefix || key[0] === "$" || !hasOwn(pathMap, key)) {
                continue;
            }
            keys[itr++] = key;
        }
        return keys;
    }

    return void 0;
}

},{"101":101,"118":118,"17":17,"21":21,"42":42,"83":83,"84":84,"89":89,"92":92,"93":93,"97":97,"99":99}],75:[function(require,module,exports){
var arr = new Array(3);
var $ref = require(118);
var createHardlink = require(83);
var getCachePosition = require(21);
var isExpired = require(92);
var isFunction = require(93);
var isPrimitive = require(99);
var expireNode = require(84);
var iterateKeySet = require(136).iterateKeySet;
var mergeValueOrInsertBranch = require(101);
var NullInPathError = require(17);

/**
 * Sets a list of {@link PathValue}s into a {@link JSONGraph}.
 * @function
 * @param {Object} model - the Model for which to insert the {@link PathValue}s.
 * @param {Array.<PathValue>} pathValues - the list of {@link PathValue}s to set.
 * @return {Array.<Array.<Path>>} - an Array of Arrays where each inner Array is a list of requested and optimized paths (respectively) for the successfully set values.
 */

module.exports = function setPathValues(model, pathValues, errorSelector, comparator) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = modelRoot.version++;
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = getCachePosition(cache, bound);
    var parent = node.ツparent || cache;
    var initialVersion = cache.ツversion;

    var requestedPath = [];
    var requestedPaths = [];
    var optimizedPaths = [];
    var optimizedIndex = bound.length;
    var pathValueIndex = -1;
    var pathValueCount = pathValues.length;

    while (++pathValueIndex < pathValueCount) {

        var pathValue = pathValues[pathValueIndex];
        var path = pathValue.path;
        var value = pathValue.value;
        var optimizedPath = bound.slice(0);
        optimizedPath.index = optimizedIndex;

        setPathSet(
            value, path, 0, cache, parent, node,
            requestedPaths, optimizedPaths, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector
        );
    }

    arr[0] = undefined;
    arr[1] = undefined;
    arr[2] = undefined;

    var newVersion = cache.ツversion;
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }

    return [requestedPaths, optimizedPaths];
};

/* eslint-disable no-constant-condition */
function setPathSet(
    value, path, depth, root, parent, node,
    requestedPaths, optimizedPaths, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector) {

    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet(keySet, note);
    var optimizedIndex = optimizedPath.index;

    do {

        requestedPath.depth = depth;
        requestedPath[depth] = key;
        requestedPath.index = depth;

        var results = setNode(
            root, parent, node, key, value,
            branch, false, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector
        );

        requestedPath[depth] = key;
        requestedPath.index = depth;

        var nextNode = results[0];
        var nextParent = results[1];
        var nextOptimizedPath = results[2];
        nextOptimizedPath[nextOptimizedPath.index++] = key;

        if (nextNode) {
            if (branch) {
                setPathSet(
                    value, path, depth + 1,
                    root, nextParent, nextNode,
                    requestedPaths, optimizedPaths, requestedPath, nextOptimizedPath,
                    version, expired, lru, comparator, errorSelector
                );
            } else {
                requestedPaths.push(requestedPath.slice(0, requestedPath.index + 1));
                optimizedPaths.push(nextOptimizedPath.slice(0, nextOptimizedPath.index));
            }
        }
        key = iterateKeySet(keySet, note);
        if (note.done) {
            break;
        }
        optimizedPath.index = optimizedIndex;
    } while (true);
}
/* eslint-enable */

function setReference(
    value, root, node, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector) {

    var parent;
    var reference = node.value;
    optimizedPath = reference.slice(0);

    if (isExpired(node)) {
        expireNode(node, expired, lru);
        node = undefined;
        parent = root;
        optimizedPath.index = reference.length;
    } else {

        var container = node;
        parent = root;

        node = node.ツcontext;

        if (node != null) {
            parent = node.ツparent || root;
            optimizedPath.index = reference.length;
        } else {

            var index = 0;
            var count = reference.length - 1;

            parent = node = root;

            do {
                var key = reference[index];
                var branch = index < count;
                optimizedPath.index = index;

                var results = setNode(
                    root, parent, node, key, value,
                    branch, true, requestedPath, optimizedPath,
                    version, expired, lru, comparator, errorSelector
                );
                node = results[0];
                optimizedPath = results[2];
                if (isPrimitive(node)) {
                    optimizedPath.index = index;
                    return results;
                }
                parent = results[1];
            } while (index++ < count);

            optimizedPath.index = index;

            if (container.ツcontext !== node) {
                createHardlink(container, node);
            }
        }
    }

    arr[0] = node;
    arr[1] = parent;
    arr[2] = optimizedPath;

    return arr;
}

function setNode(
    root, parent, node, key, value,
    branch, reference, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector) {

    var type = node.$type;

    while (type === $ref) {

        var results = setReference(
            value, root, node, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector
        );

        node = results[0];

        if (isPrimitive(node)) {
            return results;
        }

        parent = results[1];
        optimizedPath = results[2];
        type = node.$type;
    }

    if (!branch || type === undefined) {
        if (key == null) {
            if (branch) {
                throw new NullInPathError();
            } else if (node) {
                key = node.ツkey;
            }
        } else {
            parent = node;
            node = parent[key];
        }

        node = mergeValueOrInsertBranch(
            parent, node, key, value,
            branch, reference, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector
        );
    }

    arr[0] = node;
    arr[1] = parent;
    arr[2] = optimizedPath;

    return arr;
}

},{"101":101,"118":118,"136":136,"17":17,"21":21,"83":83,"84":84,"92":92,"93":93,"99":99}],76:[function(require,module,exports){
var jsong = require(121);
var ModelResponse = require(58);
var isPathValue = require(98);

module.exports = function setValue(pathArg, valueArg) {
    var value = isPathValue(pathArg) ? pathArg : jsong.pathValue(pathArg, valueArg);
    var pathIdx = 0;
    var path = value.path;
    var pathLen = path.length;
    while (++pathIdx < pathLen) {
        if (typeof path[pathIdx] === "object") {
            /* eslint-disable no-loop-func */
            return new ModelResponse(function(o) {
                o.onError(new Error("Paths must be simple paths"));
            });
            /* eslint-enable no-loop-func */
        }
    }
    var self = this;
    return new ModelResponse(function(obs) {
        return self.set(value).subscribe(function(data) {
            var curr = data.json;
            var depth = -1;
            var length = path.length;

            while (curr && ++depth < length) {
                curr = curr[path[depth]];
            }
            obs.onNext(curr);
        }, function(err) {
            obs.onError(err);
        }, function() {
            obs.onCompleted();
        });
    });
};

},{"121":121,"58":58,"98":98}],77:[function(require,module,exports){
var pathSyntax = require(125);
var isPathValue = require(98);
var setPathValues = require(75);

module.exports = function setValueSync(pathArg, valueArg, errorSelectorArg, comparatorArg) {

    var path = pathSyntax.fromPath(pathArg);
    var value = valueArg;
    var errorSelector = errorSelectorArg;
    var comparator = comparatorArg;

    if (isPathValue(path)) {
        comparator = errorSelector;
        errorSelector = value;
        value = path;
    } else {
        value = {
            path: path,
            value: value
        };
    }

    if (isPathValue(value) === false) {
        throw new Error("Model#setValueSync must be called with an Array path.");
    }

    if (typeof errorSelector !== "function") {
        errorSelector = this._root._errorSelector;
    }

    if (typeof comparator !== "function") {
        comparator = this._root._comparator;
    }

    this._syncCheck("setValueSync");
    setPathValues(this, [value], errorSelector, comparator);
    return this.__getValueSync(this, value.path).value;
};

},{"125":125,"75":75,"98":98}],78:[function(require,module,exports){
module.exports = function arrayClone(array) {
    if (!array) {
        return array;
    }
    var i = -1;
    var n = array.length;
    var array2 = [];
    while (++i < n) {
        array2[i] = array[i];
    }
    return array2;
};

},{}],79:[function(require,module,exports){
module.exports = function arrayFlatMap(array, selector) {
    var index = -1;
    var i = -1;
    var n = array.length;
    var array2 = [];
    while (++i < n) {
        var array3 = selector(array[i], i, array);
        var j = -1;
        var k = array3.length;
        while (++j < k) {
            array2[++index] = array3[j];
        }
    }
    return array2;
};

},{}],80:[function(require,module,exports){
module.exports = function arrayMap(array, selector) {
    var i = -1;
    var n = array.length;
    var array2 = new Array(n);
    while (++i < n) {
        array2[i] = selector(array[i], i, array);
    }
    return array2;
};

},{}],81:[function(require,module,exports){
module.exports = function arraySlice(array, indexArg, endArg) {
    var index = indexArg || 0;
    var i = -1;
    var n = array.length - index;

    if (n < 0) {
        n = 0;
    }

    if (endArg > 0 && n > endArg) {
        n = endArg;
    }

    var array2 = new Array(n);
    while (++i < n) {
        array2[i] = array[i + index];
    }
    return array2;
};

},{}],82:[function(require,module,exports){
var unicodePrefix = require(42);
var hasOwn = require(89);
var isArray = Array.isArray;
var isObject = require(97);

module.exports = function clone(value) {
    var dest = value;
    if (isObject(dest)) {
        dest = isArray(value) ? [] : {};
        var src = value;
        for (var key in src) {
            if (key.charAt(0) === unicodePrefix || !hasOwn(src, key)) {
                continue;
            }
            dest[key] = src[key];
        }
    }
    return dest;
};

},{"42":42,"89":89,"97":97}],83:[function(require,module,exports){
var __ref = require(41);

module.exports = function createHardlink(from, to) {

    // create a back reference
    var backRefs = to.ツrefsLength || 0;
    to[__ref + backRefs] = from;
    to.ツrefsLength = backRefs + 1;

    // create a hard reference
    from.ツrefIndex = backRefs;
    from.ツcontext = to;
};

},{"41":41}],84:[function(require,module,exports){
var splice = require(48);

module.exports = function expireNode(node, expired, lru) {
    if (!node.ツinvalidated) {
        node.ツinvalidated = true;
        expired.push(node);
        splice(lru, node);
    }
    return node;
};

},{"48":48}],85:[function(require,module,exports){
var isObject = require(97);
module.exports = function getSize(node) {
    return isObject(node) && node.$expires || undefined;
};

},{"97":97}],86:[function(require,module,exports){
var isObject = require(97);
module.exports = function getSize(node) {
    return isObject(node) && node.$size || 0;
};

},{"97":97}],87:[function(require,module,exports){
var isObject = require(97);
module.exports = function getTimestamp(node) {
    return isObject(node) && node.$timestamp || undefined;
};

},{"97":97}],88:[function(require,module,exports){
var isObject = require(97);

module.exports = function getType(node, anyType) {
    var type = isObject(node) && node.$type || void 0;
    if (anyType && type) {
        return "branch";
    }
    return type;
};

},{"97":97}],89:[function(require,module,exports){
var isObject = require(97);
var hasOwn = Object.prototype.hasOwnProperty;

module.exports = function(obj, prop) {
  return isObject(obj) && hasOwn.call(obj, prop);
};

},{"97":97}],90:[function(require,module,exports){
module.exports = function insertNode(node, parent, key, version, optimizedPath) {
    node.ツkey = key;
    node.ツparent = parent;

    if (version !== undefined) {
        node.ツversion = version;
    }
    if (!node.ツabsolutePath) {
        node.ツabsolutePath = optimizedPath.slice(0, optimizedPath.index).concat(key);
    }

    parent[key] = node;

    return node;
};

},{}],91:[function(require,module,exports){
var now = require(103);
var $now = require(120);
var $never = require(119);

module.exports = function isAlreadyExpired(node) {
    var exp = node.$expires;
    return (exp != null) && (
        exp !== $never) && (
        exp !== $now) && (
        exp < now());
};

},{"103":103,"119":119,"120":120}],92:[function(require,module,exports){
var now = require(103);
var $now = require(120);
var $never = require(119);

module.exports = function isExpired(node) {
    var exp = node.$expires;
    return (exp != null) && (
        exp !== $never ) && (
        exp === $now || exp < now());
};

},{"103":103,"119":119,"120":120}],93:[function(require,module,exports){
var functionTypeof = "function";

module.exports = function isFunction(func) {
    return Boolean(func) && typeof func === functionTypeof;
};

},{}],94:[function(require,module,exports){
var unicodePrefix = require(42);

/**
 * Determined if the key passed in is an internal key.
 *
 * @param {String} x The key
 * @private
 * @returns {Boolean}
 */
module.exports = function isInternalKey(x) {
    return x === "$size" ||
        x === "$modelCreated" ||
        x.charAt(0) === unicodePrefix;
};

},{"42":42}],95:[function(require,module,exports){
var isObject = require(97);

module.exports = function isJSONEnvelope(envelope) {
    return isObject(envelope) && ("json" in envelope);
};

},{"97":97}],96:[function(require,module,exports){
var isArray = Array.isArray;
var isObject = require(97);

module.exports = function isJSONGraphEnvelope(envelope) {
    return isObject(envelope) && isArray(envelope.paths) && (
        isObject(envelope.jsonGraph) ||
        isObject(envelope.jsong) ||
        isObject(envelope.json) ||
        isObject(envelope.values) ||
        isObject(envelope.value)
    );
};

},{"97":97}],97:[function(require,module,exports){
var objTypeof = "object";
module.exports = function isObject(value) {
    return value !== null && typeof value === objTypeof;
};

},{}],98:[function(require,module,exports){
var isArray = Array.isArray;
var isObject = require(97);

module.exports = function isPathValue(pathValue) {
    return isObject(pathValue) && (
        isArray(pathValue.path) || (
            typeof pathValue.path === "string"
        ));
};

},{"97":97}],99:[function(require,module,exports){
var objTypeof = "object";
module.exports = function isPrimitive(value) {
    return value == null || typeof value !== objTypeof;
};

},{}],100:[function(require,module,exports){
var $ref = require(118);
var $error = require(117);
var getSize = require(86);
var getTimestamp = require(87);
var isObject = require(97);
var isExpired = require(92);
var isFunction = require(93);

var wrapNode = require(114);
var insertNode = require(90);
var expireNode = require(84);
var replaceNode = require(107);
var updateNodeAncestors = require(112);
var reconstructPath = require(104);

module.exports = function mergeJSONGraphNode(
    parent, node, message, key, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector) {

    var sizeOffset;

    var cType, mType,
        cIsObject, mIsObject,
        cTimestamp, mTimestamp;

    // If the cache and message are the same, we can probably return early:
    // - If they're both nullsy,
    //   - If null then the node needs to be wrapped in an atom and inserted.
    //     This happens from whole branch merging when a leaf is just a null value
    //     instead of being wrapped in an atom.
    //   - If undefined then return null (previous behavior).
    // - If they're both branches, return the branch.
    // - If they're both edges, continue below.
    if (node === message) {

        // There should not be undefined values.  Those should always be
        // wrapped in an $atom
        if (message === null) {
            node = wrapNode(message, undefined, message);
            parent = updateNodeAncestors(parent, -node.$size, lru, version);
            node = insertNode(node, parent, key, undefined, optimizedPath);
            return node;
        }

        // The messange and cache are both undefined, therefore return null.
        else if (message === undefined) {
            return message;
        }

        else {
            cIsObject = isObject(node);
            if (cIsObject) {
                // Is the cache node a branch? If so, return the cache branch.
                cType = node.$type;
                if (cType == null) {
                    // Has the branch been introduced to the cache yet? If not,
                    // give it a parent, key, and absolute path.
                    if (node.ツparent == null) {
                        insertNode(node, parent, key, version, optimizedPath);
                    }
                    return node;
                }
            }
        }
    } else {
        cIsObject = isObject(node);
        if (cIsObject) {
            cType = node.$type;
        }
    }

    // If the cache isn't a reference, we might be able to return early.
    if (cType !== $ref) {
        mIsObject = isObject(message);
        if (mIsObject) {
            mType = message.$type;
        }
        if (cIsObject && !cType) {
            // If the cache is a branch and the message is empty or
            // also a branch, continue with the cache branch.
            if (message == null || (mIsObject && !mType)) {
                return node;
            }
        }
    }
    // If the cache is a reference, we might not need to replace it.
    else {
        // If the cache is a reference, but the message is empty, leave the cache alone...
        if (message == null) {
            // ...unless the cache is an expired reference. In that case, expire
            // the cache node and return undefined.
            if (isExpired(node)) {
                expireNode(node, expired, lru);
                return void 0;
            }
            return node;
        }
        mIsObject = isObject(message);
        if (mIsObject) {
            mType = message.$type;
            // If the cache and the message are both references,
            // check if we need to replace the cache reference.
            if (mType === $ref) {
                if (node === message) {
                    // If the cache and message are the same reference,
                    // we performed a whole-branch merge of one of the
                    // grandparents. If we've previously graphed this
                    // reference, break early. Otherwise, continue to
                    // leaf insertion below.
                    if (node.ツparent != null) {
                        return node;
                    }
                } else {

                    cTimestamp = node.$timestamp;
                    mTimestamp = message.$timestamp;

                    // - If either the cache or message reference is expired,
                    //   replace the cache reference with the message.
                    // - If neither of the references are expired, compare their
                    //   timestamps. If either of them don't have a timestamp,
                    //   or the message's timestamp is newer, replace the cache
                    //   reference with the message reference.
                    // - If the message reference is older than the cache
                    //   reference, short-circuit.
                    if (!isExpired(node) && !isExpired(message) && mTimestamp < cTimestamp) {
                        return void 0;
                    }
                }
            }
        }
    }

    // If the cache is a leaf but the message is a branch, merge the branch over the leaf.
    if (cType && mIsObject && !mType) {
        return insertNode(replaceNode(node, message, parent, key, lru, version), parent, key, undefined, optimizedPath);
    }
    // If the message is a sentinel or primitive, insert it into the cache.
    else if (mType || !mIsObject) {
        // If the cache and the message are the same value, we branch-merged one
        // of the message's ancestors. If this is the first time we've seen this
        // leaf, give the message a $size and $type, attach its graph pointers,
        // and update the cache sizes and versions.

        if (mType === $error && isFunction(errorSelector)) {
            message = errorSelector(reconstructPath(requestedPath, key), message);
        }

        if (mType && node === message) {
            if (node.ツparent == null) {
                node = wrapNode(node, cType, node.value);
                parent = updateNodeAncestors(parent, -node.$size, lru, version);
                node = insertNode(node, parent, key, version, optimizedPath);
            }
        }
        // If the cache and message are different, the cache value is expired,
        // or the message is a primitive, replace the cache with the message value.
        // If the message is a sentinel, clone and maintain its type.
        // If the message is a primitive value, wrap it in an atom.
        else {
            var isDistinct = true;
            // If the cache is a branch, but the message is a leaf, replace the
            // cache branch with the message leaf.
            if ((cType && !isExpired(node)) || !cIsObject) {
                // Compare the current cache value with the new value. If either of
                // them don't have a timestamp, or the message's timestamp is newer,
                // replace the cache value with the message value. If a comparator
                // is specified, the comparator takes precedence over timestamps.
                //
                // Comparing either Number or undefined to undefined always results in false.
                isDistinct = (getTimestamp(message) < getTimestamp(node)) === false;
                // If at least one of the cache/message are sentinels, compare them.
                if (isDistinct && (cType || mType) && isFunction(comparator)) {
                    isDistinct = !comparator(node, message, optimizedPath.slice(0, optimizedPath.index));
                }
            }
            if (isDistinct) {
                message = wrapNode(message, mType, mType ? message.value : message);
                sizeOffset = getSize(node) - getSize(message);
                node = replaceNode(node, message, parent, key, lru, version);
                parent = updateNodeAncestors(parent, sizeOffset, lru, version);
                node = insertNode(node, parent, key, version, optimizedPath);
            }
        }

        // Promote the message edge in the LRU.
        if (isExpired(node)) {
            expireNode(node, expired, lru);
        }
    }
    else if (node == null) {
        node = insertNode(message, parent, key, undefined, optimizedPath);
    }

    return node;
};

},{"104":104,"107":107,"112":112,"114":114,"117":117,"118":118,"84":84,"86":86,"87":87,"90":90,"92":92,"93":93,"97":97}],101:[function(require,module,exports){
var $ref = require(118);
var $error = require(117);
var getType = require(88);
var getSize = require(86);
var getTimestamp = require(87);

var isExpired = require(92);
var isPrimitive = require(99);
var isFunction = require(93);

var wrapNode = require(114);
var expireNode = require(84);
var insertNode = require(90);
var replaceNode = require(107);
var updateNodeAncestors = require(112);
var reconstructPath = require(104);

module.exports = function mergeValueOrInsertBranch(
    parent, node, key, value,
    branch, reference, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector) {

    var type = getType(node, reference);

    if (branch || reference) {
        if (type && isExpired(node)) {
            type = "expired";
            expireNode(node, expired, lru);
        }
        if ((type && type !== $ref) || isPrimitive(node)) {
            node = replaceNode(node, {}, parent, key, lru, version);
            node = insertNode(node, parent, key, version, optimizedPath);
        }
    } else {
        var message = value;
        var mType = getType(message);
        // Compare the current cache value with the new value. If either of
        // them don't have a timestamp, or the message's timestamp is newer,
        // replace the cache value with the message value. If a comparator
        // is specified, the comparator takes precedence over timestamps.
        //
        // Comparing either Number or undefined to undefined always results in false.
        var isDistinct = (getTimestamp(message) < getTimestamp(node)) === false;
        // If at least one of the cache/message are sentinels, compare them.
        if ((type || mType) && isFunction(comparator)) {
            isDistinct = !comparator(node, message, optimizedPath.slice(0, optimizedPath.index));
        }
        if (isDistinct) {

            if (mType === $error && isFunction(errorSelector)) {
                message = errorSelector(reconstructPath(requestedPath, key), message);
            }

            message = wrapNode(message, mType, mType ? message.value : message);

            var sizeOffset = getSize(node) - getSize(message);

            node = replaceNode(node, message, parent, key, lru, version);
            parent = updateNodeAncestors(parent, sizeOffset, lru, version);
            node = insertNode(node, parent, key, version, optimizedPath);
        }
    }

    return node;
};

},{"104":104,"107":107,"112":112,"114":114,"117":117,"118":118,"84":84,"86":86,"87":87,"88":88,"90":90,"92":92,"93":93,"99":99}],102:[function(require,module,exports){
module.exports = function noop() {};

},{}],103:[function(require,module,exports){
module.exports = Date.now;

},{}],104:[function(require,module,exports){
/**
 * Reconstructs the path for the current key, from currentPath (requestedPath)
 * state maintained during set/merge walk operations.
 *
 * During the walk, since the requestedPath array is updated after we attempt to
 * merge/insert nodes during a walk (it reflects the inserted node's parent branch)
 * we need to reconstitute a path from it.
 *
 * @param  {Array} currentPath The current requestedPath state, during the walk
 * @param  {String} key        The current key value, during the walk
 * @return {Array} A new array, with the path which represents the node we're about
 * to insert
 */
module.exports = function reconstructPath(currentPath, key) {

    var path = currentPath.slice(0, currentPath.depth);
    path[path.length] = key;

    return path;
};

},{}],105:[function(require,module,exports){
var $ref = require(118);
var splice = require(48);
var isObject = require(97);
var unlinkBackReferences = require(109);
var unlinkForwardReference = require(110);

module.exports = function removeNode(node, parent, key, lru) {
    if (isObject(node)) {
        var type = node.$type;
        if (type) {
            if (type === $ref) {
                unlinkForwardReference(node);
            }
            splice(lru, node);
        }
        unlinkBackReferences(node);
        parent[key] = node.ツparent = void 0;
        return true;
    }
    return false;
};

},{"109":109,"110":110,"118":118,"48":48,"97":97}],106:[function(require,module,exports){
var hasOwn = require(89);
var prefix = require(42);
var removeNode = require(105);

module.exports = function removeNodeAndDescendants(node, parent, key, lru) {
    if (removeNode(node, parent, key, lru)) {
        if (node.$type == null) {
            for (var key2 in node) {
                if (key2[0] !== prefix && key2[0] !== "$" && hasOwn(node, key2)) {
                    removeNodeAndDescendants(node[key2], node, key2, lru);
                }
            }
        }
        return true;
    }
    return false;
};

},{"105":105,"42":42,"89":89}],107:[function(require,module,exports){
var isObject = require(97);
var transferBackReferences = require(108);
var removeNodeAndDescendants = require(106);
var updateBackReferenceVersions = require(111);

module.exports = function replaceNode(node, replacement, parent, key, lru, version) {
    if (node === replacement) {
        return node;
    } else if (isObject(node)) {
        transferBackReferences(node, replacement);
        removeNodeAndDescendants(node, parent, key, lru);
        updateBackReferenceVersions(replacement, version);
    }

    parent[key] = replacement;
    return replacement;
};

},{"106":106,"108":108,"111":111,"97":97}],108:[function(require,module,exports){
var __ref = require(41);

module.exports = function transferBackReferences(fromNode, destNode) {
    var fromNodeRefsLength = fromNode.ツrefsLength || 0,
        destNodeRefsLength = destNode.ツrefsLength || 0,
        i = -1;
    while (++i < fromNodeRefsLength) {
        var ref = fromNode[__ref + i];
        if (ref !== void 0) {
            ref.ツcontext = destNode;
            destNode[__ref + (destNodeRefsLength + i)] = ref;
            fromNode[__ref + i] = void 0;
        }
    }
    destNode.ツrefsLength = fromNodeRefsLength + destNodeRefsLength;
    fromNode.ツrefsLength = void 0;
    return destNode;
};

},{"41":41}],109:[function(require,module,exports){
var __ref = require(41);

module.exports = function unlinkBackReferences(node) {
    var i = -1, n = node.ツrefsLength || 0;
    while (++i < n) {
        var ref = node[__ref + i];
        if (ref != null) {
            ref.ツcontext = ref.ツrefIndex = node[__ref + i] = void 0;
        }
    }
    node.ツrefsLength = void 0;
    return node;
};

},{"41":41}],110:[function(require,module,exports){
var __ref = require(41);

module.exports = function unlinkForwardReference(reference) {
    var destination = reference.ツcontext;
    if (destination) {
        var i = (reference.ツrefIndex || 0) - 1,
            n = (destination.ツrefsLength || 0) - 1;
        while (++i <= n) {
            destination[__ref + i] = destination[__ref + (i + 1)];
        }
        destination.ツrefsLength = n;
        reference.ツrefIndex = reference.ツcontext = destination = void 0;
    }
    return reference;
};

},{"41":41}],111:[function(require,module,exports){
var __ref = require(41);

module.exports = function updateBackReferenceVersions(nodeArg, version) {
    var stack = [nodeArg];
    var count = 0;
    do {
        var node = stack[count];
        if (node && node.ツversion !== version) {
            node.ツversion = version;
            stack[count++] = node.ツparent;
            var i = -1;
            var n = node.ツrefsLength || 0;
            while (++i < n) {
                stack[count++] = node[__ref + i];
            }
        }
    } while (--count > -1);
    return nodeArg;
};

},{"41":41}],112:[function(require,module,exports){
var removeNode = require(105);
var updateBackReferenceVersions = require(111);

module.exports = function updateNodeAncestors(nodeArg, offset, lru, version) {
    var child = nodeArg;
    do {
        var node = child.ツparent;
        var size = child.$size = (child.$size || 0) - offset;
        if (size <= 0 && node != null) {
            removeNode(child, node, child.ツkey, lru);
        } else if (child.ツversion !== version) {
            updateBackReferenceVersions(child, version);
        }
        child = node;
    } while (child);
    return nodeArg;
};

},{"105":105,"111":111}],113:[function(require,module,exports){
var isArray = Array.isArray;
var isPathValue = require(98);
var isJSONGraphEnvelope = require(96);
var isJSONEnvelope = require(95);
var pathSyntax = require(125);

/**
 *
 * @param {Object} allowedInput - allowedInput is a map of input styles
 * that are allowed
 * @private
 */
module.exports = function validateInput(args, allowedInput, method) {
    for (var i = 0, len = args.length; i < len; ++i) {
        var arg = args[i];
        var valid = false;

        // Path
        if (isArray(arg) && allowedInput.path) {
            valid = true;
        }

        // Path Syntax
        else if (typeof arg === "string" && allowedInput.pathSyntax) {
            valid = true;
        }

        // Path Value
        else if (isPathValue(arg) && allowedInput.pathValue) {
            arg.path = pathSyntax.fromPath(arg.path);
            valid = true;
        }

        // jsonGraph {jsonGraph: { ... }, paths: [ ... ]}
        else if (isJSONGraphEnvelope(arg) && allowedInput.jsonGraph) {
            valid = true;
        }

        // json env {json: {...}}
        else if (isJSONEnvelope(arg) && allowedInput.json) {
            valid = true;
        }

        // selector functions
        else if (typeof arg === "function" &&
                 i + 1 === len &&
                 allowedInput.selector) {
            valid = true;
        }

        if (!valid) {
            return new Error("Unrecognized argument " + (typeof arg) + " [" + String(arg) + "] " + "to Model#" + method + "");
        }
    }
    return true;
};

},{"125":125,"95":95,"96":96,"98":98}],114:[function(require,module,exports){
var now = require(103);
var expiresNow = require(120);

var atomSize = 50;

var clone = require(82);
var isArray = Array.isArray;
var getSize = require(86);
var getExpires = require(85);
var atomType = require(116);

module.exports = function wrapNode(nodeArg, typeArg, value) {

    var size = 0;
    var node = nodeArg;
    var type = typeArg;

    if (type) {
        var modelCreated = node.ツmodelCreated;
        node = clone(node);
        size = getSize(node);
        node.$type = type;
        node.ツprev = undefined;
        node.ツnext = undefined;
        node.ツmodelCreated = modelCreated || false;
    } else {
        node = {
            $type: atomType,
            value: value,
            ツprev: undefined,
            ツnext: undefined,
            ツmodelCreated: true
        };
    }

    if (value == null) {
        size = atomSize + 1;
    } else if (size == null || size <= 0) {
        switch (typeof value) {
            case "object":
                if (isArray(value)) {
                    size = atomSize + value.length;
                } else {
                    size = atomSize + 1;
                }
                break;
            case "string":
                size = atomSize + value.length;
                break;
            default:
                size = atomSize + 1;
                break;
        }
    }

    var expires = getExpires(node);

    if (typeof expires === "number" && expires < expiresNow) {
        node.$expires = now() + (expires * -1);
    }

    node.$size = size;

    return node;
};

},{"103":103,"116":116,"120":120,"82":82,"85":85,"86":86}],115:[function(require,module,exports){
/**
 * FromEsObserverAdapter is an adpater from an ES Observer to an Rx 2 Observer
 * @constructor FromEsObserverAdapter
*/
function FromEsObserverAdapter(esObserver) {
    this.esObserver = esObserver;
}

FromEsObserverAdapter.prototype = {
    onNext: function onNext(value) {
        if (typeof this.esObserver.next === "function") {
            this.esObserver.next(value);
        }
    },
    onError: function onError(error) {
        if (typeof this.esObserver.error === "function") {
            this.esObserver.error(error);
        }
    },
    onCompleted: function onCompleted() {
        if (typeof this.esObserver.complete === "function") {
            this.esObserver.complete();
        }
    }
};

/**
 * ToEsSubscriptionAdapter is an adpater from the Rx 2 subscription to the ES subscription
 * @constructor ToEsSubscriptionAdapter
*/
function ToEsSubscriptionAdapter(subscription) {
    this.subscription = subscription;
}

ToEsSubscriptionAdapter.prototype.unsubscribe = function unsubscribe() {
    this.subscription.dispose();
};


function toEsObservable(_self) {
    return {
        subscribe: function subscribe(observer) {
            return new ToEsSubscriptionAdapter(_self.subscribe(new FromEsObserverAdapter(observer)));
        }
    };
}

module.exports = toEsObservable;

},{}],116:[function(require,module,exports){
module.exports = "atom";

},{}],117:[function(require,module,exports){
module.exports = "error";

},{}],118:[function(require,module,exports){
module.exports = "ref";

},{}],119:[function(require,module,exports){
module.exports = 1;

},{}],120:[function(require,module,exports){
module.exports = 0;

},{}],121:[function(require,module,exports){
var fromPath = require(125).fromPath;

function sentinel(type, value, props) {
    var copy = Object.create(null);
    if (props != null) {
        for(var key in props) {
            copy[key] = props[key];
        }

        copy["$type"] = type;
        copy.value = value;
        return copy;
    }
    else {
        return { $type: type, value: value };
    }
}

module.exports = {
    ref: function ref(path, props) {
        return sentinel("ref", fromPath(path), props);
    },
    atom: function atom(value, props) {
        return sentinel("atom", value, props);
    },
    undefined: function() {
        return sentinel("atom");
    },
    error: function error(errorValue, props) {
        return sentinel("error", errorValue, props);
    },
    pathValue: function pathValue(path, value) {
        return { path: fromPath(path), value: value };
    },
    pathInvalidation: function pathInvalidation(path) {
        return { path: fromPath(path), invalidated: true };
    }
};

},{"125":125}],122:[function(require,module,exports){
module.exports = {
    integers: 'integers',
    ranges: 'ranges',
    keys: 'keys'
};

},{}],123:[function(require,module,exports){
var TokenTypes = {
    token: 'token',
    dotSeparator: '.',
    commaSeparator: ',',
    openingBracket: '[',
    closingBracket: ']',
    openingBrace: '{',
    closingBrace: '}',
    escape: '\\',
    space: ' ',
    colon: ':',
    quote: 'quote',
    unknown: 'unknown'
};

module.exports = TokenTypes;

},{}],124:[function(require,module,exports){
module.exports = {
    indexer: {
        nested: 'Indexers cannot be nested.',
        needQuotes: 'unquoted indexers must be numeric.',
        empty: 'cannot have empty indexers.',
        leadingDot: 'Indexers cannot have leading dots.',
        leadingComma: 'Indexers cannot have leading comma.',
        requiresComma: 'Indexers require commas between indexer args.',
        routedTokens: 'Only one token can be used per indexer when specifying routed tokens.'
    },
    range: {
        precedingNaN: 'ranges must be preceded by numbers.',
        suceedingNaN: 'ranges must be suceeded by numbers.'
    },
    routed: {
        invalid: 'Invalid routed token.  only integers|ranges|keys are supported.'
    },
    quote: {
        empty: 'cannot have empty quoted keys.',
        illegalEscape: 'Invalid escape character.  Only quotes are escapable.'
    },
    unexpectedToken: 'Unexpected token.',
    invalidIdentifier: 'Invalid Identifier.',
    invalidPath: 'Please provide a valid path.',
    throwError: function(err, tokenizer, token) {
        if (token) {
            throw err + ' -- ' + tokenizer.parseString + ' with next token: ' + token;
        }
        throw err + ' -- ' + tokenizer.parseString;
    }
};


},{}],125:[function(require,module,exports){
var Tokenizer = require(131);
var head = require(126);
var RoutedTokens = require(122);

var parser = function parser(string, extendedRules) {
    return head(new Tokenizer(string, extendedRules));
};

module.exports = parser;

// Constructs the paths from paths / pathValues that have strings.
// If it does not have a string, just moves the value into the return
// results.
parser.fromPathsOrPathValues = function(paths, ext) {
    if (!paths) {
        return [];
    }

    var out = [];
    for (var i = 0, len = paths.length; i < len; i++) {

        // Is the path a string
        if (typeof paths[i] === 'string') {
            out[i] = parser(paths[i], ext);
        }

        // is the path a path value with a string value.
        else if (typeof paths[i].path === 'string') {
            out[i] = {
                path: parser(paths[i].path, ext), value: paths[i].value
            };
        }

        // just copy it over.
        else {
            out[i] = paths[i];
        }
    }

    return out;
};

// If the argument is a string, this with convert, else just return
// the path provided.
parser.fromPath = function(path, ext) {
    if (!path) {
        return [];
    }

    if (typeof path === 'string') {
        return parser(path, ext);
    }

    return path;
};

// Potential routed tokens.
parser.RoutedTokens = RoutedTokens;

},{"122":122,"126":126,"131":131}],126:[function(require,module,exports){
var TokenTypes = require(123);
var E = require(124);
var indexer = require(127);

/**
 * The top level of the parse tree.  This returns the generated path
 * from the tokenizer.
 */
module.exports = function head(tokenizer) {
    var token = tokenizer.next();
    var state = {};
    var out = [];

    while (!token.done) {

        switch (token.type) {
            case TokenTypes.token:
                var first = +token.token[0];
                if (!isNaN(first)) {
                    E.throwError(E.invalidIdentifier, tokenizer);
                }
                out[out.length] = token.token;
                break;

            // dotSeparators at the top level have no meaning
            case TokenTypes.dotSeparator:
                if (out.length === 0) {
                    E.throwError(E.unexpectedToken, tokenizer);
                }
                break;

            // Spaces do nothing.
            case TokenTypes.space:
                // NOTE: Spaces at the top level are allowed.
                // titlesById  .summary is a valid path.
                break;


            // Its time to decend the parse tree.
            case TokenTypes.openingBracket:
                indexer(tokenizer, token, state, out);
                break;

            default:
                E.throwError(E.unexpectedToken, tokenizer);
                break;
        }

        // Keep cycling through the tokenizer.
        token = tokenizer.next();
    }

    if (out.length === 0) {
        E.throwError(E.invalidPath, tokenizer);
    }

    return out;
};


},{"123":123,"124":124,"127":127}],127:[function(require,module,exports){
var TokenTypes = require(123);
var E = require(124);
var idxE = E.indexer;
var range = require(129);
var quote = require(128);
var routed = require(130);

/**
 * The indexer is all the logic that happens in between
 * the '[', opening bracket, and ']' closing bracket.
 */
module.exports = function indexer(tokenizer, openingToken, state, out) {
    var token = tokenizer.next();
    var done = false;
    var allowedMaxLength = 1;
    var routedIndexer = false;

    // State variables
    state.indexer = [];

    while (!token.done) {

        switch (token.type) {
            case TokenTypes.token:
            case TokenTypes.quote:

                // ensures that token adders are properly delimited.
                if (state.indexer.length === allowedMaxLength) {
                    E.throwError(idxE.requiresComma, tokenizer);
                }
                break;
        }

        switch (token.type) {
            // Extended syntax case
            case TokenTypes.openingBrace:
                routedIndexer = true;
                routed(tokenizer, token, state, out);
                break;


            case TokenTypes.token:
                var t = +token.token;
                if (isNaN(t)) {
                    E.throwError(idxE.needQuotes, tokenizer);
                }
                state.indexer[state.indexer.length] = t;
                break;

            // dotSeparators at the top level have no meaning
            case TokenTypes.dotSeparator:
                if (!state.indexer.length) {
                    E.throwError(idxE.leadingDot, tokenizer);
                }
                range(tokenizer, token, state, out);
                break;

            // Spaces do nothing.
            case TokenTypes.space:
                break;

            case TokenTypes.closingBracket:
                done = true;
                break;


            // The quotes require their own tree due to what can be in it.
            case TokenTypes.quote:
                quote(tokenizer, token, state, out);
                break;


            // Its time to decend the parse tree.
            case TokenTypes.openingBracket:
                E.throwError(idxE.nested, tokenizer);
                break;

            case TokenTypes.commaSeparator:
                ++allowedMaxLength;
                break;

            default:
                E.throwError(E.unexpectedToken, tokenizer);
                break;
        }

        // If done, leave loop
        if (done) {
            break;
        }

        // Keep cycling through the tokenizer.
        token = tokenizer.next();
    }

    if (state.indexer.length === 0) {
        E.throwError(idxE.empty, tokenizer);
    }

    if (state.indexer.length > 1 && routedIndexer) {
        E.throwError(idxE.routedTokens, tokenizer);
    }

    // Remember, if an array of 1, keySets will be generated.
    if (state.indexer.length === 1) {
        state.indexer = state.indexer[0];
    }

    out[out.length] = state.indexer;

    // Clean state.
    state.indexer = undefined;
};


},{"123":123,"124":124,"128":128,"129":129,"130":130}],128:[function(require,module,exports){
var TokenTypes = require(123);
var E = require(124);
var quoteE = E.quote;

/**
 * quote is all the parse tree in between quotes.  This includes the only
 * escaping logic.
 *
 * parse-tree:
 * <opening-quote>(.|(<escape><opening-quote>))*<opening-quote>
 */
module.exports = function quote(tokenizer, openingToken, state, out) {
    var token = tokenizer.next();
    var innerToken = '';
    var openingQuote = openingToken.token;
    var escaping = false;
    var done = false;

    while (!token.done) {

        switch (token.type) {
            case TokenTypes.token:
            case TokenTypes.space:

            case TokenTypes.dotSeparator:
            case TokenTypes.commaSeparator:

            case TokenTypes.openingBracket:
            case TokenTypes.closingBracket:
            case TokenTypes.openingBrace:
            case TokenTypes.closingBrace:
                if (escaping) {
                    E.throwError(quoteE.illegalEscape, tokenizer);
                }

                innerToken += token.token;
                break;


            case TokenTypes.quote:
                // the simple case.  We are escaping
                if (escaping) {
                    innerToken += token.token;
                    escaping = false;
                }

                // its not a quote that is the opening quote
                else if (token.token !== openingQuote) {
                    innerToken += token.token;
                }

                // last thing left.  Its a quote that is the opening quote
                // therefore we must produce the inner token of the indexer.
                else {
                    done = true;
                }

                break;
            case TokenTypes.escape:
                escaping = true;
                break;

            default:
                E.throwError(E.unexpectedToken, tokenizer);
        }

        // If done, leave loop
        if (done) {
            break;
        }

        // Keep cycling through the tokenizer.
        token = tokenizer.next();
    }

    if (innerToken.length === 0) {
        E.throwError(quoteE.empty, tokenizer);
    }

    state.indexer[state.indexer.length] = innerToken;
};


},{"123":123,"124":124}],129:[function(require,module,exports){
var Tokenizer = require(131);
var TokenTypes = require(123);
var E = require(124);

/**
 * The indexer is all the logic that happens in between
 * the '[', opening bracket, and ']' closing bracket.
 */
module.exports = function range(tokenizer, openingToken, state, out) {
    var token = tokenizer.peek();
    var dotCount = 1;
    var done = false;
    var inclusive = true;

    // Grab the last token off the stack.  Must be an integer.
    var idx = state.indexer.length - 1;
    var from = Tokenizer.toNumber(state.indexer[idx]);
    var to;

    if (isNaN(from)) {
        E.throwError(E.range.precedingNaN, tokenizer);
    }

    // Why is number checking so difficult in javascript.

    while (!done && !token.done) {

        switch (token.type) {

            // dotSeparators at the top level have no meaning
            case TokenTypes.dotSeparator:
                if (dotCount === 3) {
                    E.throwError(E.unexpectedToken, tokenizer);
                }
                ++dotCount;

                if (dotCount === 3) {
                    inclusive = false;
                }
                break;

            case TokenTypes.token:
                // move the tokenizer forward and save to.
                to = Tokenizer.toNumber(tokenizer.next().token);

                // throw potential error.
                if (isNaN(to)) {
                    E.throwError(E.range.suceedingNaN, tokenizer);
                }

                done = true;
                break;

            default:
                done = true;
                break;
        }

        // Keep cycling through the tokenizer.  But ranges have to peek
        // before they go to the next token since there is no 'terminating'
        // character.
        if (!done) {
            tokenizer.next();

            // go to the next token without consuming.
            token = tokenizer.peek();
        }

        // break and remove state information.
        else {
            break;
        }
    }

    state.indexer[idx] = {from: from, to: inclusive ? to : to - 1};
};


},{"123":123,"124":124,"131":131}],130:[function(require,module,exports){
var TokenTypes = require(123);
var RoutedTokens = require(122);
var E = require(124);
var routedE = E.routed;

/**
 * The routing logic.
 *
 * parse-tree:
 * <opening-brace><routed-token>(:<token>)<closing-brace>
 */
module.exports = function routed(tokenizer, openingToken, state, out) {
    var routeToken = tokenizer.next();
    var named = false;
    var name = '';

    // ensure the routed token is a valid ident.
    switch (routeToken.token) {
        case RoutedTokens.integers:
        case RoutedTokens.ranges:
        case RoutedTokens.keys:
            //valid
            break;
        default:
            E.throwError(routedE.invalid, tokenizer);
            break;
    }

    // Now its time for colon or ending brace.
    var next = tokenizer.next();

    // we are parsing a named identifier.
    if (next.type === TokenTypes.colon) {
        named = true;

        // Get the token name or a white space character.
        next = tokenizer.next();

        // Skip over preceeding white space
        while (next.type === TokenTypes.space) {
            next = tokenizer.next();
        }

        if (next.type !== TokenTypes.token) {
            E.throwError(routedE.invalid, tokenizer);
        }
        name = next.token;

        // Move to the closing brace or white space character
        next = tokenizer.next();

        // Skip over any white space to get to the closing brace
        while (next.type === TokenTypes.space) {
            next = tokenizer.next();
        }
    }

    // must close with a brace.

    if (next.type === TokenTypes.closingBrace) {
        var outputToken = {
            type: routeToken.token,
            named: named,
            name: name
        };
        state.indexer[state.indexer.length] = outputToken;
    }

    // closing brace expected
    else {
        E.throwError(routedE.invalid, tokenizer);
    }

};


},{"122":122,"123":123,"124":124}],131:[function(require,module,exports){
var TokenTypes = require(123);
var DOT_SEPARATOR = '.';
var COMMA_SEPARATOR = ',';
var OPENING_BRACKET = '[';
var CLOSING_BRACKET = ']';
var OPENING_BRACE = '{';
var CLOSING_BRACE = '}';
var COLON = ':';
var ESCAPE = '\\';
var DOUBLE_OUOTES = '"';
var SINGE_OUOTES = "'";
var TAB = "\t";
var SPACE = " ";
var LINE_FEED = '\n';
var CARRIAGE_RETURN = '\r';
var SPECIAL_CHARACTERS = '\\\'"[]., \t\n\r';
var EXT_SPECIAL_CHARACTERS = '\\{}\'"[]., :\t\n\r';

var Tokenizer = module.exports = function(string, ext) {
    this._string = string;
    this._idx = -1;
    this._extended = ext;
    this.parseString = '';
};

Tokenizer.prototype = {
    /**
     * grabs the next token either from the peek operation or generates the
     * next token.
     */
    next: function() {
        var nextToken = this._nextToken ?
            this._nextToken : getNext(this._string, this._idx, this._extended);

        this._idx = nextToken.idx;
        this._nextToken = false;
        this.parseString += nextToken.token.token;

        return nextToken.token;
    },

    /**
     * will peak but not increment the tokenizer
     */
    peek: function() {
        var nextToken = this._nextToken ?
            this._nextToken : getNext(this._string, this._idx, this._extended);
        this._nextToken = nextToken;

        return nextToken.token;
    }
};

Tokenizer.toNumber = function toNumber(x) {
    if (!isNaN(+x)) {
        return +x;
    }
    return NaN;
};

function toOutput(token, type, done) {
    return {
        token: token,
        done: done,
        type: type
    };
}

function getNext(string, idx, ext) {
    var output = false;
    var token = '';
    var specialChars = ext ?
        EXT_SPECIAL_CHARACTERS : SPECIAL_CHARACTERS;
    var done;

    do {

        done = idx + 1 >= string.length;
        if (done) {
            break;
        }

        // we have to peek at the next token
        var character = string[idx + 1];

        if (character !== undefined &&
            specialChars.indexOf(character) === -1) {

            token += character;
            ++idx;
            continue;
        }

        // The token to delimiting character transition.
        else if (token.length) {
            break;
        }

        ++idx;
        var type;
        switch (character) {
            case DOT_SEPARATOR:
                type = TokenTypes.dotSeparator;
                break;
            case COMMA_SEPARATOR:
                type = TokenTypes.commaSeparator;
                break;
            case OPENING_BRACKET:
                type = TokenTypes.openingBracket;
                break;
            case CLOSING_BRACKET:
                type = TokenTypes.closingBracket;
                break;
            case OPENING_BRACE:
                type = TokenTypes.openingBrace;
                break;
            case CLOSING_BRACE:
                type = TokenTypes.closingBrace;
                break;
            case TAB:
            case SPACE:
            case LINE_FEED:
            case CARRIAGE_RETURN:
                type = TokenTypes.space;
                break;
            case DOUBLE_OUOTES:
            case SINGE_OUOTES:
                type = TokenTypes.quote;
                break;
            case ESCAPE:
                type = TokenTypes.escape;
                break;
            case COLON:
                type = TokenTypes.colon;
                break;
            default:
                type = TokenTypes.unknown;
                break;
        }
        output = toOutput(character, type, false);
        break;
    } while (!done);

    if (!output && token.length) {
        output = toOutput(token, TokenTypes.token, false);
    }

    if (!output) {
        output = {done: true};
    }

    return {
        token: output,
        idx: idx
    };
}



},{"123":123}],132:[function(require,module,exports){
var toPaths = require(146);
var toTree = require(147);

module.exports = function collapse(paths) {
    var collapseMap = paths.
        reduce(function(acc, path) {
            var len = path.length;
            if (!acc[len]) {
                acc[len] = [];
            }
            acc[len].push(path);
            return acc;
        }, {});

    Object.
        keys(collapseMap).
        forEach(function(collapseKey) {
            collapseMap[collapseKey] = toTree(collapseMap[collapseKey]);
        });

    return toPaths(collapseMap);
};

},{"146":146,"147":147}],133:[function(require,module,exports){
/*eslint-disable*/
module.exports = {
    innerReferences: 'References with inner references are not allowed.',
    circularReference: 'There appears to be a circular reference, maximum reference following exceeded.'
};


},{}],134:[function(require,module,exports){
var cloneArray = require(143);
var $ref = require(145).$ref;
var errors = require(133);

/**
 * performs the simplified cache reference follow.  This
 * differs from get as there is just following and reporting,
 * not much else.
 *
 * @param {Object} cacheRoot
 * @param {Array} ref
 */
module.exports = function followReference(cacheRoot, ref, maxRefFollow) {
    var current = cacheRoot;
    var refPath = ref;
    var depth = -1;
    var length = refPath.length;
    var key, next, type;
    var referenceCount = 0;

    while (++depth < length) {
        key = refPath[depth];
        next = current[key];
        type = next && next.$type;

        if (!next || type && type !== $ref) {
            current = next;
            break;
        }

        // Show stopper exception.  This route is malformed.
        if (type && type === $ref && depth + 1 < length) {
            var err = new Error(errors.innerReferences);
            err.throwToNext = true;
            throw err;
        }

        // potentially follow reference
        if (depth + 1 === length) {
            if (type === $ref) {
                depth = -1;
                refPath = next.value;
                length = refPath.length;
                next = cacheRoot;
                referenceCount++;
            }

            if (referenceCount > maxRefFollow) {
                throw new Error(errors.circularReference);
            }
        }
        current = next;
    }

    return [current, cloneArray(refPath)];
};


},{"133":133,"143":143,"145":145}],135:[function(require,module,exports){
var isArray = Array.isArray;
var nullTerminator = require(144);

module.exports = hasIntersection

/**
 * Tests to see if the intersection should be stripped from the
 * total paths.  The only way this happens currently is if the entirety
 * of the path is contained in the tree.
 * @private
 */

function hasIntersection(tree, path, depth, length) {

    if (depth === length) {
        return true;
    }

    var intersects = true;
    var keyset, keysetIndex = -1, keysetLength = 0;
    var next, nextKey, nextDepth = depth + 1,
        keyIsRange, rangeEnd, keysOrRanges;

    keyset = path[depth];

    if (keyset === null) {
        return tree === nullTerminator;
    }

    iteratingKeyset: do {
        // If the keyset is a primitive value, we've found our `nextKey`.
        if ('object' !== typeof keyset) {
            nextKey = keyset;
            rangeEnd = undefined;
            keyIsRange = false;
        }
        // If we encounter a Keyset, either iterate through the Keys and Ranges,
        // or throw an error if we're already iterating a Keyset. Keysets cannot
        // contain other Keysets.
        else if (isArray(keyset)) {
            // If we've already encountered an Array keyset, throw an error.
            if (keysOrRanges !== undefined) {
                break iteratingKeyset;
            }
            keysetIndex = 0;
            keysOrRanges = keyset;
            keysetLength = keyset.length;
            // If an Array of keys or ranges is empty, terminate the graph walk
            // and return the json constructed so far. An example of an empty
            // Keyset is: ['lolomo', [], 'summary']. This should short circuit
            // without building missing paths.
            if (0 === keysetLength) {
                break iteratingKeyset;
            }
            // Assign `keyset` to the first value in the Keyset. Re-entering the
            // outer loop mimics a singly-recursive function call.
            keyset = keysOrRanges[keysetIndex];
            continue iteratingKeyset;
        }
        // If the Keyset isn't a primitive or Array, then it must be a Range.
        else {
            rangeEnd = keyset.to;
            nextKey = keyset.from || 0;
            if ("number" !== typeof rangeEnd) {
                rangeEnd = nextKey + (keyset.length || 0) - 1;
            }
            if ((rangeEnd - nextKey) < 0) {
                break iteratingKeyset;
            }
            keyIsRange = true;
        }

        do {
            if (nextDepth === length) {
                if (tree[nextKey] !== null) {
                    return false;
                }
            } else {
                next = tree[nextKey];
                if (next === null || next === undefined) {
                    return false;
                } else if (hasIntersection(next, path, nextDepth, length) === false) {
                    return false;
                }
            }
        }
        // Re-enter the inner loop and continue iterating the Range, or exit
        // here if we encountered a Key.
        while (keyIsRange && ++nextKey <= rangeEnd);

        // If we've exhausted the Keyset (or never encountered one at all),
        // exit the outer loop.
        if (++keysetIndex === keysetLength) {
            break iteratingKeyset;
        }

        // Otherwise get the next Key or Range from the Keyset and re-enter the
        // outer loop from the top.
        keyset = keysOrRanges[keysetIndex];
    } while (true);

    return true;
}

},{"144":144}],136:[function(require,module,exports){
module.exports = {
    iterateKeySet: require(137),
    toTree: require(147),
    toTreeWithUnion: require(148),
    pathsComplementFromTree: require(141),
    pathsComplementFromLengthTree: require(140),
    hasIntersection: require(135),
    toPaths: require(146),
    collapse: require(132),
    optimizePathSets: require(138),
    pathCount: require(139)
};

},{"132":132,"135":135,"137":137,"138":138,"139":139,"140":140,"141":141,"146":146,"147":147,"148":148}],137:[function(require,module,exports){
var isArray = Array.isArray;

/**
 * Takes in a keySet and a note attempts to iterate over it.
 * If the value is a primitive, the key will be returned and the note will
 * be marked done
 * If the value is an object, then each value of the range will be returned
 * and when finished the note will be marked done.
 * If the value is an array, each value will be iterated over, if any of the
 * inner values are ranges, those will be iterated over.  When fully done,
 * the note will be marked done.
 *
 * @param {Object|Array|String|Number} keySet -
 * @param {Object} note - The non filled note
 * @returns {String|Number|undefined} - The current iteration value.
 * If undefined, then the keySet is empty
 * @public
 */
module.exports = function iterateKeySet(keySet, note) {
    if (note.isArray === undefined) {
        initializeNote(keySet, note);
    }

    // Array iteration
    if (note.isArray) {
        var nextValue;

        // Cycle through the array and pluck out the next value.
        do {
            if (note.loaded && note.rangeOffset > note.to) {
                ++note.arrayOffset;
                note.loaded = false;
            }

            var idx = note.arrayOffset, length = keySet.length;
            if (idx >= length) {
                note.done = true;
                break;
            }

            var el = keySet[note.arrayOffset];
            var type = typeof el;

            // Inner range iteration.
            if (type === 'object') {
                if (!note.loaded) {
                    initializeRange(el, note);
                }

                // Empty to/from
                if (note.empty) {
                    continue;
                }

                nextValue = note.rangeOffset++;
            }

            // Primitive iteration in array.
            else {
                ++note.arrayOffset;
                nextValue = el;
            }
        } while (nextValue === undefined);

        return nextValue;
    }

    // Range iteration
    else if (note.isObject) {
        if (!note.loaded) {
            initializeRange(keySet, note);
        }
        if (note.rangeOffset > note.to) {
            note.done = true;
            return undefined;
        }

        return note.rangeOffset++;
    }

    // Primitive value
    else {
        note.done = true;
        return keySet;
    }
};

function initializeRange(key, memo) {
    var from = memo.from = key.from || 0;
    var to = memo.to = key.to ||
        (typeof key.length === 'number' &&
        memo.from + key.length - 1 || 0);
    memo.rangeOffset = memo.from;
    memo.loaded = true;
    if (from > to) {
        memo.empty = true;
    }
}

function initializeNote(key, note) {
    note.done = false;
    var isObject = note.isObject = !!(key && typeof key === 'object');
    note.isArray = isObject && isArray(key);
    note.arrayOffset = 0;
}

},{}],138:[function(require,module,exports){
var iterateKeySet = require(137);
var cloneArray = require(143);
var catAndSlice = require(142);
var $types = require(145);
var $ref = $types.$ref;
var followReference = require(134);

/**
 * The fastest possible optimize of paths.
 *
 * What it does:
 * - Any atom short-circuit / found value will be removed from the path.
 * - All paths will be exploded which means that collapse will need to be
 *   ran afterwords.
 * - Any missing path will be optimized as much as possible.
 */
module.exports = function optimizePathSets(cache, paths, maxRefFollow) {
    var optimized = [];
    paths.forEach(function(p) {
        optimizePathSet(cache, cache, p, 0, optimized, [], maxRefFollow);
    });

    return optimized;
};


/**
 * optimizes one pathSet at a time.
 */
function optimizePathSet(cache, cacheRoot, pathSet,
                         depth, out, optimizedPath, maxRefFollow) {

    // at missing, report optimized path.
    if (cache === undefined) {
        out[out.length] = catAndSlice(optimizedPath, pathSet, depth);
        return;
    }

    // all other sentinels are short circuited.
    // Or we found a primitive (which includes null)
    if (cache === null || (cache.$type && cache.$type !== $ref) ||
            (typeof cache !== 'object')) {
        return;
    }

    // If the reference is the last item in the path then do not
    // continue to search it.
    if (cache.$type === $ref && depth === pathSet.length) {
        return;
    }

    var keySet = pathSet[depth];
    var isKeySet = typeof keySet === 'object';
    var nextDepth = depth + 1;
    var iteratorNote = false;
    var key = keySet;
    if (isKeySet) {
        iteratorNote = {};
        key = iterateKeySet(keySet, iteratorNote);
    }
    var next, nextOptimized;
    do {
        next = cache[key];
        var optimizedPathLength = optimizedPath.length;
        if (key !== null) {
            optimizedPath[optimizedPathLength] = key;
        }

        if (next && next.$type === $ref && nextDepth < pathSet.length) {
            var refResults =
                followReference(cacheRoot, next.value, maxRefFollow);
            next = refResults[0];

            // must clone to avoid the mutation from above destroying the cache.
            nextOptimized = cloneArray(refResults[1]);
        } else {
            nextOptimized = optimizedPath;
        }

        optimizePathSet(next, cacheRoot, pathSet, nextDepth,
                        out, nextOptimized, maxRefFollow);
        optimizedPath.length = optimizedPathLength;

        if (iteratorNote && !iteratorNote.done) {
            key = iterateKeySet(keySet, iteratorNote);
        }
    } while (iteratorNote && !iteratorNote.done);
}



},{"134":134,"137":137,"142":142,"143":143,"145":145}],139:[function(require,module,exports){
"use strict";

/**
 * Helper for getPathCount. Used to determine the size of a key or range.
 * @function
 * @param {Object} rangeOrKey
 * @return The size of the key or range passed in.
 */
function getRangeOrKeySize(rangeOrKey) {
    if (rangeOrKey == null) {
        return 1;
    } else if (Array.isArray(rangeOrKey)) {
        throw new Error("Unexpected Array found in keySet: " + JSON.stringify(rangeOrKey));
    } else if (typeof rangeOrKey === "object") {
        return getRangeSize(rangeOrKey);
    } else {
        return 1;
    }
}

/**
 * Returns the size (number of items) in a Range,
 * @function
 * @param {Object} range The Range with both "from" and "to", or just "to"
 * @return The number of items in the range.
 */
function getRangeSize(range) {

    var to = range.to;
    var length = range.length;

    if (to != null) {
        if (isNaN(to) || parseInt(to, 10) !== to) {
            throw new Error("Invalid range, 'to' is not an integer: " + JSON.stringify(range));
        }
        var from = range.from || 0;
        if (isNaN(from) || parseInt(from, 10) !== from) {
            throw new Error("Invalid range, 'from' is not an integer: " + JSON.stringify(range));
        }
        if (from <= to) {
            return (to - from) + 1;
        } else {
            return 0;
        }
    } else if (length != null) {
        if (isNaN(length) || parseInt(length, 10) !== length) {
            throw new Error("Invalid range, 'length' is not an integer: " + JSON.stringify(range));
        } else {
            return length;
        }
    } else {
        throw new Error("Invalid range, expected 'to' or 'length': " + JSON.stringify(range));
    }
}

/**
 * Returns a count of the number of paths this pathset
 * represents.
 *
 * For example, ["foo", {"from":0, "to":10}, "bar"],
 * would represent 11 paths (0 to 10, inclusive), and
 * ["foo, ["baz", "boo"], "bar"] would represent 2 paths.
 *
 * @function
 * @param {Object[]} pathSet the path set.
 *
 * @return The number of paths this represents
 */
function getPathCount(pathSet) {
    if (pathSet.length === 0) {
        throw new Error("All paths must have length larger than zero.");
    }

    var numPaths = 1;

    for (var i = 0; i < pathSet.length; i++) {
        var segment = pathSet[i];

        if (Array.isArray(segment)) {

            var numKeys = 0;

            for (var j = 0; j < segment.length; j++) {
                var keySet = segment[j];

                numKeys += getRangeOrKeySize(keySet);
            }

            numPaths *= numKeys;

        } else {
            numPaths *= getRangeOrKeySize(segment);
        }
    }

    return numPaths;
}


module.exports = getPathCount;

},{}],140:[function(require,module,exports){
var hasIntersection = require(135);

/**
 * Compares the paths passed in with the tree.  Any of the paths that are in
 * the tree will be stripped from the paths.
 *
 * **Does not mutate** the incoming paths object.
 * **Proper subset** only matching.
 *
 * @param {Array} paths - A list of paths (complex or simple) to strip the
 * intersection
 * @param {Object} tree -
 * @public
 */
module.exports = function pathsComplementFromLengthTree(paths, tree) {
    var out = [];
    var outLength = -1;

    for (var i = 0, len = paths.length; i < len; ++i) {
        // If this does not intersect then add it to the output.
        var path = paths[i];
        if (!hasIntersection(tree[path.length], path, 0, path.length)) {
            out[++outLength] = path;
        }
    }
    return out;
};


},{"135":135}],141:[function(require,module,exports){
var hasIntersection = require(135);

/**
 * Compares the paths passed in with the tree.  Any of the paths that are in
 * the tree will be stripped from the paths.
 *
 * **Does not mutate** the incoming paths object.
 * **Proper subset** only matching.
 *
 * @param {Array} paths - A list of paths (complex or simple) to strip the
 * intersection
 * @param {Object} tree -
 * @public
 */
module.exports = function pathsComplementFromTree(paths, tree) {
    var out = [];
    var outLength = -1;

    for (var i = 0, len = paths.length; i < len; ++i) {
        // If this does not intersect then add it to the output.
        if (!hasIntersection(tree, paths[i], 0, paths[i].length)) {
            out[++outLength] = paths[i];
        }
    }
    return out;
};


},{"135":135}],142:[function(require,module,exports){
module.exports = function catAndSlice(a, b, slice) {
    var next = [], i, j, len;
    for (i = 0, len = a.length; i < len; ++i) {
        next[i] = a[i];
    }

    for (j = slice || 0, len = b.length; j < len; ++j, ++i) {
        next[i] = b[j];
    }

    return next;
};


},{}],143:[function(require,module,exports){
function cloneArray(arr, index) {
    var a = [];
    var len = arr.length;
    for (var i = index || 0; i < len; i++) {
        a[i] = arr[i];
    }
    return a;
}

module.exports = cloneArray;


},{}],144:[function(require,module,exports){
module.exports = { $__null__$: null };

},{}],145:[function(require,module,exports){
module.exports = {
    $ref: 'ref',
    $atom: 'atom',
    $error: 'error'
};


},{}],146:[function(require,module,exports){
var isArray = Array.isArray;
var typeOfObject = "object";
var nullTerminator = require(144);

/* jshint forin: false */
module.exports = function toPaths(lengths) {
    var pathmap;
    var allPaths = [];
    var allPathsLength = 0;
    for (var length in lengths) {
        if (isNumber(length) && isObject(pathmap = lengths[length])) {
            var paths = collapsePathMap(pathmap, 0, parseInt(length, 10)).sets;
            var pathsIndex = -1;
            var pathsCount = paths.length;
            while (++pathsIndex < pathsCount) {
                allPaths[allPathsLength++] = collapsePathSetIndexes(paths[pathsIndex]);
            }
        }
    }
    return allPaths;
};

function isObject(value) {
    return value !== null && typeof value === typeOfObject;
}

function collapsePathMap(pathmap, depth, length) {

    var key;
    var code = getHashCode(String(depth));
    var subs = Object.create(null);

    var codes = [];
    var codesIndex = -1;
    var codesCount = 0;

    var pathsets = [];
    var pathsetsCount = 0;

    var subPath, subCode,
        subKeys, subKeysIndex, subKeysCount,
        subSets, subSetsIndex, subSetsCount,
        pathset, pathsetIndex, pathsetCount,
        firstSubKey, pathsetClone;

    subKeys = [];
    subKeysIndex = -1;

    if (depth < length - 1) {

        subKeysCount = getSortedKeys(pathmap, subKeys);

        while (++subKeysIndex < subKeysCount) {
            key = subKeys[subKeysIndex];
            subPath = collapsePathMap(pathmap[key], depth + 1, length);
            subCode = subPath.code;
            if(subs[subCode]) {
                subPath = subs[subCode];
            } else {
                codes[codesCount++] = subCode;
                subPath = subs[subCode] = {
                    keys: [],
                    sets: subPath.sets
                };
            }
            code = getHashCode(code + key + subCode);

            isNumber(key) &&
                subPath.keys.push(parseInt(key, 10)) ||
                subPath.keys.push(key);
        }

        while(++codesIndex < codesCount) {

            key = codes[codesIndex];
            subPath = subs[key];
            subKeys = subPath.keys;
            subKeysCount = subKeys.length;

            if (subKeysCount > 0) {

                subSets = subPath.sets;
                subSetsIndex = -1;
                subSetsCount = subSets.length;
                firstSubKey = subKeys[0];

                while (++subSetsIndex < subSetsCount) {

                    pathset = subSets[subSetsIndex];
                    pathsetIndex = -1;
                    pathsetCount = pathset.length;
                    pathsetClone = new Array(pathsetCount + 1);
                    pathsetClone[0] = subKeysCount > 1 && subKeys || firstSubKey;

                    while (++pathsetIndex < pathsetCount) {
                        pathsetClone[pathsetIndex + 1] = pathset[pathsetIndex];
                    }

                    pathsets[pathsetsCount++] = pathsetClone;
                }
            }
        }
    } else {
        subKeysCount = getSortedKeys(pathmap, subKeys);
        if (subKeysCount > 1) {
            pathsets[pathsetsCount++] = [subKeys];
        } else {
            pathsets[pathsetsCount++] = subKeys;
        }
        while (++subKeysIndex < subKeysCount) {
            code = getHashCode(code + subKeys[subKeysIndex]);
        }
    }

    return {
        code: code,
        sets: pathsets
    };
}

function collapsePathSetIndexes(pathset) {

    var keysetIndex = -1;
    var keysetCount = pathset.length;

    while (++keysetIndex < keysetCount) {
        var keyset = pathset[keysetIndex];
        if (isArray(keyset)) {
            pathset[keysetIndex] = collapseIndex(keyset);
        }
    }

    return pathset;
}

/**
 * Collapse range indexers, e.g. when there is a continuous
 * range in an array, turn it into an object instead:
 *
 * [1,2,3,4,5,6] => {"from":1, "to":6}
 *
 * @private
 */
function collapseIndex(keyset) {

    // Do we need to dedupe an indexer keyset if they're duplicate consecutive integers?
    // var hash = {};
    var keyIndex = -1;
    var keyCount = keyset.length - 1;
    var isSparseRange = keyCount > 0;

    while (++keyIndex <= keyCount) {

        var key = keyset[keyIndex];

        if (!isNumber(key) /* || hash[key] === true*/ ) {
            isSparseRange = false;
            break;
        }
        // hash[key] = true;
        // Cast number indexes to integers.
        keyset[keyIndex] = parseInt(key, 10);
    }

    if (isSparseRange === true) {

        keyset.sort(sortListAscending);

        var from = keyset[0];
        var to = keyset[keyCount];

        // If we re-introduce deduped integer indexers, change this comparson to "===".
        if (to - from <= keyCount) {
            return {
                from: from,
                to: to
            };
        }
    }

    return keyset;
}

function sortListAscending(a, b) {
    return a - b;
}

/* jshint forin: false */
function getSortedKeys(map, keys, sort) {
    var len = 0;
    if (map === nullTerminator) {
        keys[len++] = null;
    } else {
        for (var key in map) {
            // if (key === '$__null__$') {
            //     key = null;
            // }
            keys[len++] = key;
        }
        if (len > 1) {
            keys.sort(sort);
        }
    }
    return len;
}

function getHashCode(key) {
    var code = 5381;
    var index = -1;
    var count = key.length;
    while (++index < count) {
        code = (code << 5) + code + key.charCodeAt(index);
    }
    return String(code);
}

/**
 * Return true if argument is a number or can be cast to a number
 * @private
 */
function isNumber(val) {
    // parseFloat NaNs numeric-cast false positives (null|true|false|"")
    // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
    // subtraction forces infinities to NaN
    // adding 1 corrects loss of precision from parseFloat (#15100)
    return !isArray(val) && (val - parseFloat(val) + 1) >= 0;
}


},{"144":144}],147:[function(require,module,exports){
var isArray = Array.isArray;
var nullTerminator = require(144);

/**
 * @param {Array} paths -
 * @returns {Object} -
 */
module.exports = function toTree(paths) {
    return paths.reduce(function(acc, path) {
        return innerToTree(acc, path, 0, path.length);
    }, {});
};

function innerToTree(seed, path, depth, length) {

    if (depth === length) {
        return true;
    }

    var keyset, keysetIndex = -1, keysetLength = 0;
    var node, next, nextKey, nextDepth = depth + 1,
        keyIsRange, rangeEnd, keysOrRanges;

    keyset = path[depth];

    if (keyset === null) {
        return nullTerminator;
    }

    seed = seed || {};

    iteratingKeyset: do {
        // If the keyset is a primitive value, we've found our `nextKey`.
        if ('object' !== typeof keyset) {
            nextKey = keyset;
            rangeEnd = undefined;
            keyIsRange = false;
        }
        // If we encounter a Keyset, either iterate through the Keys and Ranges,
        // or throw an error if we're already iterating a Keyset. Keysets cannot
        // contain other Keysets.
        else if (isArray(keyset)) {
            // If we've already encountered an Array keyset, throw an error.
            if (keysOrRanges !== undefined) {
                break iteratingKeyset;
            }
            keysetIndex = 0;
            keysOrRanges = keyset;
            keysetLength = keyset.length;
            // If an Array of keys or ranges is empty, terminate the graph walk
            // and return the json constructed so far. An example of an empty
            // Keyset is: ['lolomo', [], 'summary']. This should short circuit
            // without building missing paths.
            if (0 === keysetLength) {
                break iteratingKeyset;
            }
            // Assign `keyset` to the first value in the Keyset. Re-entering the
            // outer loop mimics a singly-recursive function call.
            keyset = keysOrRanges[keysetIndex];
            continue iteratingKeyset;
        }
        // If the Keyset isn't a primitive or Array, then it must be a Range.
        else {
            rangeEnd = keyset.to;
            nextKey = keyset.from || 0;
            if ("number" !== typeof rangeEnd) {
                rangeEnd = nextKey + (keyset.length || 0) - 1;
            }
            if ((rangeEnd - nextKey) < 0) {
                break iteratingKeyset;
            }
            keyIsRange = true;
        }

        do {
            if (nextDepth === length) {
                seed[nextKey] = null;
            } else {
                node = seed[nextKey];
                next = innerToTree(node, path, nextDepth, length);
                if (!next) {
                    seed[nextKey] = null;
                } else if (!node) {
                    seed[nextKey] = next;
                }
            }
        }
        // Re-enter the inner loop and continue iterating the Range, or exit
        // here if we encountered a Key.
        while (keyIsRange && ++nextKey <= rangeEnd);

        // If we've exhausted the Keyset (or never encountered one at all),
        // exit the outer loop.
        if (++keysetIndex === keysetLength) {
            break iteratingKeyset;
        }

        // Otherwise get the next Key or Range from the Keyset and re-enter the
        // outer loop from the top.
        keyset = keysOrRanges[keysetIndex];
    } while (true);

    return seed;
}

},{"144":144}],148:[function(require,module,exports){

},{}],149:[function(require,module,exports){
module.exports = require(153);
module.exports.toRoutes = require(154);

},{"153":153,"154":154}],150:[function(require,module,exports){
(function(u,f){"function"===typeof define&&define.amd?define([],f):"object"===typeof module&&module.exports&&(module.exports=f())})(this,function(){function u(f,q,g,n){this.message=f;this.expected=q;this.found=g;this.location=n;this.name="SyntaxError";"function"===typeof Error.captureStackTrace&&Error.captureStackTrace(this,u)}(function(f,q){function g(){this.constructor=f}g.prototype=q.prototype;f.prototype=new g})(u,Error);u.buildMessage=function(f,q){function g(f){return f.charCodeAt(0).toString(16).toUpperCase()}
function n(f){return f.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\0/g,"\\0").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/[\x00-\x0F]/g,function(f){return"\\x0"+g(f)}).replace(/[\x10-\x1F\x7F-\x9F]/g,function(f){return"\\x"+g(f)})}function v(f){return f.replace(/\\/g,"\\\\").replace(/\]/g,"\\]").replace(/\^/g,"\\^").replace(/-/g,"\\-").replace(/\0/g,"\\0").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/[\x00-\x0F]/g,function(f){return"\\x0"+
g(f)}).replace(/[\x10-\x1F\x7F-\x9F]/g,function(f){return"\\x"+g(f)})}var u={literal:function(f){return'"'+n(f.text)+'"'},"class":function(f){var h="",g;for(g=0;g<f.parts.length;g++)h+=f.parts[g]instanceof Array?v(f.parts[g][0])+"-"+v(f.parts[g][1]):v(f.parts[g]);return"["+(f.inverted?"^":"")+h+"]"},any:function(f){return"any character"},end:function(f){return"end of input"},other:function(f){return f.description}};return"Expected "+function(f){var h=Array(f.length),g;for(g=0;g<f.length;g++){var n=
g,q;q=f[g];q=u[q.type](q);h[n]=q}h.sort();if(0<h.length){for(f=g=1;g<h.length;g++)h[g-1]!==h[g]&&(h[f]=h[g],f++);h.length=f}switch(h.length){case 1:return h[0];case 2:return h[0]+" or "+h[1];default:return h.slice(0,-1).join(", ")+", or "+h[h.length-1]}}(f)+" but "+(q?'"'+n(q)+'"':"end of input")+" found."};return{SyntaxError:u,parse:function(f,q){function g(b,a){return{type:"literal",text:b,ignoreCase:a}}function n(b,a,c){return{type:"class",parts:b,inverted:a,ignoreCase:c}}function v(b){return{type:"other",
description:b}}function M(b){var a=y[b],c;if(!a){for(c=b-1;!y[c];)c--;a=y[c];for(a={line:a.line,column:a.column};c<b;)10===f.charCodeAt(c)?(a.line++,a.column=1):a.column++,c++;y[b]=a}return a}function K(a,c){var e=M(a),f=M(c);return{start:{offset:a,line:e.line,column:e.column},end:{offset:c,line:f.line,column:f.column}}}function h(a){c<t||(c>t&&(t=c,E=[]),E.push(a))}function L(){var b,d,e;b=c;d=r();d!==a?(d=z(),d!==a?(e=r(),e!==a?(p=b,b=d):(c=b,b=a)):(c=b,b=a)):(c=b,b=a);return b}function N(){var b,
d,e,m;b=c;d=r();d!==a?(58===f.charCodeAt(c)?(e=ra,c++):(e=a,0===k&&h(sa)),e!==a?(m=r(),m!==a?b=d=[d,e,m]:(c=b,b=a)):(c=b,b=a)):(c=b,b=a);return b}function x(){var b,d,e,m;b=c;d=r();d!==a?(44===f.charCodeAt(c)?(e=ta,c++):(e=a,0===k&&h(ua)),e!==a?(m=r(),m!==a?b=d=[d,e,m]:(c=b,b=a)):(c=b,b=a)):(c=b,b=a);return b}function r(){var b,d;k++;b=[];O.test(f.charAt(c))?(d=f.charAt(c),c++):(d=a,0===k&&h(P));for(;d!==a;)b.push(d),O.test(f.charAt(c))?(d=f.charAt(c),c++):(d=a,0===k&&h(P));k--;b===a&&0===k&&h(va);
return b}function z(){var b,d;b=c;f.substr(c,5)===Q?(d=Q,c+=5):(d=a,0===k&&h(wa));d!==a&&(p=b,d=!1);b=d;if(b===a&&(b=R(),b===a&&(b=c,f.substr(c,4)===S?(d=S,c+=4):(d=a,0===k&&h(xa)),d!==a&&(p=b,d=!0),b=d,b===a))){var e;b=c;d=A();d!==a?(f.substr(c,3)===T?(e=T,c+=3):(e=a,0===k&&h(ya)),e!==a?(e=A(),e!==a?(p=b,b=d={from:Math.min(d,e),length:Math.max(d,e)-Math.min(d,e)}):(c=b,b=a)):(c=b,b=a)):(c=b,b=a);b===a&&(b=c,d=A(),d!==a?(f.substr(c,2)===U?(e=U,c+=2):(e=a,0===k&&h(za)),e!==a?(e=A(),e!==a?(p=b,b=d=
{from:Math.min(d,e),length:Math.max(d,e)-Math.min(d,e)+1}):(c=b,b=a)):(c=b,b=a)):(c=b,b=a));b===a&&(b=F(),b===a&&(b=V(),b===a&&(b=W())))}return b}function R(){var b,d;b=c;f.substr(c,4)===X?(d=X,c+=4):(d=a,0===k&&h(Aa));d!==a&&(p=b,d=null);return d}function F(){var b,d,e,m,l,g;d=b=c;e=r();e!==a?(123===f.charCodeAt(c)?(m=Ba,c++):(m=a,0===k&&h(Ca)),m!==a?(l=r(),l!==a?d=e=[e,m,l]:(c=d,d=a)):(c=d,d=a)):(c=d,d=a);if(d!==a){d=c;e=G();if(e!==a){m=[];l=c;g=x();g!==a?(g=G(),g!==a?(p=l,l=g):(c=l,l=a)):(c=l,
l=a);for(;l!==a;)m.push(l),l=c,g=x(),g!==a?(g=G(),g!==a?(p=l,l=g):(c=l,l=a)):(c=l,l=a);m!==a?(p=d,d=e=Da(e,m)):(c=d,d=a)}else c=d,d=a;d===a&&(d=null);d!==a?(e=c,m=r(),m!==a?(125===f.charCodeAt(c)?(l=Ea,c++):(l=a,0===k&&h(Fa)),l!==a?(g=r(),g!==a?e=m=[m,l,g]:(c=e,e=a)):(c=e,e=a)):(c=e,e=a),e!==a?(p=b,b=null!==d?d:[]):(c=b,b=a)):(c=b,b=a)}else c=b,b=a;return b}function G(){var b,d,e;b=c;d=Y();d!==a?(e=N(),e!==a?(e=F(),e!==a?(p=b,b=d={name:d,value:e}):(c=b,b=a)):(c=b,b=a)):(c=b,b=a);b===a&&(b=c,d=Y(),
d!==a&&(p=b,d={name:d,value:void 0}),b=d,b===a&&(b=c,d=Z(),d!==a?(e=N(),e!==a?(e=F(),e!==a?(p=b,b=d={name:d,value:e}):(c=b,b=a)):(c=b,b=a)):(c=b,b=a),b===a&&(b=c,d=Z(),d!==a&&(p=b,d={name:d,value:void 0}),b=d)));return b}function Y(){var b;b=W();if(b===a&&(b=V(),b===a&&(b=R(),b===a))){var d,e,f;k++;b=c;d=aa();if(d!==a){e=[];for(f=ba();f!==a;)e.push(f),f=ba();e!==a?(p=b,b=d+=e.join("")):(c=b,b=a)}else c=b,b=a;k--;b===a&&0===k&&h(Ga)}return b}function Z(){var b,d,e,m,l,g;d=b=c;e=r();e!==a?(91===f.charCodeAt(c)?
(m=Ha,c++):(m=a,0===k&&h(Ia)),m!==a?(l=r(),l!==a?d=e=[e,m,l]:(c=d,d=a)):(c=d,d=a)):(c=d,d=a);if(d!==a){d=c;e=z();if(e!==a){m=[];l=c;g=x();g!==a?(g=z(),g!==a?(p=l,l=g):(c=l,l=a)):(c=l,l=a);for(;l!==a;)m.push(l),l=c,g=x(),g!==a?(g=z(),g!==a?(p=l,l=g):(c=l,l=a)):(c=l,l=a);m!==a?(p=d,d=e=[e].concat(m)):(c=d,d=a)}else c=d,d=a;d===a&&(d=null);d!==a?(e=c,m=r(),m!==a?(93===f.charCodeAt(c)?(l=Ja,c++):(l=a,0===k&&h(Ka)),l!==a?(g=r(),g!==a?e=m=[m,l,g]:(c=e,e=a)):(c=e,e=a)):(c=e,e=a),e!==a?(p=b,b=null!==d?d:
[]):(c=b,b=a)):(c=b,b=a)}else c=b,b=a;return b}function V(){var b,d;k++;b=c;d=H();d===a&&(d=null);if(d!==a)if(d=ca(),d!==a){var e,m,g;d=c;46===f.charCodeAt(c)?(e=La,c++):(e=a,0===k&&h(Ma));if(e!==a){m=[];g=w();if(g!==a)for(;g!==a;)m.push(g),g=w();else m=a;m!==a?d=e=[e,m]:(c=d,d=a)}else c=d,d=a;d===a&&(d=null);if(d!==a){var n;d=c;Na.test(f.charAt(c))?(e=f.charAt(c),c++):(e=a,0===k&&h(Oa));if(e!==a)if(m=H(),m===a&&(43===f.charCodeAt(c)?(m=Pa,c++):(m=a,0===k&&h(Qa))),m===a&&(m=null),m!==a){g=[];n=w();
if(n!==a)for(;n!==a;)g.push(n),n=w();else g=a;g!==a?d=e=[e,m,g]:(c=d,d=a)}else c=d,d=a;else c=d,d=a;d===a&&(d=null);d!==a?(p=b,b=d=parseFloat(f.substring(p,c))):(c=b,b=a)}else c=b,b=a}else c=b,b=a;else c=b,b=a;k--;b===a&&0===k&&h(Ra);return b}function ca(){var b,d,e,g;48===f.charCodeAt(c)?(b=Sa,c++):(b=a,0===k&&h(Ta));if(b===a)if(b=c,Ua.test(f.charAt(c))?(d=f.charAt(c),c++):(d=a,0===k&&h(Va)),d!==a){e=[];for(g=w();g!==a;)e.push(g),g=w();e!==a?b=d=[d,e]:(c=b,b=a)}else c=b,b=a;return b}function A(){var b,
d;b=c;d=H();d===a&&(d=null);d!==a?(d=ca(),d!==a?(p=b,b=d=parseInt(f.substring(p,c),10)):(c=b,b=a)):(c=b,b=a);return b}function H(){var b;45===f.charCodeAt(c)?(b=da,c++):(b=a,0===k&&h(ea));return b}function W(){var b,d,e;k++;b=c;d=fa();if(d!==a){d=[];for(e=ga();e!==a;)d.push(e),e=ga();d!==a?(e=fa(),e!==a?(p=b,b=d=d.join("")):(c=b,b=a)):(c=b,b=a)}else c=b,b=a;k--;b===a&&0===k&&h(Wa);return b}function ga(){var b,d,e,g,l,n,q,r;Xa.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(Ya));b===a&&(b=c,92===
f.charCodeAt(c)?(d=I,c++):(d=a,0===k&&h(J)),d!==a?(34===f.charCodeAt(c)?(d=ha,c++):(d=a,0===k&&h(ia)),d===a&&(39===f.charCodeAt(c)?(d=ja,c++):(d=a,0===k&&h(ka)),d===a&&(92===f.charCodeAt(c)?(d=I,c++):(d=a,0===k&&h(J)),d===a&&(47===f.charCodeAt(c)?(d=Za,c++):(d=a,0===k&&h($a)),d===a&&(d=c,98===f.charCodeAt(c)?(e=ab,c++):(e=a,0===k&&h(bb)),e!==a&&(p=d,e="\b"),d=e,d===a&&(d=c,102===f.charCodeAt(c)?(e=cb,c++):(e=a,0===k&&h(db)),e!==a&&(p=d,e="\f"),d=e,d===a&&(d=c,110===f.charCodeAt(c)?(e=eb,c++):(e=a,
0===k&&h(fb)),e!==a&&(p=d,e="\n"),d=e,d===a&&(d=c,114===f.charCodeAt(c)?(e=gb,c++):(e=a,0===k&&h(hb)),e!==a&&(p=d,e="\r"),d=e,d===a&&(d=c,116===f.charCodeAt(c)?(e=ib,c++):(e=a,0===k&&h(jb)),e!==a&&(p=d,e="\t"),d=e,d===a&&(d=c,117===f.charCodeAt(c)?(e=la,c++):(e=a,0===k&&h(ma)),e!==a?(g=e=c,l=B(),l!==a?(n=B(),n!==a?(q=B(),q!==a?(r=B(),r!==a?g=l=[l,n,q,r]:(c=g,g=a)):(c=g,g=a)):(c=g,g=a)):(c=g,g=a),e=g!==a?f.substring(e,c):g,e!==a?(p=d,d=e=String.fromCharCode(parseInt(e,16))):(c=d,d=a)):(c=d,d=a)))))))))),
d!==a?(p=b,b=d):(c=b,b=a)):(c=b,b=a));return b}function fa(){var b;34===f.charCodeAt(c)?(b=ha,c++):(b=a,0===k&&h(ia));b===a&&(39===f.charCodeAt(c)?(b=ja,c++):(b=a,0===k&&h(ka)));return b}function w(){var b;kb.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(lb));return b}function B(){var b;na.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(oa));return b}function aa(){var b,d;mb.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(nb));b===a&&(ob.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===
k&&h(pb)),b===a&&(qb.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(rb)),b===a&&(sb.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(tb)),b===a&&(ub.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(vb)),b===a&&(wb.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(xb)))))));if(b===a&&(36===f.charCodeAt(c)?(b=yb,c++):(b=a,0===k&&h(zb)),b===a&&(95===f.charCodeAt(c)?(b=Ab,c++):(b=a,0===k&&h(Bb)),b===a)))if(b=c,92===f.charCodeAt(c)?(d=I,c++):(d=a,0===k&&h(J)),d!==a){var e,g,l,n,q,r;d=c;117===
f.charCodeAt(c)?(e=la,c++):(e=a,0===k&&h(ma));e!==a?(g=e=c,l=C(),l!==a?(n=C(),n!==a?(q=C(),q!==a?(r=C(),r!==a?g=l=[l,n,q,r]:(c=g,g=a)):(c=g,g=a)):(c=g,g=a)):(c=g,g=a),e=g!==a?f.substring(e,c):g,e!==a?(p=d,d=e=String.fromCharCode(parseInt(e,16))):(c=d,d=a)):(c=d,d=a);d!==a?(p=b,b=d):(c=b,b=a)}else c=b,b=a;return b}function ba(){var b;b=aa();b===a&&(Cb.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(Db)),b===a&&(Eb.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(Fb))),b===a&&(Gb.test(f.charAt(c))?
(b=f.charAt(c),c++):(b=a,0===k&&h(Hb)),b===a&&(Ib.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(Jb)),b===a&&(8204===f.charCodeAt(c)?(b=Kb,c++):(b=a,0===k&&h(Lb)),b===a&&(8205===f.charCodeAt(c)?(b=Mb,c++):(b=a,0===k&&h(Nb)),b===a&&(45===f.charCodeAt(c)?(b=da,c++):(b=a,0===k&&h(ea))))))));return b}function C(){var b;na.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(oa));return b}q=void 0!==q?q:{};var a={},pa={JSON_text:L},qa=L,Ha="[",Ia=g("[",!1),Ba="{",Ca=g("{",!1),Ja="]",Ka=g("]",!1),Ea=
"}",Fa=g("}",!1),ra=":",sa=g(":",!1),ta=",",ua=g(",",!1),va=v("whitespace"),O=/^[ \t\n\r]/,P=n([" ","\t","\n","\r"],!1,!1),Q="false",wa=g("false",!1),X="null",Aa=g("null",!1),S="true",xa=g("true",!1),Da=function(a,c){var e={},f,g=-1,h=e.$keys=[];Array.isArray(a.name)?a.name.forEach(function(c){g++;h.push(c);void 0!==a.value&&(e[g]=a.value)}):(g++,h.push(a.name),void 0!==a.value&&(e[g]=a.value));for(f=0;f<c.length;f++)Array.isArray(c[f].name)?c[f].name.forEach(function(a){g++;h.push(a);void 0!==c[f].value&&
(e[g]=c[f].value)}):(g++,h.push(c[f].name),void 0!==c[f].value&&(e[g]=c[f].value));return e},Ra=v("number"),La=".",Ma=g(".",!1),Ua=/^[1-9]/,Va=n([["1","9"]],!1,!1),Na=/^[eE]/,Oa=n(["e","E"],!1,!1),T="...",ya=g("...",!1),U="..",za=g("..",!1),da="-",ea=g("-",!1),Pa="+",Qa=g("+",!1),Sa="0",Ta=g("0",!1),Wa=v("string"),ha='"',ia=g('"',!1),ja="'",ka=g("'",!1),I="\\",J=g("\\",!1),Za="/",$a=g("/",!1),ab="b",bb=g("b",!1),cb="f",db=g("f",!1),eb="n",fb=g("n",!1),gb="r",hb=g("r",!1),ib="t",jb=g("t",!1),la="u",
ma=g("u",!1),Xa=/^[^\0-\x1F"'\\]/,Ya=n([["\x00","\u001f"],'"',"'","\\"],!0,!1),kb=/^[0-9]/,lb=n([["0","9"]],!1,!1),na=/^[0-9a-f]/i,oa=n([["0","9"],["a","f"]],!1,!0),Ga=v("identifier"),yb="$",zb=g("$",!1),Ab="_",Bb=g("_",!1),Kb="\u200c",Lb=g("\u200c",!1),Mb="\u200d",Nb=g("\u200d",!1),ob=/^[a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137-\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148-\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C-\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA-\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9-\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC-\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF-\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F-\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0-\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB-\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE-\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0561-\u0587\u13F8-\u13FD\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6-\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FC7\u1FD0-\u1FD3\u1FD6-\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6-\u1FF7\u210A\u210E-\u210F\u2113\u212F\u2134\u2139\u213C-\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65-\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73-\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3-\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7B5\uA7B7\uA7FA\uAB30-\uAB5A\uAB60-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A]/,
pb=n([["a","z"],"\u00b5",["\u00df","\u00f6"],["\u00f8","\u00ff"],"\u0101","\u0103","\u0105","\u0107","\u0109","\u010b","\u010d","\u010f","\u0111","\u0113","\u0115","\u0117","\u0119","\u011b","\u011d","\u011f","\u0121","\u0123","\u0125","\u0127","\u0129","\u012b","\u012d","\u012f","\u0131","\u0133","\u0135",["\u0137","\u0138"],"\u013a","\u013c","\u013e","\u0140","\u0142","\u0144","\u0146",["\u0148","\u0149"],"\u014b","\u014d","\u014f","\u0151","\u0153","\u0155","\u0157","\u0159","\u015b","\u015d",
"\u015f","\u0161","\u0163","\u0165","\u0167","\u0169","\u016b","\u016d","\u016f","\u0171","\u0173","\u0175","\u0177","\u017a","\u017c",["\u017e","\u0180"],"\u0183","\u0185","\u0188",["\u018c","\u018d"],"\u0192","\u0195",["\u0199","\u019b"],"\u019e","\u01a1","\u01a3","\u01a5","\u01a8",["\u01aa","\u01ab"],"\u01ad","\u01b0","\u01b4","\u01b6",["\u01b9","\u01ba"],["\u01bd","\u01bf"],"\u01c6","\u01c9","\u01cc","\u01ce","\u01d0","\u01d2","\u01d4","\u01d6","\u01d8","\u01da",["\u01dc","\u01dd"],"\u01df","\u01e1",
"\u01e3","\u01e5","\u01e7","\u01e9","\u01eb","\u01ed",["\u01ef","\u01f0"],"\u01f3","\u01f5","\u01f9","\u01fb","\u01fd","\u01ff","\u0201","\u0203","\u0205","\u0207","\u0209","\u020b","\u020d","\u020f","\u0211","\u0213","\u0215","\u0217","\u0219","\u021b","\u021d","\u021f","\u0221","\u0223","\u0225","\u0227","\u0229","\u022b","\u022d","\u022f","\u0231",["\u0233","\u0239"],"\u023c",["\u023f","\u0240"],"\u0242","\u0247","\u0249","\u024b","\u024d",["\u024f","\u0293"],["\u0295","\u02af"],"\u0371","\u0373",
"\u0377",["\u037b","\u037d"],"\u0390",["\u03ac","\u03ce"],["\u03d0","\u03d1"],["\u03d5","\u03d7"],"\u03d9","\u03db","\u03dd","\u03df","\u03e1","\u03e3","\u03e5","\u03e7","\u03e9","\u03eb","\u03ed",["\u03ef","\u03f3"],"\u03f5","\u03f8",["\u03fb","\u03fc"],["\u0430","\u045f"],"\u0461","\u0463","\u0465","\u0467","\u0469","\u046b","\u046d","\u046f","\u0471","\u0473","\u0475","\u0477","\u0479","\u047b","\u047d","\u047f","\u0481","\u048b","\u048d","\u048f","\u0491","\u0493","\u0495","\u0497","\u0499","\u049b",
"\u049d","\u049f","\u04a1","\u04a3","\u04a5","\u04a7","\u04a9","\u04ab","\u04ad","\u04af","\u04b1","\u04b3","\u04b5","\u04b7","\u04b9","\u04bb","\u04bd","\u04bf","\u04c2","\u04c4","\u04c6","\u04c8","\u04ca","\u04cc",["\u04ce","\u04cf"],"\u04d1","\u04d3","\u04d5","\u04d7","\u04d9","\u04db","\u04dd","\u04df","\u04e1","\u04e3","\u04e5","\u04e7","\u04e9","\u04eb","\u04ed","\u04ef","\u04f1","\u04f3","\u04f5","\u04f7","\u04f9","\u04fb","\u04fd","\u04ff","\u0501","\u0503","\u0505","\u0507","\u0509","\u050b",
"\u050d","\u050f","\u0511","\u0513","\u0515","\u0517","\u0519","\u051b","\u051d","\u051f","\u0521","\u0523","\u0525","\u0527","\u0529","\u052b","\u052d","\u052f",["\u0561","\u0587"],["\u13f8","\u13fd"],["\u1d00","\u1d2b"],["\u1d6b","\u1d77"],["\u1d79","\u1d9a"],"\u1e01","\u1e03","\u1e05","\u1e07","\u1e09","\u1e0b","\u1e0d","\u1e0f","\u1e11","\u1e13","\u1e15","\u1e17","\u1e19","\u1e1b","\u1e1d","\u1e1f","\u1e21","\u1e23","\u1e25","\u1e27","\u1e29","\u1e2b","\u1e2d","\u1e2f","\u1e31","\u1e33","\u1e35",
"\u1e37","\u1e39","\u1e3b","\u1e3d","\u1e3f","\u1e41","\u1e43","\u1e45","\u1e47","\u1e49","\u1e4b","\u1e4d","\u1e4f","\u1e51","\u1e53","\u1e55","\u1e57","\u1e59","\u1e5b","\u1e5d","\u1e5f","\u1e61","\u1e63","\u1e65","\u1e67","\u1e69","\u1e6b","\u1e6d","\u1e6f","\u1e71","\u1e73","\u1e75","\u1e77","\u1e79","\u1e7b","\u1e7d","\u1e7f","\u1e81","\u1e83","\u1e85","\u1e87","\u1e89","\u1e8b","\u1e8d","\u1e8f","\u1e91","\u1e93",["\u1e95","\u1e9d"],"\u1e9f","\u1ea1","\u1ea3","\u1ea5","\u1ea7","\u1ea9","\u1eab",
"\u1ead","\u1eaf","\u1eb1","\u1eb3","\u1eb5","\u1eb7","\u1eb9","\u1ebb","\u1ebd","\u1ebf","\u1ec1","\u1ec3","\u1ec5","\u1ec7","\u1ec9","\u1ecb","\u1ecd","\u1ecf","\u1ed1","\u1ed3","\u1ed5","\u1ed7","\u1ed9","\u1edb","\u1edd","\u1edf","\u1ee1","\u1ee3","\u1ee5","\u1ee7","\u1ee9","\u1eeb","\u1eed","\u1eef","\u1ef1","\u1ef3","\u1ef5","\u1ef7","\u1ef9","\u1efb","\u1efd",["\u1eff","\u1f07"],["\u1f10","\u1f15"],["\u1f20","\u1f27"],["\u1f30","\u1f37"],["\u1f40","\u1f45"],["\u1f50","\u1f57"],["\u1f60","\u1f67"],
["\u1f70","\u1f7d"],["\u1f80","\u1f87"],["\u1f90","\u1f97"],["\u1fa0","\u1fa7"],["\u1fb0","\u1fb4"],["\u1fb6","\u1fb7"],"\u1fbe",["\u1fc2","\u1fc4"],["\u1fc6","\u1fc7"],["\u1fd0","\u1fd3"],["\u1fd6","\u1fd7"],["\u1fe0","\u1fe7"],["\u1ff2","\u1ff4"],["\u1ff6","\u1ff7"],"\u210a",["\u210e","\u210f"],"\u2113","\u212f","\u2134","\u2139",["\u213c","\u213d"],["\u2146","\u2149"],"\u214e","\u2184",["\u2c30","\u2c5e"],"\u2c61",["\u2c65","\u2c66"],"\u2c68","\u2c6a","\u2c6c","\u2c71",["\u2c73","\u2c74"],["\u2c76",
"\u2c7b"],"\u2c81","\u2c83","\u2c85","\u2c87","\u2c89","\u2c8b","\u2c8d","\u2c8f","\u2c91","\u2c93","\u2c95","\u2c97","\u2c99","\u2c9b","\u2c9d","\u2c9f","\u2ca1","\u2ca3","\u2ca5","\u2ca7","\u2ca9","\u2cab","\u2cad","\u2caf","\u2cb1","\u2cb3","\u2cb5","\u2cb7","\u2cb9","\u2cbb","\u2cbd","\u2cbf","\u2cc1","\u2cc3","\u2cc5","\u2cc7","\u2cc9","\u2ccb","\u2ccd","\u2ccf","\u2cd1","\u2cd3","\u2cd5","\u2cd7","\u2cd9","\u2cdb","\u2cdd","\u2cdf","\u2ce1",["\u2ce3","\u2ce4"],"\u2cec","\u2cee","\u2cf3",["\u2d00",
"\u2d25"],"\u2d27","\u2d2d","\ua641","\ua643","\ua645","\ua647","\ua649","\ua64b","\ua64d","\ua64f","\ua651","\ua653","\ua655","\ua657","\ua659","\ua65b","\ua65d","\ua65f","\ua661","\ua663","\ua665","\ua667","\ua669","\ua66b","\ua66d","\ua681","\ua683","\ua685","\ua687","\ua689","\ua68b","\ua68d","\ua68f","\ua691","\ua693","\ua695","\ua697","\ua699","\ua69b","\ua723","\ua725","\ua727","\ua729","\ua72b","\ua72d",["\ua72f","\ua731"],"\ua733","\ua735","\ua737","\ua739","\ua73b","\ua73d","\ua73f","\ua741",
"\ua743","\ua745","\ua747","\ua749","\ua74b","\ua74d","\ua74f","\ua751","\ua753","\ua755","\ua757","\ua759","\ua75b","\ua75d","\ua75f","\ua761","\ua763","\ua765","\ua767","\ua769","\ua76b","\ua76d","\ua76f",["\ua771","\ua778"],"\ua77a","\ua77c","\ua77f","\ua781","\ua783","\ua785","\ua787","\ua78c","\ua78e","\ua791",["\ua793","\ua795"],"\ua797","\ua799","\ua79b","\ua79d","\ua79f","\ua7a1","\ua7a3","\ua7a5","\ua7a7","\ua7a9","\ua7b5","\ua7b7","\ua7fa",["\uab30","\uab5a"],["\uab60","\uab65"],["\uab70",
"\uabbf"],["\ufb00","\ufb06"],["\ufb13","\ufb17"],["\uff41","\uff5a"]],!1,!1),sb=/^[\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0374\u037A\u0559\u0640\u06E5-\u06E6\u07F4-\u07F5\u07FA\u081A\u0824\u0828\u0971\u0E46\u0EC6\u10FC\u17D7\u1843\u1AA7\u1C78-\u1C7D\u1D2C-\u1D6A\u1D78\u1D9B-\u1DBF\u2071\u207F\u2090-\u209C\u2C7C-\u2C7D\u2D6F\u2E2F\u3005\u3031-\u3035\u303B\u309D-\u309E\u30FC-\u30FE\uA015\uA4F8-\uA4FD\uA60C\uA67F\uA69C-\uA69D\uA717-\uA71F\uA770\uA788\uA7F8-\uA7F9\uA9CF\uA9E6\uAA70\uAADD\uAAF3-\uAAF4\uAB5C-\uAB5F\uFF70\uFF9E-\uFF9F]/,
tb=n([["\u02b0","\u02c1"],["\u02c6","\u02d1"],["\u02e0","\u02e4"],"\u02ec","\u02ee","\u0374","\u037a","\u0559","\u0640",["\u06e5","\u06e6"],["\u07f4","\u07f5"],"\u07fa","\u081a","\u0824","\u0828","\u0971","\u0e46","\u0ec6","\u10fc","\u17d7","\u1843","\u1aa7",["\u1c78","\u1c7d"],["\u1d2c","\u1d6a"],"\u1d78",["\u1d9b","\u1dbf"],"\u2071","\u207f",["\u2090","\u209c"],["\u2c7c","\u2c7d"],"\u2d6f","\u2e2f","\u3005",["\u3031","\u3035"],"\u303b",["\u309d","\u309e"],["\u30fc","\u30fe"],"\ua015",["\ua4f8",
"\ua4fd"],"\ua60c","\ua67f",["\ua69c","\ua69d"],["\ua717","\ua71f"],"\ua770","\ua788",["\ua7f8","\ua7f9"],"\ua9cf","\ua9e6","\uaa70","\uaadd",["\uaaf3","\uaaf4"],["\uab5c","\uab5f"],"\uff70",["\uff9e","\uff9f"]],!1,!1),ub=/^[\xAA\xBA\u01BB\u01C0-\u01C3\u0294\u05D0-\u05EA\u05F0-\u05F2\u0620-\u063F\u0641-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u0800-\u0815\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0972-\u0980\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0CF1-\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32-\u0E33\u0E40-\u0E45\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u10D0-\u10FA\u10FD-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17DC\u1820-\u1842\u1844-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C77\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5-\u1CF6\u2135-\u2138\u2D30-\u2D67\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3006\u303C\u3041-\u3096\u309F\u30A1-\u30FA\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA014\uA016-\uA48C\uA4D0-\uA4F7\uA500-\uA60B\uA610-\uA61F\uA62A-\uA62B\uA66E\uA6A0-\uA6E5\uA78F\uA7F7\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9E0-\uA9E4\uA9E7-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA6F\uAA71-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5-\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADC\uAAE0-\uAAEA\uAAF2\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF66-\uFF6F\uFF71-\uFF9D\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
vb=n(["\u00aa","\u00ba","\u01bb",["\u01c0","\u01c3"],"\u0294",["\u05d0","\u05ea"],["\u05f0","\u05f2"],["\u0620","\u063f"],["\u0641","\u064a"],["\u066e","\u066f"],["\u0671","\u06d3"],"\u06d5",["\u06ee","\u06ef"],["\u06fa","\u06fc"],"\u06ff","\u0710",["\u0712","\u072f"],["\u074d","\u07a5"],"\u07b1",["\u07ca","\u07ea"],["\u0800","\u0815"],["\u0840","\u0858"],["\u08a0","\u08b4"],["\u0904","\u0939"],"\u093d","\u0950",["\u0958","\u0961"],["\u0972","\u0980"],["\u0985","\u098c"],["\u098f","\u0990"],["\u0993",
"\u09a8"],["\u09aa","\u09b0"],"\u09b2",["\u09b6","\u09b9"],"\u09bd","\u09ce",["\u09dc","\u09dd"],["\u09df","\u09e1"],["\u09f0","\u09f1"],["\u0a05","\u0a0a"],["\u0a0f","\u0a10"],["\u0a13","\u0a28"],["\u0a2a","\u0a30"],["\u0a32","\u0a33"],["\u0a35","\u0a36"],["\u0a38","\u0a39"],["\u0a59","\u0a5c"],"\u0a5e",["\u0a72","\u0a74"],["\u0a85","\u0a8d"],["\u0a8f","\u0a91"],["\u0a93","\u0aa8"],["\u0aaa","\u0ab0"],["\u0ab2","\u0ab3"],["\u0ab5","\u0ab9"],"\u0abd","\u0ad0",["\u0ae0","\u0ae1"],"\u0af9",["\u0b05",
"\u0b0c"],["\u0b0f","\u0b10"],["\u0b13","\u0b28"],["\u0b2a","\u0b30"],["\u0b32","\u0b33"],["\u0b35","\u0b39"],"\u0b3d",["\u0b5c","\u0b5d"],["\u0b5f","\u0b61"],"\u0b71","\u0b83",["\u0b85","\u0b8a"],["\u0b8e","\u0b90"],["\u0b92","\u0b95"],["\u0b99","\u0b9a"],"\u0b9c",["\u0b9e","\u0b9f"],["\u0ba3","\u0ba4"],["\u0ba8","\u0baa"],["\u0bae","\u0bb9"],"\u0bd0",["\u0c05","\u0c0c"],["\u0c0e","\u0c10"],["\u0c12","\u0c28"],["\u0c2a","\u0c39"],"\u0c3d",["\u0c58","\u0c5a"],["\u0c60","\u0c61"],["\u0c85","\u0c8c"],
["\u0c8e","\u0c90"],["\u0c92","\u0ca8"],["\u0caa","\u0cb3"],["\u0cb5","\u0cb9"],"\u0cbd","\u0cde",["\u0ce0","\u0ce1"],["\u0cf1","\u0cf2"],["\u0d05","\u0d0c"],["\u0d0e","\u0d10"],["\u0d12","\u0d3a"],"\u0d3d","\u0d4e",["\u0d5f","\u0d61"],["\u0d7a","\u0d7f"],["\u0d85","\u0d96"],["\u0d9a","\u0db1"],["\u0db3","\u0dbb"],"\u0dbd",["\u0dc0","\u0dc6"],["\u0e01","\u0e30"],["\u0e32","\u0e33"],["\u0e40","\u0e45"],["\u0e81","\u0e82"],"\u0e84",["\u0e87","\u0e88"],"\u0e8a","\u0e8d",["\u0e94","\u0e97"],["\u0e99",
"\u0e9f"],["\u0ea1","\u0ea3"],"\u0ea5","\u0ea7",["\u0eaa","\u0eab"],["\u0ead","\u0eb0"],["\u0eb2","\u0eb3"],"\u0ebd",["\u0ec0","\u0ec4"],["\u0edc","\u0edf"],"\u0f00",["\u0f40","\u0f47"],["\u0f49","\u0f6c"],["\u0f88","\u0f8c"],["\u1000","\u102a"],"\u103f",["\u1050","\u1055"],["\u105a","\u105d"],"\u1061",["\u1065","\u1066"],["\u106e","\u1070"],["\u1075","\u1081"],"\u108e",["\u10d0","\u10fa"],["\u10fd","\u1248"],["\u124a","\u124d"],["\u1250","\u1256"],"\u1258",["\u125a","\u125d"],["\u1260","\u1288"],
["\u128a","\u128d"],["\u1290","\u12b0"],["\u12b2","\u12b5"],["\u12b8","\u12be"],"\u12c0",["\u12c2","\u12c5"],["\u12c8","\u12d6"],["\u12d8","\u1310"],["\u1312","\u1315"],["\u1318","\u135a"],["\u1380","\u138f"],["\u1401","\u166c"],["\u166f","\u167f"],["\u1681","\u169a"],["\u16a0","\u16ea"],["\u16f1","\u16f8"],["\u1700","\u170c"],["\u170e","\u1711"],["\u1720","\u1731"],["\u1740","\u1751"],["\u1760","\u176c"],["\u176e","\u1770"],["\u1780","\u17b3"],"\u17dc",["\u1820","\u1842"],["\u1844","\u1877"],["\u1880",
"\u18a8"],"\u18aa",["\u18b0","\u18f5"],["\u1900","\u191e"],["\u1950","\u196d"],["\u1970","\u1974"],["\u1980","\u19ab"],["\u19b0","\u19c9"],["\u1a00","\u1a16"],["\u1a20","\u1a54"],["\u1b05","\u1b33"],["\u1b45","\u1b4b"],["\u1b83","\u1ba0"],["\u1bae","\u1baf"],["\u1bba","\u1be5"],["\u1c00","\u1c23"],["\u1c4d","\u1c4f"],["\u1c5a","\u1c77"],["\u1ce9","\u1cec"],["\u1cee","\u1cf1"],["\u1cf5","\u1cf6"],["\u2135","\u2138"],["\u2d30","\u2d67"],["\u2d80","\u2d96"],["\u2da0","\u2da6"],["\u2da8","\u2dae"],["\u2db0",
"\u2db6"],["\u2db8","\u2dbe"],["\u2dc0","\u2dc6"],["\u2dc8","\u2dce"],["\u2dd0","\u2dd6"],["\u2dd8","\u2dde"],"\u3006","\u303c",["\u3041","\u3096"],"\u309f",["\u30a1","\u30fa"],"\u30ff",["\u3105","\u312d"],["\u3131","\u318e"],["\u31a0","\u31ba"],["\u31f0","\u31ff"],["\u3400","\u4db5"],["\u4e00","\u9fd5"],["\ua000","\ua014"],["\ua016","\ua48c"],["\ua4d0","\ua4f7"],["\ua500","\ua60b"],["\ua610","\ua61f"],["\ua62a","\ua62b"],"\ua66e",["\ua6a0","\ua6e5"],"\ua78f","\ua7f7",["\ua7fb","\ua801"],["\ua803",
"\ua805"],["\ua807","\ua80a"],["\ua80c","\ua822"],["\ua840","\ua873"],["\ua882","\ua8b3"],["\ua8f2","\ua8f7"],"\ua8fb","\ua8fd",["\ua90a","\ua925"],["\ua930","\ua946"],["\ua960","\ua97c"],["\ua984","\ua9b2"],["\ua9e0","\ua9e4"],["\ua9e7","\ua9ef"],["\ua9fa","\ua9fe"],["\uaa00","\uaa28"],["\uaa40","\uaa42"],["\uaa44","\uaa4b"],["\uaa60","\uaa6f"],["\uaa71","\uaa76"],"\uaa7a",["\uaa7e","\uaaaf"],"\uaab1",["\uaab5","\uaab6"],["\uaab9","\uaabd"],"\uaac0","\uaac2",["\uaadb","\uaadc"],["\uaae0","\uaaea"],
"\uaaf2",["\uab01","\uab06"],["\uab09","\uab0e"],["\uab11","\uab16"],["\uab20","\uab26"],["\uab28","\uab2e"],["\uabc0","\uabe2"],["\uac00","\ud7a3"],["\ud7b0","\ud7c6"],["\ud7cb","\ud7fb"],["\uf900","\ufa6d"],["\ufa70","\ufad9"],"\ufb1d",["\ufb1f","\ufb28"],["\ufb2a","\ufb36"],["\ufb38","\ufb3c"],"\ufb3e",["\ufb40","\ufb41"],["\ufb43","\ufb44"],["\ufb46","\ufbb1"],["\ufbd3","\ufd3d"],["\ufd50","\ufd8f"],["\ufd92","\ufdc7"],["\ufdf0","\ufdfb"],["\ufe70","\ufe74"],["\ufe76","\ufefc"],["\uff66","\uff6f"],
["\uff71","\uff9d"],["\uffa0","\uffbe"],["\uffc2","\uffc7"],["\uffca","\uffcf"],["\uffd2","\uffd7"],["\uffda","\uffdc"]],!1,!1),qb=/^[\u01C5\u01C8\u01CB\u01F2\u1F88-\u1F8F\u1F98-\u1F9F\u1FA8-\u1FAF\u1FBC\u1FCC\u1FFC]/,rb=n(["\u01c5","\u01c8","\u01cb","\u01f2",["\u1f88","\u1f8f"],["\u1f98","\u1f9f"],["\u1fa8","\u1faf"],"\u1fbc","\u1fcc","\u1ffc"],!1,!1),mb=/^[A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178-\u0179\u017B\u017D\u0181-\u0182\u0184\u0186-\u0187\u0189-\u018B\u018E-\u0191\u0193-\u0194\u0196-\u0198\u019C-\u019D\u019F-\u01A0\u01A2\u01A4\u01A6-\u01A7\u01A9\u01AC\u01AE-\u01AF\u01B1-\u01B3\u01B5\u01B7-\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A-\u023B\u023D-\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E-\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9-\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0-\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E-\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D-\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0-\uA7B4\uA7B6\uFF21-\uFF3A]/,
nb=n([["A","Z"],["\u00c0","\u00d6"],["\u00d8","\u00de"],"\u0100","\u0102","\u0104","\u0106","\u0108","\u010a","\u010c","\u010e","\u0110","\u0112","\u0114","\u0116","\u0118","\u011a","\u011c","\u011e","\u0120","\u0122","\u0124","\u0126","\u0128","\u012a","\u012c","\u012e","\u0130","\u0132","\u0134","\u0136","\u0139","\u013b","\u013d","\u013f","\u0141","\u0143","\u0145","\u0147","\u014a","\u014c","\u014e","\u0150","\u0152","\u0154","\u0156","\u0158","\u015a","\u015c","\u015e","\u0160","\u0162","\u0164",
"\u0166","\u0168","\u016a","\u016c","\u016e","\u0170","\u0172","\u0174","\u0176",["\u0178","\u0179"],"\u017b","\u017d",["\u0181","\u0182"],"\u0184",["\u0186","\u0187"],["\u0189","\u018b"],["\u018e","\u0191"],["\u0193","\u0194"],["\u0196","\u0198"],["\u019c","\u019d"],["\u019f","\u01a0"],"\u01a2","\u01a4",["\u01a6","\u01a7"],"\u01a9","\u01ac",["\u01ae","\u01af"],["\u01b1","\u01b3"],"\u01b5",["\u01b7","\u01b8"],"\u01bc","\u01c4","\u01c7","\u01ca","\u01cd","\u01cf","\u01d1","\u01d3","\u01d5","\u01d7",
"\u01d9","\u01db","\u01de","\u01e0","\u01e2","\u01e4","\u01e6","\u01e8","\u01ea","\u01ec","\u01ee","\u01f1","\u01f4",["\u01f6","\u01f8"],"\u01fa","\u01fc","\u01fe","\u0200","\u0202","\u0204","\u0206","\u0208","\u020a","\u020c","\u020e","\u0210","\u0212","\u0214","\u0216","\u0218","\u021a","\u021c","\u021e","\u0220","\u0222","\u0224","\u0226","\u0228","\u022a","\u022c","\u022e","\u0230","\u0232",["\u023a","\u023b"],["\u023d","\u023e"],"\u0241",["\u0243","\u0246"],"\u0248","\u024a","\u024c","\u024e",
"\u0370","\u0372","\u0376","\u037f","\u0386",["\u0388","\u038a"],"\u038c",["\u038e","\u038f"],["\u0391","\u03a1"],["\u03a3","\u03ab"],"\u03cf",["\u03d2","\u03d4"],"\u03d8","\u03da","\u03dc","\u03de","\u03e0","\u03e2","\u03e4","\u03e6","\u03e8","\u03ea","\u03ec","\u03ee","\u03f4","\u03f7",["\u03f9","\u03fa"],["\u03fd","\u042f"],"\u0460","\u0462","\u0464","\u0466","\u0468","\u046a","\u046c","\u046e","\u0470","\u0472","\u0474","\u0476","\u0478","\u047a","\u047c","\u047e","\u0480","\u048a","\u048c","\u048e",
"\u0490","\u0492","\u0494","\u0496","\u0498","\u049a","\u049c","\u049e","\u04a0","\u04a2","\u04a4","\u04a6","\u04a8","\u04aa","\u04ac","\u04ae","\u04b0","\u04b2","\u04b4","\u04b6","\u04b8","\u04ba","\u04bc","\u04be",["\u04c0","\u04c1"],"\u04c3","\u04c5","\u04c7","\u04c9","\u04cb","\u04cd","\u04d0","\u04d2","\u04d4","\u04d6","\u04d8","\u04da","\u04dc","\u04de","\u04e0","\u04e2","\u04e4","\u04e6","\u04e8","\u04ea","\u04ec","\u04ee","\u04f0","\u04f2","\u04f4","\u04f6","\u04f8","\u04fa","\u04fc","\u04fe",
"\u0500","\u0502","\u0504","\u0506","\u0508","\u050a","\u050c","\u050e","\u0510","\u0512","\u0514","\u0516","\u0518","\u051a","\u051c","\u051e","\u0520","\u0522","\u0524","\u0526","\u0528","\u052a","\u052c","\u052e",["\u0531","\u0556"],["\u10a0","\u10c5"],"\u10c7","\u10cd",["\u13a0","\u13f5"],"\u1e00","\u1e02","\u1e04","\u1e06","\u1e08","\u1e0a","\u1e0c","\u1e0e","\u1e10","\u1e12","\u1e14","\u1e16","\u1e18","\u1e1a","\u1e1c","\u1e1e","\u1e20","\u1e22","\u1e24","\u1e26","\u1e28","\u1e2a","\u1e2c",
"\u1e2e","\u1e30","\u1e32","\u1e34","\u1e36","\u1e38","\u1e3a","\u1e3c","\u1e3e","\u1e40","\u1e42","\u1e44","\u1e46","\u1e48","\u1e4a","\u1e4c","\u1e4e","\u1e50","\u1e52","\u1e54","\u1e56","\u1e58","\u1e5a","\u1e5c","\u1e5e","\u1e60","\u1e62","\u1e64","\u1e66","\u1e68","\u1e6a","\u1e6c","\u1e6e","\u1e70","\u1e72","\u1e74","\u1e76","\u1e78","\u1e7a","\u1e7c","\u1e7e","\u1e80","\u1e82","\u1e84","\u1e86","\u1e88","\u1e8a","\u1e8c","\u1e8e","\u1e90","\u1e92","\u1e94","\u1e9e","\u1ea0","\u1ea2","\u1ea4",
"\u1ea6","\u1ea8","\u1eaa","\u1eac","\u1eae","\u1eb0","\u1eb2","\u1eb4","\u1eb6","\u1eb8","\u1eba","\u1ebc","\u1ebe","\u1ec0","\u1ec2","\u1ec4","\u1ec6","\u1ec8","\u1eca","\u1ecc","\u1ece","\u1ed0","\u1ed2","\u1ed4","\u1ed6","\u1ed8","\u1eda","\u1edc","\u1ede","\u1ee0","\u1ee2","\u1ee4","\u1ee6","\u1ee8","\u1eea","\u1eec","\u1eee","\u1ef0","\u1ef2","\u1ef4","\u1ef6","\u1ef8","\u1efa","\u1efc","\u1efe",["\u1f08","\u1f0f"],["\u1f18","\u1f1d"],["\u1f28","\u1f2f"],["\u1f38","\u1f3f"],["\u1f48","\u1f4d"],
"\u1f59","\u1f5b","\u1f5d","\u1f5f",["\u1f68","\u1f6f"],["\u1fb8","\u1fbb"],["\u1fc8","\u1fcb"],["\u1fd8","\u1fdb"],["\u1fe8","\u1fec"],["\u1ff8","\u1ffb"],"\u2102","\u2107",["\u210b","\u210d"],["\u2110","\u2112"],"\u2115",["\u2119","\u211d"],"\u2124","\u2126","\u2128",["\u212a","\u212d"],["\u2130","\u2133"],["\u213e","\u213f"],"\u2145","\u2183",["\u2c00","\u2c2e"],"\u2c60",["\u2c62","\u2c64"],"\u2c67","\u2c69","\u2c6b",["\u2c6d","\u2c70"],"\u2c72","\u2c75",["\u2c7e","\u2c80"],"\u2c82","\u2c84","\u2c86",
"\u2c88","\u2c8a","\u2c8c","\u2c8e","\u2c90","\u2c92","\u2c94","\u2c96","\u2c98","\u2c9a","\u2c9c","\u2c9e","\u2ca0","\u2ca2","\u2ca4","\u2ca6","\u2ca8","\u2caa","\u2cac","\u2cae","\u2cb0","\u2cb2","\u2cb4","\u2cb6","\u2cb8","\u2cba","\u2cbc","\u2cbe","\u2cc0","\u2cc2","\u2cc4","\u2cc6","\u2cc8","\u2cca","\u2ccc","\u2cce","\u2cd0","\u2cd2","\u2cd4","\u2cd6","\u2cd8","\u2cda","\u2cdc","\u2cde","\u2ce0","\u2ce2","\u2ceb","\u2ced","\u2cf2","\ua640","\ua642","\ua644","\ua646","\ua648","\ua64a","\ua64c",
"\ua64e","\ua650","\ua652","\ua654","\ua656","\ua658","\ua65a","\ua65c","\ua65e","\ua660","\ua662","\ua664","\ua666","\ua668","\ua66a","\ua66c","\ua680","\ua682","\ua684","\ua686","\ua688","\ua68a","\ua68c","\ua68e","\ua690","\ua692","\ua694","\ua696","\ua698","\ua69a","\ua722","\ua724","\ua726","\ua728","\ua72a","\ua72c","\ua72e","\ua732","\ua734","\ua736","\ua738","\ua73a","\ua73c","\ua73e","\ua740","\ua742","\ua744","\ua746","\ua748","\ua74a","\ua74c","\ua74e","\ua750","\ua752","\ua754","\ua756",
"\ua758","\ua75a","\ua75c","\ua75e","\ua760","\ua762","\ua764","\ua766","\ua768","\ua76a","\ua76c","\ua76e","\ua779","\ua77b",["\ua77d","\ua77e"],"\ua780","\ua782","\ua784","\ua786","\ua78b","\ua78d","\ua790","\ua792","\ua796","\ua798","\ua79a","\ua79c","\ua79e","\ua7a0","\ua7a2","\ua7a4","\ua7a6","\ua7a8",["\ua7aa","\ua7ad"],["\ua7b0","\ua7b4"],"\ua7b6",["\uff21","\uff3a"]],!1,!1),Eb=/^[\u0903\u093B\u093E-\u0940\u0949-\u094C\u094E-\u094F\u0982-\u0983\u09BE-\u09C0\u09C7-\u09C8\u09CB-\u09CC\u09D7\u0A03\u0A3E-\u0A40\u0A83\u0ABE-\u0AC0\u0AC9\u0ACB-\u0ACC\u0B02-\u0B03\u0B3E\u0B40\u0B47-\u0B48\u0B4B-\u0B4C\u0B57\u0BBE-\u0BBF\u0BC1-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD7\u0C01-\u0C03\u0C41-\u0C44\u0C82-\u0C83\u0CBE\u0CC0-\u0CC4\u0CC7-\u0CC8\u0CCA-\u0CCB\u0CD5-\u0CD6\u0D02-\u0D03\u0D3E-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D82-\u0D83\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DF2-\u0DF3\u0F3E-\u0F3F\u0F7F\u102B-\u102C\u1031\u1038\u103B-\u103C\u1056-\u1057\u1062-\u1064\u1067-\u106D\u1083-\u1084\u1087-\u108C\u108F\u109A-\u109C\u17B6\u17BE-\u17C5\u17C7-\u17C8\u1923-\u1926\u1929-\u192B\u1930-\u1931\u1933-\u1938\u1A19-\u1A1A\u1A55\u1A57\u1A61\u1A63-\u1A64\u1A6D-\u1A72\u1B04\u1B35\u1B3B\u1B3D-\u1B41\u1B43-\u1B44\u1B82\u1BA1\u1BA6-\u1BA7\u1BAA\u1BE7\u1BEA-\u1BEC\u1BEE\u1BF2-\u1BF3\u1C24-\u1C2B\u1C34-\u1C35\u1CE1\u1CF2-\u1CF3\u302E-\u302F\uA823-\uA824\uA827\uA880-\uA881\uA8B4-\uA8C3\uA952-\uA953\uA983\uA9B4-\uA9B5\uA9BA-\uA9BB\uA9BD-\uA9C0\uAA2F-\uAA30\uAA33-\uAA34\uAA4D\uAA7B\uAA7D\uAAEB\uAAEE-\uAAEF\uAAF5\uABE3-\uABE4\uABE6-\uABE7\uABE9-\uABEA\uABEC]/,
Fb=n(["\u0903","\u093b",["\u093e","\u0940"],["\u0949","\u094c"],["\u094e","\u094f"],["\u0982","\u0983"],["\u09be","\u09c0"],["\u09c7","\u09c8"],["\u09cb","\u09cc"],"\u09d7","\u0a03",["\u0a3e","\u0a40"],"\u0a83",["\u0abe","\u0ac0"],"\u0ac9",["\u0acb","\u0acc"],["\u0b02","\u0b03"],"\u0b3e","\u0b40",["\u0b47","\u0b48"],["\u0b4b","\u0b4c"],"\u0b57",["\u0bbe","\u0bbf"],["\u0bc1","\u0bc2"],["\u0bc6","\u0bc8"],["\u0bca","\u0bcc"],"\u0bd7",["\u0c01","\u0c03"],["\u0c41","\u0c44"],["\u0c82","\u0c83"],"\u0cbe",
["\u0cc0","\u0cc4"],["\u0cc7","\u0cc8"],["\u0cca","\u0ccb"],["\u0cd5","\u0cd6"],["\u0d02","\u0d03"],["\u0d3e","\u0d40"],["\u0d46","\u0d48"],["\u0d4a","\u0d4c"],"\u0d57",["\u0d82","\u0d83"],["\u0dcf","\u0dd1"],["\u0dd8","\u0ddf"],["\u0df2","\u0df3"],["\u0f3e","\u0f3f"],"\u0f7f",["\u102b","\u102c"],"\u1031","\u1038",["\u103b","\u103c"],["\u1056","\u1057"],["\u1062","\u1064"],["\u1067","\u106d"],["\u1083","\u1084"],["\u1087","\u108c"],"\u108f",["\u109a","\u109c"],"\u17b6",["\u17be","\u17c5"],["\u17c7",
"\u17c8"],["\u1923","\u1926"],["\u1929","\u192b"],["\u1930","\u1931"],["\u1933","\u1938"],["\u1a19","\u1a1a"],"\u1a55","\u1a57","\u1a61",["\u1a63","\u1a64"],["\u1a6d","\u1a72"],"\u1b04","\u1b35","\u1b3b",["\u1b3d","\u1b41"],["\u1b43","\u1b44"],"\u1b82","\u1ba1",["\u1ba6","\u1ba7"],"\u1baa","\u1be7",["\u1bea","\u1bec"],"\u1bee",["\u1bf2","\u1bf3"],["\u1c24","\u1c2b"],["\u1c34","\u1c35"],"\u1ce1",["\u1cf2","\u1cf3"],["\u302e","\u302f"],["\ua823","\ua824"],"\ua827",["\ua880","\ua881"],["\ua8b4","\ua8c3"],
["\ua952","\ua953"],"\ua983",["\ua9b4","\ua9b5"],["\ua9ba","\ua9bb"],["\ua9bd","\ua9c0"],["\uaa2f","\uaa30"],["\uaa33","\uaa34"],"\uaa4d","\uaa7b","\uaa7d","\uaaeb",["\uaaee","\uaaef"],"\uaaf5",["\uabe3","\uabe4"],["\uabe6","\uabe7"],["\uabe9","\uabea"],"\uabec"],!1,!1),Cb=/^[\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962-\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2-\u09E3\u0A01-\u0A02\u0A3C\u0A41-\u0A42\u0A47-\u0A48\u0A4B-\u0A4D\u0A51\u0A70-\u0A71\u0A75\u0A81-\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7-\u0AC8\u0ACD\u0AE2-\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62-\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55-\u0C56\u0C62-\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC-\u0CCD\u0CE2-\u0CE3\u0D01\u0D41-\u0D44\u0D4D\u0D62-\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB-\u0EBC\u0EC8-\u0ECD\u0F18-\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86-\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039-\u103A\u103D-\u103E\u1058-\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17B4-\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927-\u1928\u1932\u1939-\u193B\u1A17-\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABD\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8-\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8-\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099-\u309A\uA66F\uA674-\uA67D\uA69E-\uA69F\uA6F0-\uA6F1\uA802\uA806\uA80B\uA825-\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31-\uAA32\uAA35-\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7-\uAAB8\uAABE-\uAABF\uAAC1\uAAEC-\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]/,
Db=n([["\u0300","\u036f"],["\u0483","\u0487"],["\u0591","\u05bd"],"\u05bf",["\u05c1","\u05c2"],["\u05c4","\u05c5"],"\u05c7",["\u0610","\u061a"],["\u064b","\u065f"],"\u0670",["\u06d6","\u06dc"],["\u06df","\u06e4"],["\u06e7","\u06e8"],["\u06ea","\u06ed"],"\u0711",["\u0730","\u074a"],["\u07a6","\u07b0"],["\u07eb","\u07f3"],["\u0816","\u0819"],["\u081b","\u0823"],["\u0825","\u0827"],["\u0829","\u082d"],["\u0859","\u085b"],["\u08e3","\u0902"],"\u093a","\u093c",["\u0941","\u0948"],"\u094d",["\u0951","\u0957"],
["\u0962","\u0963"],"\u0981","\u09bc",["\u09c1","\u09c4"],"\u09cd",["\u09e2","\u09e3"],["\u0a01","\u0a02"],"\u0a3c",["\u0a41","\u0a42"],["\u0a47","\u0a48"],["\u0a4b","\u0a4d"],"\u0a51",["\u0a70","\u0a71"],"\u0a75",["\u0a81","\u0a82"],"\u0abc",["\u0ac1","\u0ac5"],["\u0ac7","\u0ac8"],"\u0acd",["\u0ae2","\u0ae3"],"\u0b01","\u0b3c","\u0b3f",["\u0b41","\u0b44"],"\u0b4d","\u0b56",["\u0b62","\u0b63"],"\u0b82","\u0bc0","\u0bcd","\u0c00",["\u0c3e","\u0c40"],["\u0c46","\u0c48"],["\u0c4a","\u0c4d"],["\u0c55",
"\u0c56"],["\u0c62","\u0c63"],"\u0c81","\u0cbc","\u0cbf","\u0cc6",["\u0ccc","\u0ccd"],["\u0ce2","\u0ce3"],"\u0d01",["\u0d41","\u0d44"],"\u0d4d",["\u0d62","\u0d63"],"\u0dca",["\u0dd2","\u0dd4"],"\u0dd6","\u0e31",["\u0e34","\u0e3a"],["\u0e47","\u0e4e"],"\u0eb1",["\u0eb4","\u0eb9"],["\u0ebb","\u0ebc"],["\u0ec8","\u0ecd"],["\u0f18","\u0f19"],"\u0f35","\u0f37","\u0f39",["\u0f71","\u0f7e"],["\u0f80","\u0f84"],["\u0f86","\u0f87"],["\u0f8d","\u0f97"],["\u0f99","\u0fbc"],"\u0fc6",["\u102d","\u1030"],["\u1032",
"\u1037"],["\u1039","\u103a"],["\u103d","\u103e"],["\u1058","\u1059"],["\u105e","\u1060"],["\u1071","\u1074"],"\u1082",["\u1085","\u1086"],"\u108d","\u109d",["\u135d","\u135f"],["\u1712","\u1714"],["\u1732","\u1734"],["\u1752","\u1753"],["\u1772","\u1773"],["\u17b4","\u17b5"],["\u17b7","\u17bd"],"\u17c6",["\u17c9","\u17d3"],"\u17dd",["\u180b","\u180d"],"\u18a9",["\u1920","\u1922"],["\u1927","\u1928"],"\u1932",["\u1939","\u193b"],["\u1a17","\u1a18"],"\u1a1b","\u1a56",["\u1a58","\u1a5e"],"\u1a60","\u1a62",
["\u1a65","\u1a6c"],["\u1a73","\u1a7c"],"\u1a7f",["\u1ab0","\u1abd"],["\u1b00","\u1b03"],"\u1b34",["\u1b36","\u1b3a"],"\u1b3c","\u1b42",["\u1b6b","\u1b73"],["\u1b80","\u1b81"],["\u1ba2","\u1ba5"],["\u1ba8","\u1ba9"],["\u1bab","\u1bad"],"\u1be6",["\u1be8","\u1be9"],"\u1bed",["\u1bef","\u1bf1"],["\u1c2c","\u1c33"],["\u1c36","\u1c37"],["\u1cd0","\u1cd2"],["\u1cd4","\u1ce0"],["\u1ce2","\u1ce8"],"\u1ced","\u1cf4",["\u1cf8","\u1cf9"],["\u1dc0","\u1df5"],["\u1dfc","\u1dff"],["\u20d0","\u20dc"],"\u20e1",
["\u20e5","\u20f0"],["\u2cef","\u2cf1"],"\u2d7f",["\u2de0","\u2dff"],["\u302a","\u302d"],["\u3099","\u309a"],"\ua66f",["\ua674","\ua67d"],["\ua69e","\ua69f"],["\ua6f0","\ua6f1"],"\ua802","\ua806","\ua80b",["\ua825","\ua826"],"\ua8c4",["\ua8e0","\ua8f1"],["\ua926","\ua92d"],["\ua947","\ua951"],["\ua980","\ua982"],"\ua9b3",["\ua9b6","\ua9b9"],"\ua9bc","\ua9e5",["\uaa29","\uaa2e"],["\uaa31","\uaa32"],["\uaa35","\uaa36"],"\uaa43","\uaa4c","\uaa7c","\uaab0",["\uaab2","\uaab4"],["\uaab7","\uaab8"],["\uaabe",
"\uaabf"],"\uaac1",["\uaaec","\uaaed"],"\uaaf6","\uabe5","\uabe8","\uabed","\ufb1e",["\ufe00","\ufe0f"],["\ufe20","\ufe2f"]],!1,!1),Gb=/^[0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]/,
Hb=n([["0","9"],["\u0660","\u0669"],["\u06f0","\u06f9"],["\u07c0","\u07c9"],["\u0966","\u096f"],["\u09e6","\u09ef"],["\u0a66","\u0a6f"],["\u0ae6","\u0aef"],["\u0b66","\u0b6f"],["\u0be6","\u0bef"],["\u0c66","\u0c6f"],["\u0ce6","\u0cef"],["\u0d66","\u0d6f"],["\u0de6","\u0def"],["\u0e50","\u0e59"],["\u0ed0","\u0ed9"],["\u0f20","\u0f29"],["\u1040","\u1049"],["\u1090","\u1099"],["\u17e0","\u17e9"],["\u1810","\u1819"],["\u1946","\u194f"],["\u19d0","\u19d9"],["\u1a80","\u1a89"],["\u1a90","\u1a99"],["\u1b50",
"\u1b59"],["\u1bb0","\u1bb9"],["\u1c40","\u1c49"],["\u1c50","\u1c59"],["\ua620","\ua629"],["\ua8d0","\ua8d9"],["\ua900","\ua909"],["\ua9d0","\ua9d9"],["\ua9f0","\ua9f9"],["\uaa50","\uaa59"],["\uabf0","\uabf9"],["\uff10","\uff19"]],!1,!1),wb=/^[\u16EE-\u16F0\u2160-\u2182\u2185-\u2188\u3007\u3021-\u3029\u3038-\u303A\uA6E6-\uA6EF]/,xb=n([["\u16ee","\u16f0"],["\u2160","\u2182"],["\u2185","\u2188"],"\u3007",["\u3021","\u3029"],["\u3038","\u303a"],["\ua6e6","\ua6ef"]],!1,!1),Ib=/^[_\u203F-\u2040\u2054\uFE33-\uFE34\uFE4D-\uFE4F\uFF3F]/,
Jb=n(["_",["\u203f","\u2040"],"\u2054",["\ufe33","\ufe34"],["\ufe4d","\ufe4f"],"\uff3f"],!1,!1);n([" ","\u00a0","\u1680",["\u2000","\u200a"],"\u202f","\u205f","\u3000"],!1,!1);g("0x",!0);var c=0,p=0,y=[{line:1,column:1}],t=0,E=[],k=0,D;if("startRule"in q){if(!(q.startRule in pa))throw Error("Can't start parsing from rule \""+q.startRule+'".');qa=pa[q.startRule]}D=qa();if(D!==a&&c===f.length)return D;D!==a&&c<f.length&&h({type:"end"});throw function(a,c,e){return new u(u.buildMessage(a,c),a,c,e)}(E,
t<f.length?f.charAt(t):null,t<f.length?K(t,t+1):K(t,t));}}});

},{}],151:[function(require,module,exports){
(function(u,f){"function"===typeof define&&define.amd?define([],f):"object"===typeof module&&module.exports&&(module.exports=f())})(this,function(){function u(f,q,g,m){this.message=f;this.expected=q;this.found=g;this.location=m;this.name="SyntaxError";"function"===typeof Error.captureStackTrace&&Error.captureStackTrace(this,u)}(function(f,q){function g(){this.constructor=f}g.prototype=q.prototype;f.prototype=new g})(u,Error);u.buildMessage=function(f,q){function g(f){return f.charCodeAt(0).toString(16).toUpperCase()}
function m(f){return f.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\0/g,"\\0").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/[\x00-\x0F]/g,function(f){return"\\x0"+g(f)}).replace(/[\x10-\x1F\x7F-\x9F]/g,function(f){return"\\x"+g(f)})}function v(f){return f.replace(/\\/g,"\\\\").replace(/\]/g,"\\]").replace(/\^/g,"\\^").replace(/-/g,"\\-").replace(/\0/g,"\\0").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/[\x00-\x0F]/g,function(f){return"\\x0"+
g(f)}).replace(/[\x10-\x1F\x7F-\x9F]/g,function(f){return"\\x"+g(f)})}var u={literal:function(f){return'"'+m(f.text)+'"'},"class":function(f){var h="",g;for(g=0;g<f.parts.length;g++)h+=f.parts[g]instanceof Array?v(f.parts[g][0])+"-"+v(f.parts[g][1]):v(f.parts[g]);return"["+(f.inverted?"^":"")+h+"]"},any:function(f){return"any character"},end:function(f){return"end of input"},other:function(f){return f.description}};return"Expected "+function(f){var h=Array(f.length),g;for(g=0;g<f.length;g++){var m=
g,q;q=f[g];q=u[q.type](q);h[m]=q}h.sort();if(0<h.length){for(f=g=1;g<h.length;g++)h[g-1]!==h[g]&&(h[f]=h[g],f++);h.length=f}switch(h.length){case 1:return h[0];case 2:return h[0]+" or "+h[1];default:return h.slice(0,-1).join(", ")+", or "+h[h.length-1]}}(f)+" but "+(q?'"'+m(q)+'"':"end of input")+" found."};return{SyntaxError:u,parse:function(f,q){function g(b,a){return{type:"literal",text:b,ignoreCase:a}}function m(b,a,c){return{type:"class",parts:b,inverted:a,ignoreCase:c}}function v(b){return{type:"other",
description:b}}function O(b){var a=y[b],c;if(!a){for(c=b-1;!y[c];)c--;a=y[c];for(a={line:a.line,column:a.column};c<b;)10===f.charCodeAt(c)?(a.line++,a.column=1):a.column++,c++;y[b]=a}return a}function M(b,a){var c=O(b),f=O(a);return{start:{offset:b,line:c.line,column:c.column},end:{offset:a,line:f.line,column:f.column}}}function h(a){c<t||(c>t&&(t=c,F=[]),F.push(a))}function N(){var b,d,e;b=c;d=r();d!==a?(d=z(),d!==a?(e=r(),e!==a?(n=b,b=d):(c=b,b=a)):(c=b,b=a)):(c=b,b=a);return b}function E(){var b,
d,e,p;b=c;d=r();d!==a?(58===f.charCodeAt(c)?(e=va,c++):(e=a,0===k&&h(wa)),e!==a?(p=r(),p!==a?b=d=[d,e,p]:(c=b,b=a)):(c=b,b=a)):(c=b,b=a);return b}function x(){var b,d,e,p;b=c;d=r();d!==a?(44===f.charCodeAt(c)?(e=xa,c++):(e=a,0===k&&h(ya)),e!==a?(p=r(),p!==a?b=d=[d,e,p]:(c=b,b=a)):(c=b,b=a)):(c=b,b=a);return b}function r(){var b,d;k++;b=[];P.test(f.charAt(c))?(d=f.charAt(c),c++):(d=a,0===k&&h(Q));for(;d!==a;)b.push(d),P.test(f.charAt(c))?(d=f.charAt(c),c++):(d=a,0===k&&h(Q));k--;b===a&&0===k&&h(za);
return b}function z(){var b,d;b=c;f.substr(c,5)===R?(d=R,c+=5):(d=a,0===k&&h(Aa));d!==a&&(n=b,d=!1);b=d;if(b===a&&(b=S(),b===a&&(b=c,f.substr(c,4)===T?(d=T,c+=4):(d=a,0===k&&h(Ba)),d!==a&&(n=b,d=!0),b=d,b===a))){var e;b=c;d=A();d!==a?(f.substr(c,3)===U?(e=U,c+=3):(e=a,0===k&&h(Ca)),e!==a?(e=A(),e!==a?(n=b,b=d={from:Math.min(d,e),length:Math.max(d,e)-Math.min(d,e)}):(c=b,b=a)):(c=b,b=a)):(c=b,b=a);b===a&&(b=c,d=A(),d!==a?(f.substr(c,2)===V?(e=V,c+=2):(e=a,0===k&&h(Da)),e!==a?(e=A(),e!==a?(n=b,b=d=
{from:Math.min(d,e),length:Math.max(d,e)-Math.min(d,e)+1}):(c=b,b=a)):(c=b,b=a)):(c=b,b=a));b===a&&(b=G(),b===a&&(b=W(),b===a&&(b=X())))}return b}function S(){var b,d;b=c;f.substr(c,4)===Y?(d=Y,c+=4):(d=a,0===k&&h(Ea));d!==a&&(n=b,d=null);return d}function G(){var b,d,e,p,l,g;d=b=c;e=r();e!==a?(123===f.charCodeAt(c)?(p=Fa,c++):(p=a,0===k&&h(Ga)),p!==a?(l=r(),l!==a?d=e=[e,p,l]:(c=d,d=a)):(c=d,d=a)):(c=d,d=a);if(d!==a){d=c;e=H();if(e!==a){p=[];l=c;g=x();g!==a?(g=H(),g!==a?(n=l,l=g):(c=l,l=a)):(c=l,
l=a);for(;l!==a;)p.push(l),l=c,g=x(),g!==a?(g=H(),g!==a?(n=l,l=g):(c=l,l=a)):(c=l,l=a);p!==a?(n=d,d=e=Ha(e,p)):(c=d,d=a)}else c=d,d=a;d===a&&(d=null);d!==a?(e=c,p=r(),p!==a?(125===f.charCodeAt(c)?(l=Ia,c++):(l=a,0===k&&h(Ja)),l!==a?(g=r(),g!==a?e=p=[p,l,g]:(c=e,e=a)):(c=e,e=a)):(c=e,e=a),e!==a?(n=b,b=null!==d?d:[]):(c=b,b=a)):(c=b,b=a)}else c=b,b=a;return b}function H(){var b,d,e;b=c;d=Z();d!==a?(e=E(),e!==a?(e=I(),e!==a?(n=b,b=d={type:d,name:e,named:!0}):(c=b,b=a)):(c=b,b=a)):(c=b,b=a);b===a&&(b=
c,d=Z(),d!==a&&(n=b,d={type:d,named:!1}),b=d,b===a&&(b=c,d=I(),d!==a?(e=E(),e!==a?(e=G(),e!==a?(n=b,b=d={name:d,value:e}):(c=b,b=a)):(c=b,b=a)):(c=b,b=a),b===a&&(b=c,d=I(),d!==a&&(n=b,d={name:d,value:void 0}),b=d,b===a&&(b=c,d=aa(),d!==a?(e=E(),e!==a?(e=G(),e!==a?(n=b,b=d={name:d,value:e}):(c=b,b=a)):(c=b,b=a)):(c=b,b=a),b===a&&(b=c,d=aa(),d!==a&&(n=b,d={name:d,value:void 0}),b=d)))));return b}function I(){var b;b=X();if(b===a&&(b=W(),b===a&&(b=S(),b===a))){var d,e,f;k++;b=c;d=ba();if(d!==a){e=[];
for(f=ca();f!==a;)e.push(f),f=ca();e!==a?(n=b,b=d+=e.join("")):(c=b,b=a)}else c=b,b=a;k--;b===a&&0===k&&h(Ka)}return b}function aa(){var b,d,e,p,l,g;d=b=c;e=r();e!==a?(91===f.charCodeAt(c)?(p=La,c++):(p=a,0===k&&h(Ma)),p!==a?(l=r(),l!==a?d=e=[e,p,l]:(c=d,d=a)):(c=d,d=a)):(c=d,d=a);if(d!==a){d=c;e=z();if(e!==a){p=[];l=c;g=x();g!==a?(g=z(),g!==a?(n=l,l=g):(c=l,l=a)):(c=l,l=a);for(;l!==a;)p.push(l),l=c,g=x(),g!==a?(g=z(),g!==a?(n=l,l=g):(c=l,l=a)):(c=l,l=a);p!==a?(n=d,d=e=[e].concat(p)):(c=d,d=a)}else c=
d,d=a;d===a&&(d=null);d!==a?(e=c,p=r(),p!==a?(93===f.charCodeAt(c)?(l=Na,c++):(l=a,0===k&&h(Oa)),l!==a?(g=r(),g!==a?e=p=[p,l,g]:(c=e,e=a)):(c=e,e=a)):(c=e,e=a),e!==a?(n=b,b=null!==d?d:[]):(c=b,b=a)):(c=b,b=a)}else c=b,b=a;return b}function W(){var b,d;k++;b=c;d=J();d===a&&(d=null);if(d!==a)if(d=da(),d!==a){var e,g,l;d=c;46===f.charCodeAt(c)?(e=Pa,c++):(e=a,0===k&&h(Qa));if(e!==a){g=[];l=w();if(l!==a)for(;l!==a;)g.push(l),l=w();else g=a;g!==a?d=e=[e,g]:(c=d,d=a)}else c=d,d=a;d===a&&(d=null);if(d!==
a){var m;d=c;Ra.test(f.charAt(c))?(e=f.charAt(c),c++):(e=a,0===k&&h(Sa));if(e!==a)if(g=J(),g===a&&(43===f.charCodeAt(c)?(g=Ta,c++):(g=a,0===k&&h(Ua))),g===a&&(g=null),g!==a){l=[];m=w();if(m!==a)for(;m!==a;)l.push(m),m=w();else l=a;l!==a?d=e=[e,g,l]:(c=d,d=a)}else c=d,d=a;else c=d,d=a;d===a&&(d=null);d!==a?(n=b,b=d=parseFloat(f.substring(n,c))):(c=b,b=a)}else c=b,b=a}else c=b,b=a;else c=b,b=a;k--;b===a&&0===k&&h(Va);return b}function da(){var b,d,e,g;48===f.charCodeAt(c)?(b=Wa,c++):(b=a,0===k&&h(Xa));
if(b===a)if(b=c,Ya.test(f.charAt(c))?(d=f.charAt(c),c++):(d=a,0===k&&h(Za)),d!==a){e=[];for(g=w();g!==a;)e.push(g),g=w();e!==a?b=d=[d,e]:(c=b,b=a)}else c=b,b=a;return b}function A(){var b,d;b=c;d=J();d===a&&(d=null);d!==a?(d=da(),d!==a?(n=b,b=d=parseInt(f.substring(n,c),10)):(c=b,b=a)):(c=b,b=a);return b}function J(){var b;45===f.charCodeAt(c)?(b=ea,c++):(b=a,0===k&&h(fa));return b}function Z(){var b;f.substr(c,4)===ga?(b=ga,c+=4):(b=a,0===k&&h($a));b===a&&(f.substr(c,6)===ha?(b=ha,c+=6):(b=a,0===
k&&h(ab)),b===a&&(f.substr(c,8)===ia?(b=ia,c+=8):(b=a,0===k&&h(bb))));return b}function X(){var b,d,e;k++;b=c;d=ja();if(d!==a){d=[];for(e=ka();e!==a;)d.push(e),e=ka();d!==a?(e=ja(),e!==a?(n=b,b=d=d.join("")):(c=b,b=a)):(c=b,b=a)}else c=b,b=a;k--;b===a&&0===k&&h(cb);return b}function ka(){var b,d,e,g,l,m,q,r;db.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(eb));b===a&&(b=c,92===f.charCodeAt(c)?(d=K,c++):(d=a,0===k&&h(L)),d!==a?(34===f.charCodeAt(c)?(d=la,c++):(d=a,0===k&&h(ma)),d===a&&(39===
f.charCodeAt(c)?(d=na,c++):(d=a,0===k&&h(oa)),d===a&&(92===f.charCodeAt(c)?(d=K,c++):(d=a,0===k&&h(L)),d===a&&(47===f.charCodeAt(c)?(d=fb,c++):(d=a,0===k&&h(gb)),d===a&&(d=c,98===f.charCodeAt(c)?(e=hb,c++):(e=a,0===k&&h(ib)),e!==a&&(n=d,e="\b"),d=e,d===a&&(d=c,102===f.charCodeAt(c)?(e=jb,c++):(e=a,0===k&&h(kb)),e!==a&&(n=d,e="\f"),d=e,d===a&&(d=c,110===f.charCodeAt(c)?(e=lb,c++):(e=a,0===k&&h(mb)),e!==a&&(n=d,e="\n"),d=e,d===a&&(d=c,114===f.charCodeAt(c)?(e=nb,c++):(e=a,0===k&&h(ob)),e!==a&&(n=d,
e="\r"),d=e,d===a&&(d=c,116===f.charCodeAt(c)?(e=pb,c++):(e=a,0===k&&h(qb)),e!==a&&(n=d,e="\t"),d=e,d===a&&(d=c,117===f.charCodeAt(c)?(e=pa,c++):(e=a,0===k&&h(qa)),e!==a?(g=e=c,l=B(),l!==a?(m=B(),m!==a?(q=B(),q!==a?(r=B(),r!==a?g=l=[l,m,q,r]:(c=g,g=a)):(c=g,g=a)):(c=g,g=a)):(c=g,g=a),e=g!==a?f.substring(e,c):g,e!==a?(n=d,d=e=String.fromCharCode(parseInt(e,16))):(c=d,d=a)):(c=d,d=a)))))))))),d!==a?(n=b,b=d):(c=b,b=a)):(c=b,b=a));return b}function ja(){var b;34===f.charCodeAt(c)?(b=la,c++):(b=a,0===
k&&h(ma));b===a&&(39===f.charCodeAt(c)?(b=na,c++):(b=a,0===k&&h(oa)));return b}function w(){var b;rb.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(sb));return b}function B(){var b;ra.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(sa));return b}function ba(){var b,d;tb.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(ub));b===a&&(vb.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(wb)),b===a&&(xb.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(yb)),b===a&&(zb.test(f.charAt(c))?
(b=f.charAt(c),c++):(b=a,0===k&&h(Ab)),b===a&&(Bb.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(Cb)),b===a&&(Db.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(Eb)))))));if(b===a&&(36===f.charCodeAt(c)?(b=Fb,c++):(b=a,0===k&&h(Gb)),b===a&&(95===f.charCodeAt(c)?(b=Hb,c++):(b=a,0===k&&h(Ib)),b===a)))if(b=c,92===f.charCodeAt(c)?(d=K,c++):(d=a,0===k&&h(L)),d!==a){var e,g,l,m,q,r;d=c;117===f.charCodeAt(c)?(e=pa,c++):(e=a,0===k&&h(qa));e!==a?(g=e=c,l=C(),l!==a?(m=C(),m!==a?(q=C(),q!==a?(r=C(),
r!==a?g=l=[l,m,q,r]:(c=g,g=a)):(c=g,g=a)):(c=g,g=a)):(c=g,g=a),e=g!==a?f.substring(e,c):g,e!==a?(n=d,d=e=String.fromCharCode(parseInt(e,16))):(c=d,d=a)):(c=d,d=a);d!==a?(n=b,b=d):(c=b,b=a)}else c=b,b=a;return b}function ca(){var b;b=ba();b===a&&(Jb.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(Kb)),b===a&&(Lb.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(Mb))),b===a&&(Nb.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(Ob)),b===a&&(Pb.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===
k&&h(Qb)),b===a&&(8204===f.charCodeAt(c)?(b=Rb,c++):(b=a,0===k&&h(Sb)),b===a&&(8205===f.charCodeAt(c)?(b=Tb,c++):(b=a,0===k&&h(Ub)),b===a&&(45===f.charCodeAt(c)?(b=ea,c++):(b=a,0===k&&h(fa))))))));return b}function C(){var b;ra.test(f.charAt(c))?(b=f.charAt(c),c++):(b=a,0===k&&h(sa));return b}q=void 0!==q?q:{};var a={},ta={JSON_text:N},ua=N,La="[",Ma=g("[",!1),Fa="{",Ga=g("{",!1),Na="]",Oa=g("]",!1),Ia="}",Ja=g("}",!1),va=":",wa=g(":",!1),xa=",",ya=g(",",!1),za=v("whitespace"),P=/^[ \t\n\r]/,Q=m([" ",
"\t","\n","\r"],!1,!1),R="false",Aa=g("false",!1),Y="null",Ea=g("null",!1),T="true",Ba=g("true",!1),Ha=function(a,c){var e={},f,g=-1,h=e.$keys=[];a.type?(g++,h.push(a)):Array.isArray(a.name)?a.name.forEach(function(c){g++;h.push(c);void 0!==a.value&&(e[g]=a.value)}):(g++,h.push(a.name),void 0!==a.value&&(e[g]=a.value));for(f=0;f<c.length;f++)c[f].type?(g++,h.push(c[f])):Array.isArray(c[f].name)?c[f].name.forEach(function(a){g++;h.push(a);void 0!==c[f].value&&(e[g]=c[f].value)}):(g++,h.push(c[f].name),
void 0!==c[f].value&&(e[g]=c[f].value));return e},Va=v("number"),Pa=".",Qa=g(".",!1),Ya=/^[1-9]/,Za=m([["1","9"]],!1,!1),Ra=/^[eE]/,Sa=m(["e","E"],!1,!1),U="...",Ca=g("...",!1),V="..",Da=g("..",!1),ea="-",fa=g("-",!1),Ta="+",Ua=g("+",!1),Wa="0",Xa=g("0",!1),ga="keys",$a=g("keys",!1),ha="ranges",ab=g("ranges",!1),ia="integers",bb=g("integers",!1),cb=v("string"),la='"',ma=g('"',!1),na="'",oa=g("'",!1),K="\\",L=g("\\",!1),fb="/",gb=g("/",!1),hb="b",ib=g("b",!1),jb="f",kb=g("f",!1),lb="n",mb=g("n",!1),
nb="r",ob=g("r",!1),pb="t",qb=g("t",!1),pa="u",qa=g("u",!1),db=/^[^\0-\x1F"'\\]/,eb=m([["\x00","\u001f"],'"',"'","\\"],!0,!1),rb=/^[0-9]/,sb=m([["0","9"]],!1,!1),ra=/^[0-9a-f]/i,sa=m([["0","9"],["a","f"]],!1,!0),Ka=v("identifier"),Fb="$",Gb=g("$",!1),Hb="_",Ib=g("_",!1),Rb="\u200c",Sb=g("\u200c",!1),Tb="\u200d",Ub=g("\u200d",!1),vb=/^[a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137-\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148-\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C-\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA-\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9-\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC-\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF-\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F-\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0-\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB-\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE-\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0561-\u0587\u13F8-\u13FD\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6-\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FC7\u1FD0-\u1FD3\u1FD6-\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6-\u1FF7\u210A\u210E-\u210F\u2113\u212F\u2134\u2139\u213C-\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65-\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73-\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3-\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7B5\uA7B7\uA7FA\uAB30-\uAB5A\uAB60-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A]/,
wb=m([["a","z"],"\u00b5",["\u00df","\u00f6"],["\u00f8","\u00ff"],"\u0101","\u0103","\u0105","\u0107","\u0109","\u010b","\u010d","\u010f","\u0111","\u0113","\u0115","\u0117","\u0119","\u011b","\u011d","\u011f","\u0121","\u0123","\u0125","\u0127","\u0129","\u012b","\u012d","\u012f","\u0131","\u0133","\u0135",["\u0137","\u0138"],"\u013a","\u013c","\u013e","\u0140","\u0142","\u0144","\u0146",["\u0148","\u0149"],"\u014b","\u014d","\u014f","\u0151","\u0153","\u0155","\u0157","\u0159","\u015b","\u015d",
"\u015f","\u0161","\u0163","\u0165","\u0167","\u0169","\u016b","\u016d","\u016f","\u0171","\u0173","\u0175","\u0177","\u017a","\u017c",["\u017e","\u0180"],"\u0183","\u0185","\u0188",["\u018c","\u018d"],"\u0192","\u0195",["\u0199","\u019b"],"\u019e","\u01a1","\u01a3","\u01a5","\u01a8",["\u01aa","\u01ab"],"\u01ad","\u01b0","\u01b4","\u01b6",["\u01b9","\u01ba"],["\u01bd","\u01bf"],"\u01c6","\u01c9","\u01cc","\u01ce","\u01d0","\u01d2","\u01d4","\u01d6","\u01d8","\u01da",["\u01dc","\u01dd"],"\u01df","\u01e1",
"\u01e3","\u01e5","\u01e7","\u01e9","\u01eb","\u01ed",["\u01ef","\u01f0"],"\u01f3","\u01f5","\u01f9","\u01fb","\u01fd","\u01ff","\u0201","\u0203","\u0205","\u0207","\u0209","\u020b","\u020d","\u020f","\u0211","\u0213","\u0215","\u0217","\u0219","\u021b","\u021d","\u021f","\u0221","\u0223","\u0225","\u0227","\u0229","\u022b","\u022d","\u022f","\u0231",["\u0233","\u0239"],"\u023c",["\u023f","\u0240"],"\u0242","\u0247","\u0249","\u024b","\u024d",["\u024f","\u0293"],["\u0295","\u02af"],"\u0371","\u0373",
"\u0377",["\u037b","\u037d"],"\u0390",["\u03ac","\u03ce"],["\u03d0","\u03d1"],["\u03d5","\u03d7"],"\u03d9","\u03db","\u03dd","\u03df","\u03e1","\u03e3","\u03e5","\u03e7","\u03e9","\u03eb","\u03ed",["\u03ef","\u03f3"],"\u03f5","\u03f8",["\u03fb","\u03fc"],["\u0430","\u045f"],"\u0461","\u0463","\u0465","\u0467","\u0469","\u046b","\u046d","\u046f","\u0471","\u0473","\u0475","\u0477","\u0479","\u047b","\u047d","\u047f","\u0481","\u048b","\u048d","\u048f","\u0491","\u0493","\u0495","\u0497","\u0499","\u049b",
"\u049d","\u049f","\u04a1","\u04a3","\u04a5","\u04a7","\u04a9","\u04ab","\u04ad","\u04af","\u04b1","\u04b3","\u04b5","\u04b7","\u04b9","\u04bb","\u04bd","\u04bf","\u04c2","\u04c4","\u04c6","\u04c8","\u04ca","\u04cc",["\u04ce","\u04cf"],"\u04d1","\u04d3","\u04d5","\u04d7","\u04d9","\u04db","\u04dd","\u04df","\u04e1","\u04e3","\u04e5","\u04e7","\u04e9","\u04eb","\u04ed","\u04ef","\u04f1","\u04f3","\u04f5","\u04f7","\u04f9","\u04fb","\u04fd","\u04ff","\u0501","\u0503","\u0505","\u0507","\u0509","\u050b",
"\u050d","\u050f","\u0511","\u0513","\u0515","\u0517","\u0519","\u051b","\u051d","\u051f","\u0521","\u0523","\u0525","\u0527","\u0529","\u052b","\u052d","\u052f",["\u0561","\u0587"],["\u13f8","\u13fd"],["\u1d00","\u1d2b"],["\u1d6b","\u1d77"],["\u1d79","\u1d9a"],"\u1e01","\u1e03","\u1e05","\u1e07","\u1e09","\u1e0b","\u1e0d","\u1e0f","\u1e11","\u1e13","\u1e15","\u1e17","\u1e19","\u1e1b","\u1e1d","\u1e1f","\u1e21","\u1e23","\u1e25","\u1e27","\u1e29","\u1e2b","\u1e2d","\u1e2f","\u1e31","\u1e33","\u1e35",
"\u1e37","\u1e39","\u1e3b","\u1e3d","\u1e3f","\u1e41","\u1e43","\u1e45","\u1e47","\u1e49","\u1e4b","\u1e4d","\u1e4f","\u1e51","\u1e53","\u1e55","\u1e57","\u1e59","\u1e5b","\u1e5d","\u1e5f","\u1e61","\u1e63","\u1e65","\u1e67","\u1e69","\u1e6b","\u1e6d","\u1e6f","\u1e71","\u1e73","\u1e75","\u1e77","\u1e79","\u1e7b","\u1e7d","\u1e7f","\u1e81","\u1e83","\u1e85","\u1e87","\u1e89","\u1e8b","\u1e8d","\u1e8f","\u1e91","\u1e93",["\u1e95","\u1e9d"],"\u1e9f","\u1ea1","\u1ea3","\u1ea5","\u1ea7","\u1ea9","\u1eab",
"\u1ead","\u1eaf","\u1eb1","\u1eb3","\u1eb5","\u1eb7","\u1eb9","\u1ebb","\u1ebd","\u1ebf","\u1ec1","\u1ec3","\u1ec5","\u1ec7","\u1ec9","\u1ecb","\u1ecd","\u1ecf","\u1ed1","\u1ed3","\u1ed5","\u1ed7","\u1ed9","\u1edb","\u1edd","\u1edf","\u1ee1","\u1ee3","\u1ee5","\u1ee7","\u1ee9","\u1eeb","\u1eed","\u1eef","\u1ef1","\u1ef3","\u1ef5","\u1ef7","\u1ef9","\u1efb","\u1efd",["\u1eff","\u1f07"],["\u1f10","\u1f15"],["\u1f20","\u1f27"],["\u1f30","\u1f37"],["\u1f40","\u1f45"],["\u1f50","\u1f57"],["\u1f60","\u1f67"],
["\u1f70","\u1f7d"],["\u1f80","\u1f87"],["\u1f90","\u1f97"],["\u1fa0","\u1fa7"],["\u1fb0","\u1fb4"],["\u1fb6","\u1fb7"],"\u1fbe",["\u1fc2","\u1fc4"],["\u1fc6","\u1fc7"],["\u1fd0","\u1fd3"],["\u1fd6","\u1fd7"],["\u1fe0","\u1fe7"],["\u1ff2","\u1ff4"],["\u1ff6","\u1ff7"],"\u210a",["\u210e","\u210f"],"\u2113","\u212f","\u2134","\u2139",["\u213c","\u213d"],["\u2146","\u2149"],"\u214e","\u2184",["\u2c30","\u2c5e"],"\u2c61",["\u2c65","\u2c66"],"\u2c68","\u2c6a","\u2c6c","\u2c71",["\u2c73","\u2c74"],["\u2c76",
"\u2c7b"],"\u2c81","\u2c83","\u2c85","\u2c87","\u2c89","\u2c8b","\u2c8d","\u2c8f","\u2c91","\u2c93","\u2c95","\u2c97","\u2c99","\u2c9b","\u2c9d","\u2c9f","\u2ca1","\u2ca3","\u2ca5","\u2ca7","\u2ca9","\u2cab","\u2cad","\u2caf","\u2cb1","\u2cb3","\u2cb5","\u2cb7","\u2cb9","\u2cbb","\u2cbd","\u2cbf","\u2cc1","\u2cc3","\u2cc5","\u2cc7","\u2cc9","\u2ccb","\u2ccd","\u2ccf","\u2cd1","\u2cd3","\u2cd5","\u2cd7","\u2cd9","\u2cdb","\u2cdd","\u2cdf","\u2ce1",["\u2ce3","\u2ce4"],"\u2cec","\u2cee","\u2cf3",["\u2d00",
"\u2d25"],"\u2d27","\u2d2d","\ua641","\ua643","\ua645","\ua647","\ua649","\ua64b","\ua64d","\ua64f","\ua651","\ua653","\ua655","\ua657","\ua659","\ua65b","\ua65d","\ua65f","\ua661","\ua663","\ua665","\ua667","\ua669","\ua66b","\ua66d","\ua681","\ua683","\ua685","\ua687","\ua689","\ua68b","\ua68d","\ua68f","\ua691","\ua693","\ua695","\ua697","\ua699","\ua69b","\ua723","\ua725","\ua727","\ua729","\ua72b","\ua72d",["\ua72f","\ua731"],"\ua733","\ua735","\ua737","\ua739","\ua73b","\ua73d","\ua73f","\ua741",
"\ua743","\ua745","\ua747","\ua749","\ua74b","\ua74d","\ua74f","\ua751","\ua753","\ua755","\ua757","\ua759","\ua75b","\ua75d","\ua75f","\ua761","\ua763","\ua765","\ua767","\ua769","\ua76b","\ua76d","\ua76f",["\ua771","\ua778"],"\ua77a","\ua77c","\ua77f","\ua781","\ua783","\ua785","\ua787","\ua78c","\ua78e","\ua791",["\ua793","\ua795"],"\ua797","\ua799","\ua79b","\ua79d","\ua79f","\ua7a1","\ua7a3","\ua7a5","\ua7a7","\ua7a9","\ua7b5","\ua7b7","\ua7fa",["\uab30","\uab5a"],["\uab60","\uab65"],["\uab70",
"\uabbf"],["\ufb00","\ufb06"],["\ufb13","\ufb17"],["\uff41","\uff5a"]],!1,!1),zb=/^[\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0374\u037A\u0559\u0640\u06E5-\u06E6\u07F4-\u07F5\u07FA\u081A\u0824\u0828\u0971\u0E46\u0EC6\u10FC\u17D7\u1843\u1AA7\u1C78-\u1C7D\u1D2C-\u1D6A\u1D78\u1D9B-\u1DBF\u2071\u207F\u2090-\u209C\u2C7C-\u2C7D\u2D6F\u2E2F\u3005\u3031-\u3035\u303B\u309D-\u309E\u30FC-\u30FE\uA015\uA4F8-\uA4FD\uA60C\uA67F\uA69C-\uA69D\uA717-\uA71F\uA770\uA788\uA7F8-\uA7F9\uA9CF\uA9E6\uAA70\uAADD\uAAF3-\uAAF4\uAB5C-\uAB5F\uFF70\uFF9E-\uFF9F]/,
Ab=m([["\u02b0","\u02c1"],["\u02c6","\u02d1"],["\u02e0","\u02e4"],"\u02ec","\u02ee","\u0374","\u037a","\u0559","\u0640",["\u06e5","\u06e6"],["\u07f4","\u07f5"],"\u07fa","\u081a","\u0824","\u0828","\u0971","\u0e46","\u0ec6","\u10fc","\u17d7","\u1843","\u1aa7",["\u1c78","\u1c7d"],["\u1d2c","\u1d6a"],"\u1d78",["\u1d9b","\u1dbf"],"\u2071","\u207f",["\u2090","\u209c"],["\u2c7c","\u2c7d"],"\u2d6f","\u2e2f","\u3005",["\u3031","\u3035"],"\u303b",["\u309d","\u309e"],["\u30fc","\u30fe"],"\ua015",["\ua4f8",
"\ua4fd"],"\ua60c","\ua67f",["\ua69c","\ua69d"],["\ua717","\ua71f"],"\ua770","\ua788",["\ua7f8","\ua7f9"],"\ua9cf","\ua9e6","\uaa70","\uaadd",["\uaaf3","\uaaf4"],["\uab5c","\uab5f"],"\uff70",["\uff9e","\uff9f"]],!1,!1),Bb=/^[\xAA\xBA\u01BB\u01C0-\u01C3\u0294\u05D0-\u05EA\u05F0-\u05F2\u0620-\u063F\u0641-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u0800-\u0815\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0972-\u0980\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0CF1-\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32-\u0E33\u0E40-\u0E45\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u10D0-\u10FA\u10FD-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17DC\u1820-\u1842\u1844-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C77\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5-\u1CF6\u2135-\u2138\u2D30-\u2D67\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3006\u303C\u3041-\u3096\u309F\u30A1-\u30FA\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA014\uA016-\uA48C\uA4D0-\uA4F7\uA500-\uA60B\uA610-\uA61F\uA62A-\uA62B\uA66E\uA6A0-\uA6E5\uA78F\uA7F7\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9E0-\uA9E4\uA9E7-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA6F\uAA71-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5-\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADC\uAAE0-\uAAEA\uAAF2\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF66-\uFF6F\uFF71-\uFF9D\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
Cb=m(["\u00aa","\u00ba","\u01bb",["\u01c0","\u01c3"],"\u0294",["\u05d0","\u05ea"],["\u05f0","\u05f2"],["\u0620","\u063f"],["\u0641","\u064a"],["\u066e","\u066f"],["\u0671","\u06d3"],"\u06d5",["\u06ee","\u06ef"],["\u06fa","\u06fc"],"\u06ff","\u0710",["\u0712","\u072f"],["\u074d","\u07a5"],"\u07b1",["\u07ca","\u07ea"],["\u0800","\u0815"],["\u0840","\u0858"],["\u08a0","\u08b4"],["\u0904","\u0939"],"\u093d","\u0950",["\u0958","\u0961"],["\u0972","\u0980"],["\u0985","\u098c"],["\u098f","\u0990"],["\u0993",
"\u09a8"],["\u09aa","\u09b0"],"\u09b2",["\u09b6","\u09b9"],"\u09bd","\u09ce",["\u09dc","\u09dd"],["\u09df","\u09e1"],["\u09f0","\u09f1"],["\u0a05","\u0a0a"],["\u0a0f","\u0a10"],["\u0a13","\u0a28"],["\u0a2a","\u0a30"],["\u0a32","\u0a33"],["\u0a35","\u0a36"],["\u0a38","\u0a39"],["\u0a59","\u0a5c"],"\u0a5e",["\u0a72","\u0a74"],["\u0a85","\u0a8d"],["\u0a8f","\u0a91"],["\u0a93","\u0aa8"],["\u0aaa","\u0ab0"],["\u0ab2","\u0ab3"],["\u0ab5","\u0ab9"],"\u0abd","\u0ad0",["\u0ae0","\u0ae1"],"\u0af9",["\u0b05",
"\u0b0c"],["\u0b0f","\u0b10"],["\u0b13","\u0b28"],["\u0b2a","\u0b30"],["\u0b32","\u0b33"],["\u0b35","\u0b39"],"\u0b3d",["\u0b5c","\u0b5d"],["\u0b5f","\u0b61"],"\u0b71","\u0b83",["\u0b85","\u0b8a"],["\u0b8e","\u0b90"],["\u0b92","\u0b95"],["\u0b99","\u0b9a"],"\u0b9c",["\u0b9e","\u0b9f"],["\u0ba3","\u0ba4"],["\u0ba8","\u0baa"],["\u0bae","\u0bb9"],"\u0bd0",["\u0c05","\u0c0c"],["\u0c0e","\u0c10"],["\u0c12","\u0c28"],["\u0c2a","\u0c39"],"\u0c3d",["\u0c58","\u0c5a"],["\u0c60","\u0c61"],["\u0c85","\u0c8c"],
["\u0c8e","\u0c90"],["\u0c92","\u0ca8"],["\u0caa","\u0cb3"],["\u0cb5","\u0cb9"],"\u0cbd","\u0cde",["\u0ce0","\u0ce1"],["\u0cf1","\u0cf2"],["\u0d05","\u0d0c"],["\u0d0e","\u0d10"],["\u0d12","\u0d3a"],"\u0d3d","\u0d4e",["\u0d5f","\u0d61"],["\u0d7a","\u0d7f"],["\u0d85","\u0d96"],["\u0d9a","\u0db1"],["\u0db3","\u0dbb"],"\u0dbd",["\u0dc0","\u0dc6"],["\u0e01","\u0e30"],["\u0e32","\u0e33"],["\u0e40","\u0e45"],["\u0e81","\u0e82"],"\u0e84",["\u0e87","\u0e88"],"\u0e8a","\u0e8d",["\u0e94","\u0e97"],["\u0e99",
"\u0e9f"],["\u0ea1","\u0ea3"],"\u0ea5","\u0ea7",["\u0eaa","\u0eab"],["\u0ead","\u0eb0"],["\u0eb2","\u0eb3"],"\u0ebd",["\u0ec0","\u0ec4"],["\u0edc","\u0edf"],"\u0f00",["\u0f40","\u0f47"],["\u0f49","\u0f6c"],["\u0f88","\u0f8c"],["\u1000","\u102a"],"\u103f",["\u1050","\u1055"],["\u105a","\u105d"],"\u1061",["\u1065","\u1066"],["\u106e","\u1070"],["\u1075","\u1081"],"\u108e",["\u10d0","\u10fa"],["\u10fd","\u1248"],["\u124a","\u124d"],["\u1250","\u1256"],"\u1258",["\u125a","\u125d"],["\u1260","\u1288"],
["\u128a","\u128d"],["\u1290","\u12b0"],["\u12b2","\u12b5"],["\u12b8","\u12be"],"\u12c0",["\u12c2","\u12c5"],["\u12c8","\u12d6"],["\u12d8","\u1310"],["\u1312","\u1315"],["\u1318","\u135a"],["\u1380","\u138f"],["\u1401","\u166c"],["\u166f","\u167f"],["\u1681","\u169a"],["\u16a0","\u16ea"],["\u16f1","\u16f8"],["\u1700","\u170c"],["\u170e","\u1711"],["\u1720","\u1731"],["\u1740","\u1751"],["\u1760","\u176c"],["\u176e","\u1770"],["\u1780","\u17b3"],"\u17dc",["\u1820","\u1842"],["\u1844","\u1877"],["\u1880",
"\u18a8"],"\u18aa",["\u18b0","\u18f5"],["\u1900","\u191e"],["\u1950","\u196d"],["\u1970","\u1974"],["\u1980","\u19ab"],["\u19b0","\u19c9"],["\u1a00","\u1a16"],["\u1a20","\u1a54"],["\u1b05","\u1b33"],["\u1b45","\u1b4b"],["\u1b83","\u1ba0"],["\u1bae","\u1baf"],["\u1bba","\u1be5"],["\u1c00","\u1c23"],["\u1c4d","\u1c4f"],["\u1c5a","\u1c77"],["\u1ce9","\u1cec"],["\u1cee","\u1cf1"],["\u1cf5","\u1cf6"],["\u2135","\u2138"],["\u2d30","\u2d67"],["\u2d80","\u2d96"],["\u2da0","\u2da6"],["\u2da8","\u2dae"],["\u2db0",
"\u2db6"],["\u2db8","\u2dbe"],["\u2dc0","\u2dc6"],["\u2dc8","\u2dce"],["\u2dd0","\u2dd6"],["\u2dd8","\u2dde"],"\u3006","\u303c",["\u3041","\u3096"],"\u309f",["\u30a1","\u30fa"],"\u30ff",["\u3105","\u312d"],["\u3131","\u318e"],["\u31a0","\u31ba"],["\u31f0","\u31ff"],["\u3400","\u4db5"],["\u4e00","\u9fd5"],["\ua000","\ua014"],["\ua016","\ua48c"],["\ua4d0","\ua4f7"],["\ua500","\ua60b"],["\ua610","\ua61f"],["\ua62a","\ua62b"],"\ua66e",["\ua6a0","\ua6e5"],"\ua78f","\ua7f7",["\ua7fb","\ua801"],["\ua803",
"\ua805"],["\ua807","\ua80a"],["\ua80c","\ua822"],["\ua840","\ua873"],["\ua882","\ua8b3"],["\ua8f2","\ua8f7"],"\ua8fb","\ua8fd",["\ua90a","\ua925"],["\ua930","\ua946"],["\ua960","\ua97c"],["\ua984","\ua9b2"],["\ua9e0","\ua9e4"],["\ua9e7","\ua9ef"],["\ua9fa","\ua9fe"],["\uaa00","\uaa28"],["\uaa40","\uaa42"],["\uaa44","\uaa4b"],["\uaa60","\uaa6f"],["\uaa71","\uaa76"],"\uaa7a",["\uaa7e","\uaaaf"],"\uaab1",["\uaab5","\uaab6"],["\uaab9","\uaabd"],"\uaac0","\uaac2",["\uaadb","\uaadc"],["\uaae0","\uaaea"],
"\uaaf2",["\uab01","\uab06"],["\uab09","\uab0e"],["\uab11","\uab16"],["\uab20","\uab26"],["\uab28","\uab2e"],["\uabc0","\uabe2"],["\uac00","\ud7a3"],["\ud7b0","\ud7c6"],["\ud7cb","\ud7fb"],["\uf900","\ufa6d"],["\ufa70","\ufad9"],"\ufb1d",["\ufb1f","\ufb28"],["\ufb2a","\ufb36"],["\ufb38","\ufb3c"],"\ufb3e",["\ufb40","\ufb41"],["\ufb43","\ufb44"],["\ufb46","\ufbb1"],["\ufbd3","\ufd3d"],["\ufd50","\ufd8f"],["\ufd92","\ufdc7"],["\ufdf0","\ufdfb"],["\ufe70","\ufe74"],["\ufe76","\ufefc"],["\uff66","\uff6f"],
["\uff71","\uff9d"],["\uffa0","\uffbe"],["\uffc2","\uffc7"],["\uffca","\uffcf"],["\uffd2","\uffd7"],["\uffda","\uffdc"]],!1,!1),xb=/^[\u01C5\u01C8\u01CB\u01F2\u1F88-\u1F8F\u1F98-\u1F9F\u1FA8-\u1FAF\u1FBC\u1FCC\u1FFC]/,yb=m(["\u01c5","\u01c8","\u01cb","\u01f2",["\u1f88","\u1f8f"],["\u1f98","\u1f9f"],["\u1fa8","\u1faf"],"\u1fbc","\u1fcc","\u1ffc"],!1,!1),tb=/^[A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178-\u0179\u017B\u017D\u0181-\u0182\u0184\u0186-\u0187\u0189-\u018B\u018E-\u0191\u0193-\u0194\u0196-\u0198\u019C-\u019D\u019F-\u01A0\u01A2\u01A4\u01A6-\u01A7\u01A9\u01AC\u01AE-\u01AF\u01B1-\u01B3\u01B5\u01B7-\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A-\u023B\u023D-\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E-\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9-\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0-\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E-\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D-\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0-\uA7B4\uA7B6\uFF21-\uFF3A]/,
ub=m([["A","Z"],["\u00c0","\u00d6"],["\u00d8","\u00de"],"\u0100","\u0102","\u0104","\u0106","\u0108","\u010a","\u010c","\u010e","\u0110","\u0112","\u0114","\u0116","\u0118","\u011a","\u011c","\u011e","\u0120","\u0122","\u0124","\u0126","\u0128","\u012a","\u012c","\u012e","\u0130","\u0132","\u0134","\u0136","\u0139","\u013b","\u013d","\u013f","\u0141","\u0143","\u0145","\u0147","\u014a","\u014c","\u014e","\u0150","\u0152","\u0154","\u0156","\u0158","\u015a","\u015c","\u015e","\u0160","\u0162","\u0164",
"\u0166","\u0168","\u016a","\u016c","\u016e","\u0170","\u0172","\u0174","\u0176",["\u0178","\u0179"],"\u017b","\u017d",["\u0181","\u0182"],"\u0184",["\u0186","\u0187"],["\u0189","\u018b"],["\u018e","\u0191"],["\u0193","\u0194"],["\u0196","\u0198"],["\u019c","\u019d"],["\u019f","\u01a0"],"\u01a2","\u01a4",["\u01a6","\u01a7"],"\u01a9","\u01ac",["\u01ae","\u01af"],["\u01b1","\u01b3"],"\u01b5",["\u01b7","\u01b8"],"\u01bc","\u01c4","\u01c7","\u01ca","\u01cd","\u01cf","\u01d1","\u01d3","\u01d5","\u01d7",
"\u01d9","\u01db","\u01de","\u01e0","\u01e2","\u01e4","\u01e6","\u01e8","\u01ea","\u01ec","\u01ee","\u01f1","\u01f4",["\u01f6","\u01f8"],"\u01fa","\u01fc","\u01fe","\u0200","\u0202","\u0204","\u0206","\u0208","\u020a","\u020c","\u020e","\u0210","\u0212","\u0214","\u0216","\u0218","\u021a","\u021c","\u021e","\u0220","\u0222","\u0224","\u0226","\u0228","\u022a","\u022c","\u022e","\u0230","\u0232",["\u023a","\u023b"],["\u023d","\u023e"],"\u0241",["\u0243","\u0246"],"\u0248","\u024a","\u024c","\u024e",
"\u0370","\u0372","\u0376","\u037f","\u0386",["\u0388","\u038a"],"\u038c",["\u038e","\u038f"],["\u0391","\u03a1"],["\u03a3","\u03ab"],"\u03cf",["\u03d2","\u03d4"],"\u03d8","\u03da","\u03dc","\u03de","\u03e0","\u03e2","\u03e4","\u03e6","\u03e8","\u03ea","\u03ec","\u03ee","\u03f4","\u03f7",["\u03f9","\u03fa"],["\u03fd","\u042f"],"\u0460","\u0462","\u0464","\u0466","\u0468","\u046a","\u046c","\u046e","\u0470","\u0472","\u0474","\u0476","\u0478","\u047a","\u047c","\u047e","\u0480","\u048a","\u048c","\u048e",
"\u0490","\u0492","\u0494","\u0496","\u0498","\u049a","\u049c","\u049e","\u04a0","\u04a2","\u04a4","\u04a6","\u04a8","\u04aa","\u04ac","\u04ae","\u04b0","\u04b2","\u04b4","\u04b6","\u04b8","\u04ba","\u04bc","\u04be",["\u04c0","\u04c1"],"\u04c3","\u04c5","\u04c7","\u04c9","\u04cb","\u04cd","\u04d0","\u04d2","\u04d4","\u04d6","\u04d8","\u04da","\u04dc","\u04de","\u04e0","\u04e2","\u04e4","\u04e6","\u04e8","\u04ea","\u04ec","\u04ee","\u04f0","\u04f2","\u04f4","\u04f6","\u04f8","\u04fa","\u04fc","\u04fe",
"\u0500","\u0502","\u0504","\u0506","\u0508","\u050a","\u050c","\u050e","\u0510","\u0512","\u0514","\u0516","\u0518","\u051a","\u051c","\u051e","\u0520","\u0522","\u0524","\u0526","\u0528","\u052a","\u052c","\u052e",["\u0531","\u0556"],["\u10a0","\u10c5"],"\u10c7","\u10cd",["\u13a0","\u13f5"],"\u1e00","\u1e02","\u1e04","\u1e06","\u1e08","\u1e0a","\u1e0c","\u1e0e","\u1e10","\u1e12","\u1e14","\u1e16","\u1e18","\u1e1a","\u1e1c","\u1e1e","\u1e20","\u1e22","\u1e24","\u1e26","\u1e28","\u1e2a","\u1e2c",
"\u1e2e","\u1e30","\u1e32","\u1e34","\u1e36","\u1e38","\u1e3a","\u1e3c","\u1e3e","\u1e40","\u1e42","\u1e44","\u1e46","\u1e48","\u1e4a","\u1e4c","\u1e4e","\u1e50","\u1e52","\u1e54","\u1e56","\u1e58","\u1e5a","\u1e5c","\u1e5e","\u1e60","\u1e62","\u1e64","\u1e66","\u1e68","\u1e6a","\u1e6c","\u1e6e","\u1e70","\u1e72","\u1e74","\u1e76","\u1e78","\u1e7a","\u1e7c","\u1e7e","\u1e80","\u1e82","\u1e84","\u1e86","\u1e88","\u1e8a","\u1e8c","\u1e8e","\u1e90","\u1e92","\u1e94","\u1e9e","\u1ea0","\u1ea2","\u1ea4",
"\u1ea6","\u1ea8","\u1eaa","\u1eac","\u1eae","\u1eb0","\u1eb2","\u1eb4","\u1eb6","\u1eb8","\u1eba","\u1ebc","\u1ebe","\u1ec0","\u1ec2","\u1ec4","\u1ec6","\u1ec8","\u1eca","\u1ecc","\u1ece","\u1ed0","\u1ed2","\u1ed4","\u1ed6","\u1ed8","\u1eda","\u1edc","\u1ede","\u1ee0","\u1ee2","\u1ee4","\u1ee6","\u1ee8","\u1eea","\u1eec","\u1eee","\u1ef0","\u1ef2","\u1ef4","\u1ef6","\u1ef8","\u1efa","\u1efc","\u1efe",["\u1f08","\u1f0f"],["\u1f18","\u1f1d"],["\u1f28","\u1f2f"],["\u1f38","\u1f3f"],["\u1f48","\u1f4d"],
"\u1f59","\u1f5b","\u1f5d","\u1f5f",["\u1f68","\u1f6f"],["\u1fb8","\u1fbb"],["\u1fc8","\u1fcb"],["\u1fd8","\u1fdb"],["\u1fe8","\u1fec"],["\u1ff8","\u1ffb"],"\u2102","\u2107",["\u210b","\u210d"],["\u2110","\u2112"],"\u2115",["\u2119","\u211d"],"\u2124","\u2126","\u2128",["\u212a","\u212d"],["\u2130","\u2133"],["\u213e","\u213f"],"\u2145","\u2183",["\u2c00","\u2c2e"],"\u2c60",["\u2c62","\u2c64"],"\u2c67","\u2c69","\u2c6b",["\u2c6d","\u2c70"],"\u2c72","\u2c75",["\u2c7e","\u2c80"],"\u2c82","\u2c84","\u2c86",
"\u2c88","\u2c8a","\u2c8c","\u2c8e","\u2c90","\u2c92","\u2c94","\u2c96","\u2c98","\u2c9a","\u2c9c","\u2c9e","\u2ca0","\u2ca2","\u2ca4","\u2ca6","\u2ca8","\u2caa","\u2cac","\u2cae","\u2cb0","\u2cb2","\u2cb4","\u2cb6","\u2cb8","\u2cba","\u2cbc","\u2cbe","\u2cc0","\u2cc2","\u2cc4","\u2cc6","\u2cc8","\u2cca","\u2ccc","\u2cce","\u2cd0","\u2cd2","\u2cd4","\u2cd6","\u2cd8","\u2cda","\u2cdc","\u2cde","\u2ce0","\u2ce2","\u2ceb","\u2ced","\u2cf2","\ua640","\ua642","\ua644","\ua646","\ua648","\ua64a","\ua64c",
"\ua64e","\ua650","\ua652","\ua654","\ua656","\ua658","\ua65a","\ua65c","\ua65e","\ua660","\ua662","\ua664","\ua666","\ua668","\ua66a","\ua66c","\ua680","\ua682","\ua684","\ua686","\ua688","\ua68a","\ua68c","\ua68e","\ua690","\ua692","\ua694","\ua696","\ua698","\ua69a","\ua722","\ua724","\ua726","\ua728","\ua72a","\ua72c","\ua72e","\ua732","\ua734","\ua736","\ua738","\ua73a","\ua73c","\ua73e","\ua740","\ua742","\ua744","\ua746","\ua748","\ua74a","\ua74c","\ua74e","\ua750","\ua752","\ua754","\ua756",
"\ua758","\ua75a","\ua75c","\ua75e","\ua760","\ua762","\ua764","\ua766","\ua768","\ua76a","\ua76c","\ua76e","\ua779","\ua77b",["\ua77d","\ua77e"],"\ua780","\ua782","\ua784","\ua786","\ua78b","\ua78d","\ua790","\ua792","\ua796","\ua798","\ua79a","\ua79c","\ua79e","\ua7a0","\ua7a2","\ua7a4","\ua7a6","\ua7a8",["\ua7aa","\ua7ad"],["\ua7b0","\ua7b4"],"\ua7b6",["\uff21","\uff3a"]],!1,!1),Lb=/^[\u0903\u093B\u093E-\u0940\u0949-\u094C\u094E-\u094F\u0982-\u0983\u09BE-\u09C0\u09C7-\u09C8\u09CB-\u09CC\u09D7\u0A03\u0A3E-\u0A40\u0A83\u0ABE-\u0AC0\u0AC9\u0ACB-\u0ACC\u0B02-\u0B03\u0B3E\u0B40\u0B47-\u0B48\u0B4B-\u0B4C\u0B57\u0BBE-\u0BBF\u0BC1-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD7\u0C01-\u0C03\u0C41-\u0C44\u0C82-\u0C83\u0CBE\u0CC0-\u0CC4\u0CC7-\u0CC8\u0CCA-\u0CCB\u0CD5-\u0CD6\u0D02-\u0D03\u0D3E-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D82-\u0D83\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DF2-\u0DF3\u0F3E-\u0F3F\u0F7F\u102B-\u102C\u1031\u1038\u103B-\u103C\u1056-\u1057\u1062-\u1064\u1067-\u106D\u1083-\u1084\u1087-\u108C\u108F\u109A-\u109C\u17B6\u17BE-\u17C5\u17C7-\u17C8\u1923-\u1926\u1929-\u192B\u1930-\u1931\u1933-\u1938\u1A19-\u1A1A\u1A55\u1A57\u1A61\u1A63-\u1A64\u1A6D-\u1A72\u1B04\u1B35\u1B3B\u1B3D-\u1B41\u1B43-\u1B44\u1B82\u1BA1\u1BA6-\u1BA7\u1BAA\u1BE7\u1BEA-\u1BEC\u1BEE\u1BF2-\u1BF3\u1C24-\u1C2B\u1C34-\u1C35\u1CE1\u1CF2-\u1CF3\u302E-\u302F\uA823-\uA824\uA827\uA880-\uA881\uA8B4-\uA8C3\uA952-\uA953\uA983\uA9B4-\uA9B5\uA9BA-\uA9BB\uA9BD-\uA9C0\uAA2F-\uAA30\uAA33-\uAA34\uAA4D\uAA7B\uAA7D\uAAEB\uAAEE-\uAAEF\uAAF5\uABE3-\uABE4\uABE6-\uABE7\uABE9-\uABEA\uABEC]/,
Mb=m(["\u0903","\u093b",["\u093e","\u0940"],["\u0949","\u094c"],["\u094e","\u094f"],["\u0982","\u0983"],["\u09be","\u09c0"],["\u09c7","\u09c8"],["\u09cb","\u09cc"],"\u09d7","\u0a03",["\u0a3e","\u0a40"],"\u0a83",["\u0abe","\u0ac0"],"\u0ac9",["\u0acb","\u0acc"],["\u0b02","\u0b03"],"\u0b3e","\u0b40",["\u0b47","\u0b48"],["\u0b4b","\u0b4c"],"\u0b57",["\u0bbe","\u0bbf"],["\u0bc1","\u0bc2"],["\u0bc6","\u0bc8"],["\u0bca","\u0bcc"],"\u0bd7",["\u0c01","\u0c03"],["\u0c41","\u0c44"],["\u0c82","\u0c83"],"\u0cbe",
["\u0cc0","\u0cc4"],["\u0cc7","\u0cc8"],["\u0cca","\u0ccb"],["\u0cd5","\u0cd6"],["\u0d02","\u0d03"],["\u0d3e","\u0d40"],["\u0d46","\u0d48"],["\u0d4a","\u0d4c"],"\u0d57",["\u0d82","\u0d83"],["\u0dcf","\u0dd1"],["\u0dd8","\u0ddf"],["\u0df2","\u0df3"],["\u0f3e","\u0f3f"],"\u0f7f",["\u102b","\u102c"],"\u1031","\u1038",["\u103b","\u103c"],["\u1056","\u1057"],["\u1062","\u1064"],["\u1067","\u106d"],["\u1083","\u1084"],["\u1087","\u108c"],"\u108f",["\u109a","\u109c"],"\u17b6",["\u17be","\u17c5"],["\u17c7",
"\u17c8"],["\u1923","\u1926"],["\u1929","\u192b"],["\u1930","\u1931"],["\u1933","\u1938"],["\u1a19","\u1a1a"],"\u1a55","\u1a57","\u1a61",["\u1a63","\u1a64"],["\u1a6d","\u1a72"],"\u1b04","\u1b35","\u1b3b",["\u1b3d","\u1b41"],["\u1b43","\u1b44"],"\u1b82","\u1ba1",["\u1ba6","\u1ba7"],"\u1baa","\u1be7",["\u1bea","\u1bec"],"\u1bee",["\u1bf2","\u1bf3"],["\u1c24","\u1c2b"],["\u1c34","\u1c35"],"\u1ce1",["\u1cf2","\u1cf3"],["\u302e","\u302f"],["\ua823","\ua824"],"\ua827",["\ua880","\ua881"],["\ua8b4","\ua8c3"],
["\ua952","\ua953"],"\ua983",["\ua9b4","\ua9b5"],["\ua9ba","\ua9bb"],["\ua9bd","\ua9c0"],["\uaa2f","\uaa30"],["\uaa33","\uaa34"],"\uaa4d","\uaa7b","\uaa7d","\uaaeb",["\uaaee","\uaaef"],"\uaaf5",["\uabe3","\uabe4"],["\uabe6","\uabe7"],["\uabe9","\uabea"],"\uabec"],!1,!1),Jb=/^[\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962-\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2-\u09E3\u0A01-\u0A02\u0A3C\u0A41-\u0A42\u0A47-\u0A48\u0A4B-\u0A4D\u0A51\u0A70-\u0A71\u0A75\u0A81-\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7-\u0AC8\u0ACD\u0AE2-\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62-\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55-\u0C56\u0C62-\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC-\u0CCD\u0CE2-\u0CE3\u0D01\u0D41-\u0D44\u0D4D\u0D62-\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB-\u0EBC\u0EC8-\u0ECD\u0F18-\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86-\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039-\u103A\u103D-\u103E\u1058-\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17B4-\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927-\u1928\u1932\u1939-\u193B\u1A17-\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABD\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8-\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8-\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099-\u309A\uA66F\uA674-\uA67D\uA69E-\uA69F\uA6F0-\uA6F1\uA802\uA806\uA80B\uA825-\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31-\uAA32\uAA35-\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7-\uAAB8\uAABE-\uAABF\uAAC1\uAAEC-\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]/,
Kb=m([["\u0300","\u036f"],["\u0483","\u0487"],["\u0591","\u05bd"],"\u05bf",["\u05c1","\u05c2"],["\u05c4","\u05c5"],"\u05c7",["\u0610","\u061a"],["\u064b","\u065f"],"\u0670",["\u06d6","\u06dc"],["\u06df","\u06e4"],["\u06e7","\u06e8"],["\u06ea","\u06ed"],"\u0711",["\u0730","\u074a"],["\u07a6","\u07b0"],["\u07eb","\u07f3"],["\u0816","\u0819"],["\u081b","\u0823"],["\u0825","\u0827"],["\u0829","\u082d"],["\u0859","\u085b"],["\u08e3","\u0902"],"\u093a","\u093c",["\u0941","\u0948"],"\u094d",["\u0951","\u0957"],
["\u0962","\u0963"],"\u0981","\u09bc",["\u09c1","\u09c4"],"\u09cd",["\u09e2","\u09e3"],["\u0a01","\u0a02"],"\u0a3c",["\u0a41","\u0a42"],["\u0a47","\u0a48"],["\u0a4b","\u0a4d"],"\u0a51",["\u0a70","\u0a71"],"\u0a75",["\u0a81","\u0a82"],"\u0abc",["\u0ac1","\u0ac5"],["\u0ac7","\u0ac8"],"\u0acd",["\u0ae2","\u0ae3"],"\u0b01","\u0b3c","\u0b3f",["\u0b41","\u0b44"],"\u0b4d","\u0b56",["\u0b62","\u0b63"],"\u0b82","\u0bc0","\u0bcd","\u0c00",["\u0c3e","\u0c40"],["\u0c46","\u0c48"],["\u0c4a","\u0c4d"],["\u0c55",
"\u0c56"],["\u0c62","\u0c63"],"\u0c81","\u0cbc","\u0cbf","\u0cc6",["\u0ccc","\u0ccd"],["\u0ce2","\u0ce3"],"\u0d01",["\u0d41","\u0d44"],"\u0d4d",["\u0d62","\u0d63"],"\u0dca",["\u0dd2","\u0dd4"],"\u0dd6","\u0e31",["\u0e34","\u0e3a"],["\u0e47","\u0e4e"],"\u0eb1",["\u0eb4","\u0eb9"],["\u0ebb","\u0ebc"],["\u0ec8","\u0ecd"],["\u0f18","\u0f19"],"\u0f35","\u0f37","\u0f39",["\u0f71","\u0f7e"],["\u0f80","\u0f84"],["\u0f86","\u0f87"],["\u0f8d","\u0f97"],["\u0f99","\u0fbc"],"\u0fc6",["\u102d","\u1030"],["\u1032",
"\u1037"],["\u1039","\u103a"],["\u103d","\u103e"],["\u1058","\u1059"],["\u105e","\u1060"],["\u1071","\u1074"],"\u1082",["\u1085","\u1086"],"\u108d","\u109d",["\u135d","\u135f"],["\u1712","\u1714"],["\u1732","\u1734"],["\u1752","\u1753"],["\u1772","\u1773"],["\u17b4","\u17b5"],["\u17b7","\u17bd"],"\u17c6",["\u17c9","\u17d3"],"\u17dd",["\u180b","\u180d"],"\u18a9",["\u1920","\u1922"],["\u1927","\u1928"],"\u1932",["\u1939","\u193b"],["\u1a17","\u1a18"],"\u1a1b","\u1a56",["\u1a58","\u1a5e"],"\u1a60","\u1a62",
["\u1a65","\u1a6c"],["\u1a73","\u1a7c"],"\u1a7f",["\u1ab0","\u1abd"],["\u1b00","\u1b03"],"\u1b34",["\u1b36","\u1b3a"],"\u1b3c","\u1b42",["\u1b6b","\u1b73"],["\u1b80","\u1b81"],["\u1ba2","\u1ba5"],["\u1ba8","\u1ba9"],["\u1bab","\u1bad"],"\u1be6",["\u1be8","\u1be9"],"\u1bed",["\u1bef","\u1bf1"],["\u1c2c","\u1c33"],["\u1c36","\u1c37"],["\u1cd0","\u1cd2"],["\u1cd4","\u1ce0"],["\u1ce2","\u1ce8"],"\u1ced","\u1cf4",["\u1cf8","\u1cf9"],["\u1dc0","\u1df5"],["\u1dfc","\u1dff"],["\u20d0","\u20dc"],"\u20e1",
["\u20e5","\u20f0"],["\u2cef","\u2cf1"],"\u2d7f",["\u2de0","\u2dff"],["\u302a","\u302d"],["\u3099","\u309a"],"\ua66f",["\ua674","\ua67d"],["\ua69e","\ua69f"],["\ua6f0","\ua6f1"],"\ua802","\ua806","\ua80b",["\ua825","\ua826"],"\ua8c4",["\ua8e0","\ua8f1"],["\ua926","\ua92d"],["\ua947","\ua951"],["\ua980","\ua982"],"\ua9b3",["\ua9b6","\ua9b9"],"\ua9bc","\ua9e5",["\uaa29","\uaa2e"],["\uaa31","\uaa32"],["\uaa35","\uaa36"],"\uaa43","\uaa4c","\uaa7c","\uaab0",["\uaab2","\uaab4"],["\uaab7","\uaab8"],["\uaabe",
"\uaabf"],"\uaac1",["\uaaec","\uaaed"],"\uaaf6","\uabe5","\uabe8","\uabed","\ufb1e",["\ufe00","\ufe0f"],["\ufe20","\ufe2f"]],!1,!1),Nb=/^[0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]/,
Ob=m([["0","9"],["\u0660","\u0669"],["\u06f0","\u06f9"],["\u07c0","\u07c9"],["\u0966","\u096f"],["\u09e6","\u09ef"],["\u0a66","\u0a6f"],["\u0ae6","\u0aef"],["\u0b66","\u0b6f"],["\u0be6","\u0bef"],["\u0c66","\u0c6f"],["\u0ce6","\u0cef"],["\u0d66","\u0d6f"],["\u0de6","\u0def"],["\u0e50","\u0e59"],["\u0ed0","\u0ed9"],["\u0f20","\u0f29"],["\u1040","\u1049"],["\u1090","\u1099"],["\u17e0","\u17e9"],["\u1810","\u1819"],["\u1946","\u194f"],["\u19d0","\u19d9"],["\u1a80","\u1a89"],["\u1a90","\u1a99"],["\u1b50",
"\u1b59"],["\u1bb0","\u1bb9"],["\u1c40","\u1c49"],["\u1c50","\u1c59"],["\ua620","\ua629"],["\ua8d0","\ua8d9"],["\ua900","\ua909"],["\ua9d0","\ua9d9"],["\ua9f0","\ua9f9"],["\uaa50","\uaa59"],["\uabf0","\uabf9"],["\uff10","\uff19"]],!1,!1),Db=/^[\u16EE-\u16F0\u2160-\u2182\u2185-\u2188\u3007\u3021-\u3029\u3038-\u303A\uA6E6-\uA6EF]/,Eb=m([["\u16ee","\u16f0"],["\u2160","\u2182"],["\u2185","\u2188"],"\u3007",["\u3021","\u3029"],["\u3038","\u303a"],["\ua6e6","\ua6ef"]],!1,!1),Pb=/^[_\u203F-\u2040\u2054\uFE33-\uFE34\uFE4D-\uFE4F\uFF3F]/,
Qb=m(["_",["\u203f","\u2040"],"\u2054",["\ufe33","\ufe34"],["\ufe4d","\ufe4f"],"\uff3f"],!1,!1);m([" ","\u00a0","\u1680",["\u2000","\u200a"],"\u202f","\u205f","\u3000"],!1,!1);g("0x",!0);var c=0,n=0,y=[{line:1,column:1}],t=0,F=[],k=0,D;if("startRule"in q){if(!(q.startRule in ta))throw Error("Can't start parsing from rule \""+q.startRule+'".');ua=ta[q.startRule]}D=ua();if(D!==a&&c===f.length)return D;D!==a&&c<f.length&&h({type:"end"});throw function(a,c,e){return new u(u.buildMessage(a,c),a,c,e)}(F,
t<f.length?f.charAt(t):null,t<f.length?M(t,t+1):M(t,t));}}});

},{}],152:[function(require,module,exports){
var isArray = Array.isArray;

module.exports = exports = template;

function template() {
    var strings = isArray(arguments[0]) ? arguments[0] : [arguments[0]];
    var keys = Array.prototype.slice.call(arguments, 1);
    var result = strings.map(function(str, index) {
        var arg = index < keys.length ? stringify(keys[index]) : "";
        return str + arg;
    }).join("");
    return result;
}

function stringify(value) {
    if (isArray(value)) {
        return JSON.stringify(value.map(function(v) {
            return stringify(v);
        })).slice(1, -1);
    } else if (value === null) {
        return null;
    } else if (typeof value === "object") {
        var to = value.to;
        var from = value.from || 0;
        if (to === undefined) {
            return '' + from + '...' + (from + (value.length || 0));
        }
        return '' + from + '..' + (to || 0);
    } else {
        return value;
    }
}


},{}],153:[function(require,module,exports){
var template = require(152);
var parser = require(150);

module.exports = toPaths;

function toPaths() {
    return pathmapToPaths([], [], parser.parse(template.apply(null, arguments)));
}

function pathmapToPaths(paths, path, maps) {

    var leaf = [];
    var keys = maps.$keys;
    var keysLen = keys.length;
    var keysIndex = -1, key, len;

    while (++keysIndex < keysLen) {

        var rest = maps[keysIndex];
        var keyset = keys[keysIndex];

        if (!rest) {
            leaf.push(keyset);
        } else {
            pathmapToPaths(paths, path.concat([keyset]), rest);
        }
    }

    if (leaf.length === 1) {
        paths.push(path.concat(leaf));
    } else if (leaf.length > 1) {
        paths.push(path.concat([leaf]));
    }

    return paths;
}

},{"150":150,"152":152}],154:[function(require,module,exports){
var template = require(152);
var parser = require(151);

module.exports = toRoutes;

function toRoutes() {
    return pathmapToRoutes([], [], parser.parse(template.apply(null, arguments)));
}

function pathmapToRoutes(routes, route, maps) {

    var leaf = [];
    var keys = maps.$keys;
    var keysLen = keys.length;
    var keysIndex = -1, key, len;

    while (++keysIndex < keysLen) {

        var rest = maps[keysIndex];
        var keyset = keys[keysIndex];

        if (!rest) {
            leaf.push(keyset);
        } else {
            if (typeof keyset === 'object') {
                if ('to' in keyset || 'from' in keyset || 'length' in keyset) {
                    keyset = { type: 'integers', named: false };
                } else if (keyset.$keys) {
                    keyset = keyset.$keys[0];
                }
            }
            pathmapToRoutes(routes, route.concat([keyset]), rest);
        }
    }

    if (leaf.length === 1) {
        routes.push(route.concat(leaf));
    } else if (leaf.length > 1) {
        routes.push(route.concat([leaf]));
    }

    return routes;
}

},{"151":151,"152":152}],155:[function(require,module,exports){
var prefix = require(213);
var Keys = {
    ranges: prefix + 'ranges',
    integers: prefix + 'integers',
    keys: prefix + 'keys',
    named: prefix + 'named',
    name: prefix + 'name',
    match: prefix + 'match'
};

module.exports = Keys;

},{"213":213}],156:[function(require,module,exports){
var Precedence = {
    specific: 4,
    ranges: 2,
    integers: 2,
    keys: 1
};
module.exports = Precedence;


},{}],157:[function(require,module,exports){
var Keys = require(155);
var parseTree = require(187);
var matcher = require(170);
var JSONGraphError = require(164);
var MAX_REF_FOLLOW = 50;
var MAX_PATHS = 9000;

var Router = function(routes, options) {
    var opts = options || {};

    this._routes = routes;
    this._rst = parseTree(routes);
    this._matcher = matcher(this._rst);
    this._debug = opts.debug;
    this.maxRefFollow = opts.maxRefFollow || MAX_REF_FOLLOW;
    this.maxPaths = opts.maxPaths || MAX_PATHS;
};

Router.createClass = function(routes) {
    function C(options) {
        var opts = options || {};
        this._debug = opts.debug;
    }

    C.prototype = new Router(routes);
    C.prototype.constructor = C;

    return C;
};

Router.prototype = {
    /**
     * Performs the get algorithm on the router.
     * @param {PathSet[]} paths -
     * @returns {Observable.<JSONGraphEnvelope>}
     */
    get: require(189),

    /**
     * Takes in a jsonGraph and outputs a Observable.<jsonGraph>.  The set
     * method will use get until it evaluates the last key of the path inside
     * of paths.  At that point it will produce an intermediate structure that
     * matches the path and has the value that is found in the jsonGraph env.
     *
     * One of the requirements for interaction with a dataSource is that the
     * set message must be optimized to the best of the incoming sources
     * knowledge.
     *
     * @param {JSONGraphEnvelope} jsonGraph -
     * @returns {Observable.<JSONGraphEnvelope>}
     */
    set: require(191),

    /**
     * Invokes a function in the DataSource's JSONGraph object at the path
     * provided in the callPath argument.  If there are references that are
     * followed, a get will be performed to get to the call function.
     *
     * @param {Path} callPath -
     * @param {Array.<*>} args -
     * @param {Array.<PathSet>} refPaths -
     * @param {Array.<PathSet>} thisPaths -
     */
    call: require(188),

    /**
     * When a route misses on a call, get, or set the unhandledDataSource will
     * have a chance to fulfill that request.
     * @param {DataSource} dataSource -
     */
    routeUnhandledPathsTo: function routeUnhandledPathsTo(dataSource) {
        this._unhandled = dataSource;
    }
};

Router.ranges = Keys.ranges;
Router.integers = Keys.integers;
Router.keys = Keys.keys;
Router.JSONGraphError = JSONGraphError;
module.exports = Router;



},{"155":155,"164":164,"170":170,"187":187,"188":188,"189":189,"191":191}],158:[function(require,module,exports){
/**
 * To simplify this algorithm, the path must be a simple
 * path with no complex keys.
 *
 * Note: The path coming in must contain no references, as
 * all set data caches have no references.
 * @param {Object} cache
 * @param {PathSet} path
 */
module.exports = function getValue(cache, path) {
    return path.reduce(function(acc, key) {
        return acc[key];
    }, cache);
};

},{}],159:[function(require,module,exports){
var iterateKeySet = require(136).iterateKeySet;
var types = require(217);
var $ref = types.$ref;
var clone = require(205);
var cloneArray = require(206);
var catAndSlice = require(204);

/**
 * merges jsong into a seed
 */
module.exports = function jsongMerge(cache, jsongEnv) {
    var paths = jsongEnv.paths;
    var j = jsongEnv.jsonGraph;
    var references = [];
    var values = [];

    paths.forEach(function(p) {
        merge({
            cacheRoot: cache,
            messageRoot: j,
            references: references,
            values: values,
            requestedPath: [],
            requestIdx: -1,
            ignoreCount: 0
        },  cache, j, 0, p);
    });

    return {
        references: references,
        values: values
    };
};

function merge(config, cache, message, depth, path, fromParent, fromKey) {
    var cacheRoot = config.cacheRoot;
    var messageRoot = config.messageRoot;
    var requestedPath = config.requestedPath;
    var ignoreCount = config.ignoreCount;
    var typeOfMessage = typeof message;
    var messageType = message && message.$type;

    // The message at this point should always be defined.
    // Reached the end of the JSONG message path
    if (message === null || typeOfMessage !== 'object' || messageType) {
        fromParent[fromKey] = clone(message);

        // NOTE: If we have found a reference at our cloning position
        // and we have resolved our path then add the reference to
        // the unfulfilledRefernces.
        if (messageType === $ref) {
            var references = config.references;
            references.push({
                path: cloneArray(requestedPath),
                value: message.value
            });
        }

        // We are dealing with a value.  We need this for call
        // Call needs to report all of its values into the jsongCache
        // and paths.
        else {
            var values = config.values;
            values.push({
                path: cloneArray(requestedPath),
                value: messageType ? message.value : message
            });
        }

        return;
    }

    var requestIdx = config.requestIdx;
    var updateRequestedPath = ignoreCount <= depth;

    if (updateRequestedPath) {
        requestIdx = ++config.requestIdx;
    }

    var outerKey = path[depth];
    var iteratorNote = {};
    var isBranchKey = depth < path.length - 1;
    var key = iterateKeySet(outerKey, iteratorNote);

    // We always attempt this as a loop.  If the memo exists then
    // we assume that the permutation is needed.
    do {

        // If the cache exists and we are not at our height, then
        // just follow cache, else attempt to follow message.
        var cacheRes = cache[key];
        var messageRes = message[key];

        // We no longer materialize inside of jsonGraph merge.  Either the
        // client should specify all of the paths
        if (messageRes !== undefined) {

            var nextPath = path;
            var nextDepth = depth + 1;
            if (updateRequestedPath) {
                requestedPath[requestIdx] = key;
            }

            // We do not continue with this branch since the cache
            if (cacheRes === undefined) {
                cacheRes = cache[key] = {};
            }

            var nextIgnoreCount = ignoreCount;

            // TODO: Potential performance gain since we know that
            // references are always pathSets of 1, they can be evaluated
            // iteratively.

            messageType = messageRes && messageRes.$type;
            // There is only a need to consider message references since the
            // merge is only for the path that is provided.
            if (isBranchKey && messageType === $ref) {

                nextDepth = 0;
                nextPath = catAndSlice(messageRes.value, path, depth + 1);
                cache[key] = clone(messageRes);

                // Reset position in message and cache.
                nextIgnoreCount = messageRes.value.length;
                messageRes = messageRoot;
                cacheRes = cacheRoot;
            }

            // move forward down the path progression.
            config.ignoreCount = nextIgnoreCount;
            merge(config, cacheRes, messageRes,
                  nextDepth, nextPath, cache, key);
            config.ignoreCount = ignoreCount;
        }

        if (updateRequestedPath) {
            requestedPath.length = requestIdx;
        }

        // Are we done with the loop?
        key = iterateKeySet(outerKey, iteratorNote);
    } while (!iteratorNote.done);

    if (updateRequestedPath) {
        requestIdx = --config.requestIdx;
    }
}

},{"136":136,"204":204,"205":205,"206":206,"217":217}],160:[function(require,module,exports){
var iterateKeySet = require(136).iterateKeySet;
var catAndSlice = require(204);
var $types = require(217);
var $ref = $types.$ref;
var errors = require(166);
// var followReference = require('./followReference');

/**
 * The fastest possible optimize of paths.
 *
 * What it does:
 * - Any atom short-circuit / found value will be removed from the path.
 * - All paths will be exploded which means that collapse will need to be
 *   ran afterwords.
 * - Any missing path will be optimized as much as possible.
 */
module.exports = function optimizePathSets(cache, paths, maxRefFollow) {
    var optimized = [];
    paths.forEach(function(p) {
        optimizePathSet(cache, cache, p, 0, optimized, [], maxRefFollow, 0);
    });

    return optimized;
};


/**
 * optimizes one pathSet at a time.
 */
function optimizePathSet(cache, cacheRoot, pathSet,
                         depth, out, optimizedPath, maxRefFollow, referenceCount) {

    // at missing, report optimized path.
    if (cache === undefined) {
        out[out.length] = catAndSlice(optimizedPath, pathSet, depth);
        return;
    }

    var typeofCache = cache === null ? 'undefined' : typeof cache;
    var type = typeofCache !== 'object' ? undefined : cache.$type;

    // all other sentinels are short circuited.
    // Or we found a primitive (which includes null)
    if (typeofCache !== 'object' || (type && type !== $ref)) {
        return;
    }

    // If the reference is the last item in the path then do not
    // continue to search it.
    if (type === $ref && depth === pathSet.length) {
        return;
    }

    var keySet = pathSet[depth];
    var nextDepth = depth + 1;
    var isBranchKey = nextDepth < pathSet.length;
    var iteratorNote = {};
    var key, next, nextOptimized;
    var optimizedPathLength = optimizedPath.length;

    key = iterateKeySet(keySet, iteratorNote);
    do {
        next = cache[key];
        type = next && next.$type;

        if (key !== null) {
            optimizedPath[optimizedPathLength] = key;
        }

        if (isBranchKey && type === $ref) {

            if (referenceCount > maxRefFollow) {
                throw new Error(errors.circularReference);
            }

            nextOptimized = [];
            var refPath = catAndSlice(next.value, pathSet, nextDepth);
            optimizePathSet(cacheRoot, cacheRoot, refPath, 0,
                            out, nextOptimized, maxRefFollow, referenceCount+1);
            optimizedPath.length = optimizedPathLength;
        } else {
            // if (isBranchKey && type === $ref) {
            //     var refResults =
            //         followReference(cacheRoot, next.value, maxRefFollow);
            //     next = refResults[0];

            //     // `followReference` clones the refPath before returning it.
            //     nextOptimized = refResults[1];
            // } else {
                nextOptimized = optimizedPath;
            // }

            optimizePathSet(next, cacheRoot, pathSet, nextDepth,
                            out, nextOptimized, maxRefFollow, referenceCount);
            optimizedPath.length = optimizedPathLength;
        }

        if (!iteratorNote.done) {
            key = iterateKeySet(keySet, iteratorNote);
        }
    } while (!iteratorNote.done);
}


},{"136":136,"166":166,"204":204,"217":217}],161:[function(require,module,exports){
var clone = require(205);
var types = require(217);
var $ref = types.$ref;
var iterateKeySet = require(136).iterateKeySet;

/**
 * merges pathValue into a cache
 */
module.exports = function pathValueMerge(cache, pathValue) {
    var refs = [];
    var values = [];
    var invalidations = [];
    var isValueType = true;

    var path = pathValue.path;
    var value = pathValue.value;
    var type = value && value.$type;

    // The pathValue invalidation shape.
    if (pathValue.invalidated === true) {
        invalidations.push({path: path});
        isValueType = false;
    }

    // References and reference sets. Needed for evaluating suffixes in all
    // three types, get, call and set.
    else if (type === $ref) {
        refs.push({
            path: path,
            value: value.value
        });
    }

    // Values.  Needed for reporting for call.
    else {
        values.push(pathValue);
    }

    // If the type of pathValue is a valueType (reference or value) then merge
    // it into the jsonGraph cache.
    if (isValueType) {
        innerPathValueMerge(cache, pathValue);
    }

    return {
        references: refs,
        values: values,
        invalidations: invalidations
    };
};

function innerPathValueMerge(cache, pathValue) {
    var path = pathValue.path;
    var curr = cache;
    var next, key, cloned, outerKey, iteratorNote;
    var i, len;

    for (i = 0, len = path.length - 1; i < len; ++i) {
        outerKey = path[i];

        // Setup the memo and the key.
        if (outerKey && typeof outerKey === 'object') {
            iteratorNote = {};
            key = iterateKeySet(outerKey, iteratorNote);
        } else {
            key = outerKey;
            iteratorNote = false;
        }

        do {
            next = curr[key];

            if (!next) {
                next = curr[key] = {};
            }

            if (iteratorNote) {
                innerPathValueMerge(
                    next, {
                        path: path.slice(i + 1),
                        value: pathValue.value
                    });

                if (!iteratorNote.done) {
                    key = iterateKeySet(outerKey, iteratorNote);
                }
            }

            else {
                curr = next;
            }
        } while (iteratorNote && !iteratorNote.done);

        // All memoized paths need to be stopped to avoid
        // extra key insertions.
        if (iteratorNote) {
            return;
        }
    }


    // TODO: This clearly needs a re-write.  I am just unsure of how i want
    // this to look.  Plus i want to measure performance.
    outerKey = path[i];

    iteratorNote = {};
    key = iterateKeySet(outerKey, iteratorNote);

    do {

        cloned = clone(pathValue.value);
        curr[key] = cloned;

        if (!iteratorNote.done) {
            key = iterateKeySet(outerKey, iteratorNote);
        }
    } while (!iteratorNote.done);
}

},{"136":136,"205":205,"217":217}],162:[function(require,module,exports){
var MESSAGE = 'function does not exist.';
var CallNotFoundError = module.exports = function CallNotFoundError() {
    this.message = MESSAGE;
    this.stack = (new Error()).stack;
};

CallNotFoundError.prototype = new Error();


},{}],163:[function(require,module,exports){
var MESSAGE = 'Any JSONG-Graph returned from call must have paths.';
var CallRequiresPathsError = function CallRequiresPathsError() {
    this.message = MESSAGE;
    this.stack = (new Error()).stack;
};

CallRequiresPathsError.prototype = new Error();

module.exports = CallRequiresPathsError;

},{}],164:[function(require,module,exports){
var JSONGraphError = module.exports = function JSONGraphError(typeValue) {
    this.typeValue = typeValue;
};
JSONGraphError.prototype = new Error();


},{}],165:[function(require,module,exports){
var MESSAGE = "Maximum number of paths exceeded.";

var MaxPathsExceededError = function MaxPathsExceededError(message) {
    this.message = message === undefined ? MESSAGE : message;
    this.stack = (new Error()).stack;
};

MaxPathsExceededError.prototype = new Error();
MaxPathsExceededError.prototype.throwToNext = true;

module.exports = MaxPathsExceededError;

},{}],166:[function(require,module,exports){
/*eslint-disable*/
module.exports = {
    innerReferences: 'References with inner references are not allowed.',
    unknown: 'Unknown Error',
    routeWithSamePrecedence: 'Two routes cannot have the same precedence or path.',
    circularReference: 'There appears to be a circular reference, maximum reference following exceeded.'
};

},{}],167:[function(require,module,exports){
var isArray = Array.isArray;
module.exports = function convertPathKeyTo(onRange, onKey) {
    return function converter(keySet) {
        var isKeySet = typeof keySet === 'object';
        var out = [];

        // The keySet we determine what type is this keyset.
        if (isKeySet) {
            if (isArray(keySet)) {
                var reducer = null;
                keySet.forEach(function(key) {
                    if (typeof key === 'object') {
                        reducer = onRange(out, key, reducer);
                    }
                    else {
                        reducer = onKey(out, key, reducer);
                    }
                });
            }

            // What passed in is a range.
            else {
                onRange(out, keySet);
            }
        }

        // simple value for keyset.
        else {
            onKey(out, keySet);
        }

        return out;
    };
};

},{}],168:[function(require,module,exports){
var convertPathKeyTo = require(167);
var isNumber = require(209);
var rangeToArray = require(179);

function onRange(out, range) {
    var len = out.length - 1;
    rangeToArray(range).forEach(function(el) {
        out[++len] = el;
    });
}

function onKey(out, key) {
    if (isNumber(key)) {
        out[out.length] = key;
    }
}

/**
 * will attempt to get integers from the key
 * or keySet provided. assumes everything passed in is an integer
 * or range of integers.
 */
module.exports = convertPathKeyTo(onRange, onKey);

},{"167":167,"179":179,"209":209}],169:[function(require,module,exports){
var convertPathKeyTo = require(167);
var rangeToArray = require(179);

function onKey(out, key) {
    out[out.length] = key;
}

function onRange(out, range) {
    var len = out.length - 1;
    rangeToArray(range).forEach(function(el) {
        out[++len] = el;
    });
}

/**
 * will attempt to get integers from the key
 * or keySet provided. assumes everything passed in is an integer
 * or range of integers.
 */
module.exports = convertPathKeyTo(onRange, onKey);


},{"167":167,"179":179}],170:[function(require,module,exports){
var Keys = require(155);
var Precedence = require(156);
var cloneArray = require(206);
var specificMatcher = require(175);
var pluckIntegers = require(174);
var pathUtils = require(136);
var collapse = pathUtils.collapse;
var isRoutedToken = require(212);
var CallNotFoundError = require(162);

var intTypes = [{
        type: Keys.ranges,
        precedence: Precedence.ranges
    }, {
        type: Keys.integers,
        precedence: Precedence.integers
    }];
var keyTypes = [{
        type: Keys.keys,
        precedence: Precedence.keys
    }];
var allTypes = intTypes.concat(keyTypes);
var get = 'get';
var set = 'set';
var call = 'call';

/**
 * Creates a custom matching function for the match tree.
 * @param Object rst The routed syntax tree
 * @param String method the method to call at the end of the path.
 * @return {matched: Array.<Match>, missingPaths: Array.<Array>}
 */
module.exports = function matcher(rst) {

    /**
     * This is where the matching is done.  Will recursively
     * match the paths until it has found all the matchable
     * functions.
     * @param {[]} paths
     */
    return function innerMatcher(method, paths) {
        var matched = [];
        var missing = [];
        match(rst, paths, method, matched, missing);

        // We are at the end of the path but there is no match and its a
        // call.  Therefore we are going to throw an informative error.
        if (method === call && matched.length === 0) {
            var err = new CallNotFoundError();
            err.throwToNext = true;

            throw err;
        }

        // Reduce into groups multiple matched routes into route sets where
        // each match matches the same route endpoint.  From here we can reduce
        // the matched paths into the most optimal pathSet with collapse.
        var reducedMatched = matched.reduce(function(acc, matchedRoute) {
            if (!acc[matchedRoute.id]) {
                acc[matchedRoute.id] = [];
            }
            acc[matchedRoute.id].push(matchedRoute);

            return acc;
        }, {});

        var collapsedMatched = [];

        // For every set of matched routes, collapse and reduce its matched set
        // down to the minimal amount of collapsed sets.
        Object.
            keys(reducedMatched).
            forEach(function(k) {
                var reducedMatch = reducedMatched[k];

                // If the reduced match is of length one then there is no
                // need to perform collapsing, as there is nothing to collapse
                // over.
                if (reducedMatch.length === 1) {
                    collapsedMatched.push(reducedMatch[0]);
                    return;
                }

                // Since there are more than 1 routes, we need to see if
                // they can collapse and alter the amount of arrays.
                var collapsedResults =
                        collapse(
                            reducedMatch.
                                map(function(x) {
                                    return x.requested;
                                }));

                // For every collapsed result we use the previously match result
                // and update its requested and virtual path.  Then add that
                // match to the collapsedMatched set.
                collapsedResults.forEach(function(path, i) {
                    var collapsedMatch = reducedMatch[i];
                    var reducedVirtualPath = collapsedMatch.virtual;
                    path.forEach(function(atom, index) {

                        // If its not a routed atom then wholesale replace
                        if (!isRoutedToken(reducedVirtualPath[index])) {
                            reducedVirtualPath[index] = atom;
                        }
                    });
                    collapsedMatch.requested = path;
                    collapsedMatched.push(reducedMatch[i]);
                });
            });
        return collapsedMatched;
    };
};

function match(
        curr, path, method, matchedFunctions,
        missingPaths, depth, requested, virtual, precedence) {

    // Nothing left to match
    if (!curr) {
        return;
    }

    /* eslint-disable no-param-reassign */
    depth = depth || 0;
    requested = requested || [];
    virtual = virtual || [];
    precedence = precedence || [];
    matchedFunctions = matchedFunctions || [];
    /* eslint-disable no-param-reassign */

    // At this point in the traversal we have hit a matching function.
    // Its time to terminate.
    // Get: simple method matching
    // Set/Call: The method is unique.  If the path is not complete,
    // meaning the depth is equivalent to the length,
    // then we match a 'get' method, else we match a 'set' or 'call' method.
    var atEndOfPath = path.length === depth;
    var isSet = method === set;
    var isCall = method === call;
    var methodToUse = method;
    if ((isCall || isSet) && !atEndOfPath) {
        methodToUse = get;
    }

    // Stores the matched result if found along or at the end of
    // the path.  If we are doing a set and there is no set handler
    // but there is a get handler, then we need to use the get
    // handler.  This is so that the current value that is in the
    // clients cache does not get materialized away.
    var currentMatch = curr[Keys.match];

    // From https://github.com/Netflix/falcor-router/issues/76
    // Set: When there is no set hander then we should default to running
    // the get handler so that we do not destroy the client local values.
    if (currentMatch && isSet && !currentMatch[set]) {
        methodToUse = get;
    }

    // Check to see if we have
    if (currentMatch && currentMatch[methodToUse]) {
        matchedFunctions[matchedFunctions.length] = {

            // Used for collapsing paths that use routes with multiple
            // string indexers.
            id: currentMatch[methodToUse + 'Id'],
            requested: cloneArray(requested),

            action: currentMatch[methodToUse],
            authorize: currentMatch.authorize,
            virtual: cloneArray(virtual),
            precedence: +(precedence.join('')),
            suffix: path.slice(depth),
            isSet: atEndOfPath && isSet,
            isCall: atEndOfPath && isCall
        };
    }

    // If the depth has reached the end then we need to stop recursing.  This
    // can cause odd side effects with matching against {keys} as the last
    // argument when a path has been exhausted (undefined is still a key value).
    //
    // Example:
    // route1: [{keys}]
    // route2: [{keys}][{keys}]
    //
    // path: ['('].
    //
    // This will match route1 and 2 since we do not bail out on length and there
    // is a {keys} matcher which will match "undefined" value.
    if (depth === path.length) {
        return;
    }

    var keySet = path[depth];
    var i, len, key, next;

    // -------------------------------------------
    // Specific key matcher.
    // -------------------------------------------
    var specificKeys = specificMatcher(keySet, curr);
    for (i = 0, len = specificKeys.length; i < len; ++i) {
        key = specificKeys[i];
        virtual[depth] = key;
        requested[depth] = key;
        precedence[depth] = Precedence.specific;

        // Its time to recurse
        match(
            curr[specificKeys[i]],
            path, method, matchedFunctions,
            missingPaths, depth + 1,
            requested, virtual, precedence);

        // Removes the virtual, requested, and precedence info
        virtual.length = depth;
        requested.length = depth;
        precedence.length = depth;
    }

    var ints = pluckIntegers(keySet);
    var keys = keySet;
    var intsLength = ints.length;

    // -------------------------------------------
    // ints, ranges, and keys matcher.
    // -------------------------------------------
    allTypes.
        filter(function(typeAndPrecedence) {
            var type = typeAndPrecedence.type;
            // one extra move required for int types
            if (type === Keys.integers || type === Keys.ranges) {
                return curr[type] && intsLength;
            }
            return curr[type];
        }).
        forEach(function(typeAndPrecedence) {
            var type = typeAndPrecedence.type;
            var prec = typeAndPrecedence.precedence;
            next = curr[type];

            virtual[depth] = {
                type: type,
                named: next[Keys.named],
                name: next[Keys.name]
            };

            // The requested set of info needs to be set either
            // as ints, if int matchers or keys
            if (type === Keys.integers || type === Keys.ranges) {
                requested[depth] = ints;
            } else {
                requested[depth] = keys;
            }

            precedence[depth] = prec;

            // Continue the matching algo.
            match(
                next,
                path, method, matchedFunctions,
                missingPaths, depth + 1,
                requested, virtual, precedence);

            // removes the added keys
            virtual.length = depth;
            requested.length = depth;
            precedence.length = depth;
        });
}

},{"136":136,"155":155,"156":156,"162":162,"174":174,"175":175,"206":206,"212":212}],171:[function(require,module,exports){
var Keys = require(155);
var isArray = Array.isArray;
var isRoutedToken = require(212);
var isRange = require(211);

/**
 * Takes a matched and virtual atom and validates that they have an
 * intersection.
 */
module.exports = function hasAtomIntersection(matchedAtom, virtualAtom) {
    var virtualIsRoutedToken = isRoutedToken(virtualAtom);
    var isKeys = virtualIsRoutedToken && virtualAtom.type === Keys.keys;
    var matched = false;
    var i, len;

    // To simplify the algorithm we do not allow matched atom to be an
    // array.  This makes the intersection test very simple.
    if (isArray(matchedAtom)) {
        for (i = 0, len = matchedAtom.length; i < len && !matched; ++i) {
            matched = hasAtomIntersection(matchedAtom[i], virtualAtom);
        }
    }

    // the == is very intentional here with all the use cases review.
    else if (doubleEquals(matchedAtom, virtualAtom)) {
        matched = true;
    }

    // Keys match everything.
    else if (isKeys) {
        matched = true;
    }

    // The routed token is for integers at this point.
    else if (virtualIsRoutedToken) {
        matched = isNumber(matchedAtom) || isRange(matchedAtom);
    }

    // is virtual an array
    // Go through each of the array elements and compare against matched item.
    else if (isArray(virtualAtom)) {
        for (i = 0, len = virtualAtom.length; i < len && !matched; ++i) {
            matched = hasAtomIntersection(matchedAtom, virtualAtom[i]);
        }
    }

    // is virtual a range (last option)
    else if (virtualAtom && typeof virtualAtom === 'object') {

        var from = virtualAtom.from || 0;
        var length = (doubleEquals(virtualAtom.to, null) ?
            virtualAtom.length :
            (virtualAtom.to - virtualAtom.from) + 1) || 0;

        if (!isNaN(from)) {
            if (isNumber(matchedAtom)) {
                matched = matchedAtom >= from && matchedAtom < from + length;
            } else if (isRange(matchedAtom)) {

                var matchFrom = matchedAtom.from || 0;
                var matchLength = (doubleEquals(matchedAtom.to, null) ?
                    matchedAtom.length :
                    (matchedAtom.to - matchedAtom.from) + 1) || 0;

                matched = (matchFrom >= from) && (matchLength <= length);
            }
        }
    }

    return matched;
};

//
function isNumber(x) {
    return String(Number(x)) === String(x);
}

/**
 * This was very intentional ==.  The reason is that '1' must equal 1.
 * {} of anysort are always false and array ['one'] == 'one' but that is
 * fine because i would have to go through the array anyways at the
 * last elseif check.
 */
function doubleEquals(a, b) {
    return a == b; // eslint-disable-line eqeqeq
}

},{"155":155,"211":211,"212":212}],172:[function(require,module,exports){
var hasAtomIntersection = require(171);

/**
 * Checks to see if there is an intersection between the matched and
 * virtual paths.
 */
module.exports = function hasIntersection(matchedPath, virtualPath) {
    var intersection = true;

    // cycles through the atoms and ensure each one has an intersection.
    // only use the virtual path because it can be shorter than the full
    // matched path (since it includes suffix).
    for (var i = 0, len = virtualPath.length; i < len && intersection; ++i) {
        intersection = hasAtomIntersection(matchedPath[i], virtualPath[i]);
    }

    return intersection;
};

},{"171":171}],173:[function(require,module,exports){
/**
 * @param {PathSet} path - A simple path
 * @param {Object} tree - The tree should have `null` leaves to denote a
 * leaf node.
 */
module.exports = function hasIntersectionWithTree(path, tree) {
    return _hasIntersection(path, tree, 0);
};

function _hasIntersection(path, node, depth) {

    // Exit / base condition.  We have reached the
    // length of our path and we are at a node of null.
    if (depth === path.length && node === null) {
        return true;
    }

    var key = path[depth];
    var next = node[key];

    // If its not undefined, then its a branch.
    if (node !== undefined) {
        return _hasIntersection(path, next, depth + 1);
    }

    return false;
}

},{}],174:[function(require,module,exports){
var isArray = Array.isArray;
/**
 * plucks any integers from the path key.  Makes no effort
 * to convert the key into any specific format.
 */
module.exports = function pluckIntegers(keySet) {
    var ints = [];

    if (typeof keySet === 'object') {
        if (isArray(keySet)) {
            keySet.forEach(function(key) {
                // Range case
                if (typeof key === 'object') {
                    ints[ints.length] = key;
                }

                else if (!isNaN(+key)) {
                    ints[ints.length] = +key;
                }
            });
        }
        // Range case
        else {
            ints[ints.length] = keySet;
        }
    }

    else if (!isNaN(+keySet)) {
        ints[ints.length] = +keySet;
    }

    return ints;
};

},{}],175:[function(require,module,exports){
var iterateKeySet = require(136).iterateKeySet;

module.exports = function specificMatcher(keySet, currentNode) {
    // --------------------------------------
    // Specific key
    // --------------------------------------
    var iteratorNote = {};
    var nexts = [];

    var key = iterateKeySet(keySet, iteratorNote);
    do {

        if (currentNode[key]) {
            nexts[nexts.length] = key;
        }

        if (!iteratorNote.done) {
            key = iterateKeySet(keySet, iteratorNote);
        }
    } while (!iteratorNote.done);

    return nexts;
};

},{"136":136}],176:[function(require,module,exports){
var convertPathKeyTo = require(167);
var isNumber = require(209);

function onRange(out, range) {
    out[out.length] = range;
}

/**
 * @param {Number|String} key must be a number
 */
function keyReduce(out, key, range) {
    if (!isNumber(key)) {
        return range;
    }

    /* eslint-disable no-param-reassign */
    key = +key;
    if (range) {
        if (key - 1 === range.to) {
            range.to = key;
        }

        else if (key + 1 === range.from) {
            range.from = key;
        }

        else {
            range = null;
        }
    }

    if (!range) {
        range = {to: key, from: key};
        out[out.length] = range;
    }
    /* eslint-enable no-param-reassign */

    return range;
}

module.exports = convertPathKeyTo(onRange, keyReduce);

},{"167":167,"209":209}],177:[function(require,module,exports){
/**
 * takes in a range and normalizes it to have a to / from
 */
module.exports = function normalize(range) {
    var from = range.from || 0;
    var to;
    if (typeof range.to === 'number') {
        to = range.to;
    } else {
        to = from + range.length - 1;
    }

    return {to: to, from: from};
};

},{}],178:[function(require,module,exports){
var normalize = require(177);

/**
 * warning:  This mutates the array of arrays.
 * It only converts the ranges to properly normalized ranges
 * so the rest of the algos do not have to consider it.
 */
module.exports = function normalizePathSets(path) {
    path.forEach(function(key, i) {
        // the algo becomes very simple if done recursively.  If
        // speed is needed, this is an easy optimization to make.
        if (Array.isArray(key)) {
            normalizePathSets(key);
        }

        else if (key && typeof key === 'object') {
            path[i] = normalize(path[i]);
        }
    });
    return path;
};

},{"177":177}],179:[function(require,module,exports){
module.exports = function onRange(range) {
    var out = [];
    var i = range.from;
    var to = range.to;
    var outIdx = out.length;
    for (; i <= to; ++i, ++outIdx) {
        out[outIdx] = i;
    }

    return out;
};

},{}],180:[function(require,module,exports){
var isArray = Array.isArray;
var stripFromArray = require(181);
var stripFromRange = require(182);

/**
 *  Takes a virtual atom and the matched atom and returns an
 * array of results that is relative complement with matchedAtom
 * as the rhs.  I believe the proper set syntax is virutalAtom \ matchedAtom.
 *
 * 1) An assumption made is that the matched atom and virtual atom have
 * an intersection.  This makes the algorithm easier since if the matched
 * atom is a primitive and the virtual atom is an object
 * then there is no relative complement to create.  This also means if
 * the direct equality test fails and matchedAtom is not an object
 * then virtualAtom is an object.  The inverse applies.
 *
 *
 * @param {String|Number|Array|Object} matchedAtom
 * @param {String|Number|Array|Object} virtualAtom
 * @return {Array} the tuple of what was matched and the relative complenment.
 */
module.exports = function strip(matchedAtom, virtualAtom) {
    var relativeComplement = [];
    var matchedResults;
    var typeOfMatched = typeof matchedAtom;
    var isArrayMatched = isArray(matchedAtom);
    var isObjectMatched = typeOfMatched === 'object';

    // Lets assume they are not objects  This covers the
    // string / number cases.
    if (matchedAtom === virtualAtom ||
       String(matchedAtom) === String(virtualAtom)) {

        matchedResults = [matchedAtom];
    }

    // See function comment 1)
    else if (!isObjectMatched) {
        matchedResults = [matchedAtom];
    }

    // Its a complex object set potentially.  Let the
    // subroutines handle the cases.
    else {
        var results;

        // The matchedAtom needs to reduced to everything that is not in
        // the virtualAtom.
        if (isArrayMatched) {
            results = stripFromArray(virtualAtom, matchedAtom);
            matchedResults = results[0];
            relativeComplement = results[1];
        } else {
            results = stripFromRange(virtualAtom, matchedAtom);
            matchedResults = results[0];
            relativeComplement = results[1];
        }
    }

    if (matchedResults.length === 1) {
        matchedResults = matchedResults[0];
    }

    return [matchedResults, relativeComplement];
};

},{"181":181,"182":182}],181:[function(require,module,exports){
var stripFromRange = require(182);
var Keys = require(155);
var isArray = Array.isArray;

/**
 * Takes a string, number, or RoutedToken and removes it from
 * the array.  The results are the relative complement of what
 * remains in the array.
 *
 * Don't forget: There was an intersection test performed but
 * since we recurse over arrays, we will get elements that do
 * not intersect.
 *
 * Another one is if its a routed token and a ranged array then
 * no work needs to be done as integers, ranges, and keys match
 * that token set.
 *
 * One more note.  When toStrip is an array, we simply recurse
 * over each key.  Else it requires a lot more logic.
 *
 * @param {Array|String|Number|RoutedToken} toStrip
 * @param {Array} array
 * @return {Array} the relative complement.
 */
module.exports = function stripFromArray(toStrip, array) {
    var complement;
    var matches = [];
    var typeToStrip = typeof toStrip;
    var isRangedArray = typeof array[0] === 'object';
    var isNumber = typeToStrip === 'number';
    var isString = typeToStrip === 'string';
    var isRoutedToken = !isNumber && !isString;
    var routeType = isRoutedToken && toStrip.type || false;
    var isKeys = routeType === Keys.keys;
    var toStripIsArray = isArray(toStrip);

    // The early break case.  If its a key, then there is never a
    // relative complement.
    if (isKeys) {
        complement = [];
        matches = array;
    }

    // Recurse over all the keys of the array.
    else if (toStripIsArray) {
        var currentArray = array;
        toStrip.forEach(function(atom) {
            var results = stripFromArray(atom, currentArray);
            if (results[0] !== undefined) { // eslint-disable-line no-undefined
                matches = matches.concat(results[0]);
            }
            currentArray = results[1];
        });
        complement = currentArray;
    }

    // The simple case, remove only the matching element from array.
    else if (!isRangedArray && !isRoutedToken) {
        matches = [toStrip];
        complement = array.filter(function(x) {
            return toStrip !== x;
        });
    }

    // 1: from comments above
    else if (isRangedArray && !isRoutedToken) {
        complement = array.reduce(function(comp, range) {
            var results = stripFromRange(toStrip, range);
            if (results[0] !== undefined) { // eslint-disable-line no-undefined
                matches = matches.concat(results[0]);
            }
            return comp.concat(results[1]);
        }, []);
    }

    // Strips elements based on routed token type.
    // We already matched keys above, so we only need to strip numbers.
    else if (!isRangedArray && isRoutedToken) {
        complement = array.filter(function(el) {
            var type = typeof el;
            if (type === 'number') {
                matches[matches.length] = el;
                return false;
            }
            return true;
        });
    }

    // The final complement is rangedArray with a routedToken,
    // relative complement is always empty.
    else {
        complement = [];
        matches = array;
    }

    return [matches, complement];
};

},{"155":155,"182":182}],182:[function(require,module,exports){
var isArray = Array.isArray;
var rangeToArray = require(179);
var isNumber = require(209);
/**
 *  Takes the first argument, toStrip, and strips it from
 * the range.  The output is an array of ranges that represents
 * the remaining ranges (relative complement)
 *
 * One note.  When toStrip is an array, we simply recurse
 * over each key.  Else it requires a lot more logic.
 *
 * Since we recurse array keys we are not guaranteed that each strip
 * item coming in is a string integer.  That is why we are doing an isNaN
 * check. consider: {from: 0, to: 1} and [0, 'one'] intersect at 0, but will
 * get 'one' fed into stripFromRange.
 *
 * @param {Array|String|Number|Object} argToStrip can be a string, number,
 * or a routed token.  Cannot be a range itself.
 * @param {Range} range
 * @return {Array.<Range>} The relative complement.
 */
module.exports = function stripFromRange(argToStrip, range) {
    var ranges = [];
    var matches = [];
    var toStrip = argToStrip;
    // TODO: More than likely a bug around numbers and stripping
    var toStripIsNumber = isNumber(toStrip);
    if (toStripIsNumber) {
        toStrip = +toStrip;
    }

    // Strip out NaNs
    if (!toStripIsNumber && typeof toStrip === 'string') {
        ranges = [range];
    }

    else if (isArray(toStrip)) {
        var currenRanges = [range];
        toStrip.forEach(function(atom) {
            var nextRanges = [];
            currenRanges.forEach(function(currentRename) {
                var matchAndComplement = stripFromRange(atom, currentRename);
                if (matchAndComplement[0] !== undefined) {
                    matches = matches.concat(matchAndComplement[0]);
                }

                nextRanges = nextRanges.concat(matchAndComplement[1]);
            });
            currenRanges = nextRanges;
        });

        ranges = currenRanges;
    }

    // The simple case, its just a number.
    else if (toStripIsNumber) {

        if (range.from < toStrip && toStrip < range.to) {
            ranges[0] = {
                from: range.from,
                to: toStrip - 1
            };
            ranges[1] = {
                from: toStrip + 1,
                to: range.to
            };
            matches = [toStrip];
        }

        // In case its a 0 length array.
        // Even though this assignment is redundant, its point is
        // to capture the intention.
        else if (range.from === toStrip && range.to === toStrip) {
            ranges = [];
            matches = [toStrip];
        }

        else if (range.from === toStrip) {
            ranges[0] = {
                from: toStrip + 1,
                to: range.to
            };
            matches = [toStrip];
        }

        else if (range.to === toStrip) {
            ranges[0] = {
                from: range.from,
                to: toStrip - 1
            };
            matches = [toStrip];
        }

        // return the range if no intersection.
        else {
            ranges = [range];
        }
    }

    // Its a routed token.  Everything is matched.
    else {
        matches = rangeToArray(range);
    }

    // If this is a routedToken (Object) then it will match the entire
    // range since its integers, keys, and ranges.
    return [matches, ranges];
};

},{"179":179,"209":209}],183:[function(require,module,exports){
var strip = require(180);
var catAndSlice = require(204);

/**
 * Takes in the matched path and virtual path and creates the
 * set of paths that represent the virtualPath being stripped
 * from the matchedPath.
 *
 * @example
 * Terms:
 * * Relative Complement: Of sets A and B the relative complement of A in B is
 * the parts of B that A do not contain.  In our example its virtualPath (A) in
 * matchedPath (B).
 *
 * Example:
 * matchedInput = [[A, D], [B, E], [C, F]]
 * virtualIntput = [A, Keys, C]
 *
 * This will produce 2 arrays from the matched operation.
 * [
 *   [D, [B, E], [C, F]],
 *   [A, [B, E], [F]]
 * ]
 *
 *
 * All the complexity of this function is hidden away in strip and its inner
 * stripping functions.
 * @param {PathSet} matchedPath
 * @param {PathSet} virtualPath
 */
module.exports = function stripPath(matchedPath, virtualPath) {
    var relativeComplement = [];
    var exactMatch = [];
    var current = [];

    // Always use virtual path because it can be shorter.
    for (var i = 0, len = virtualPath.length; i < len; ++i) {
        var matchedAtom = matchedPath[i];
        var virtualAtom = virtualPath[i];
        var stripResults = strip(matchedAtom, virtualAtom);
        var innerMatch = stripResults[0];
        var innerComplement = stripResults[1];
        var hasComplement = innerComplement.length > 0;

        // using the algorithm partially described above we need to split and
        // combine output depending on what comes out of the split function.
        // 1.  If there is no relative complement do no copying / slicing.
        // 2.  If there is both the catAndslice.

        if (hasComplement) {
            var flattendIC = innerComplement.length === 1 ?
                innerComplement[0] : innerComplement;
            current[i] = flattendIC;
            relativeComplement[relativeComplement.length] =
                catAndSlice(current, matchedPath, i + 1);
        }

        // The exact match needs to be produced for calling function.
        exactMatch[i] = innerMatch;
        current[i] = innerMatch;
    }

    return [exactMatch, relativeComplement];
};

},{"180":180,"204":204}],184:[function(require,module,exports){
var convertPathToRoute = require(185);
var isPathValue = require(210);
var slice = require(215);
var isArray = Array.isArray;

/**
 *   Creates the named variables and coerces it into its
 * virtual type.
 *
 * @param {Array} route - The route that produced this action wrapper
 * @private
 */
function createNamedVariables(route, action) {
    return function innerCreateNamedVariables(matchedPath) {
        var convertedArguments;
        var len = -1;
        var restOfArgs = slice(arguments, 1);
        var isJSONObject = !isArray(matchedPath);

        // A set uses a json object
        if (isJSONObject) {
            restOfArgs = [];
            convertedArguments = matchedPath;
        }

        // Could be an array of pathValues for a set operation.
        else if (isPathValue(matchedPath[0])) {
            convertedArguments = [];

            matchedPath.forEach(function(pV) {
                pV.path = convertPathToRoute(pV.path, route);
                convertedArguments[++len] = pV;
            });
        }

        // else just convert and assign
        else {
            convertedArguments =
                convertPathToRoute(matchedPath, route);
        }
        return action.apply(this, [convertedArguments].concat(restOfArgs));
    };
}
module.exports = createNamedVariables;

},{"185":185,"210":210,"215":215}],185:[function(require,module,exports){
// Disable eslint for import statements
/* eslint-disable max-len */
var Keys = require(155);
var convertPathKeyToRange = require(176);
var convertPathKeyToIntegers = require(168);
var convertPathKeyToKeys = require(169);
var isArray = Array.isArray;
/* eslint-enable max-len */

/**
 * takes the path that was matched and converts it to the
 * virtual path.
 */
module.exports = function convertPathToRoute(path, route) {
    var matched = [];
    // Always use virtual path since path can be longer since
    // it contains suffixes.
    for (var i = 0, len = route.length; i < len; ++i) {

        if (route[i].type) {
            var virt = route[i];
            switch (virt.type) {
                case Keys.ranges:
                    matched[i] =
                        convertPathKeyToRange(path[i]);
                    break;
                case Keys.integers:
                    matched[i] =
                        convertPathKeyToIntegers(path[i]);
                    break;
                case Keys.keys:
                    matched[i] =
                        convertPathKeyToKeys(path[i]);
                    break;
                default:
                    var err = new Error('Unknown route type.');
                    err.throwToNext = true;
                    break;
            }
            if (virt.named) {
                matched[virt.name] = matched[matched.length - 1];
            }
        }

        // Dealing with specific keys or array of specific keys.
        // If route has an array at this position, arrayify the
        // path[i] element.
        else {
            if (isArray(route[i]) && !isArray(path[i])) {
                matched[matched.length] = [path[i]];
            }

            else {
                matched[matched.length] = path[i];
            }
        }
    }

    return matched;
};



},{"155":155,"168":168,"169":169,"176":176}],186:[function(require,module,exports){
var Keys = require(155);
module.exports = function convertTypes(virtualPath) {
    virtualPath.route = virtualPath.route.map(function(key) {
        if (typeof key === 'object') {
            switch (key.type) {
                case 'keys':
                    key.type = Keys.keys;
                    break;
                case 'integers':
                    key.type = Keys.integers;
                    break;
                case 'ranges':
                    key.type = Keys.ranges;
                    break;
                default:
                    var err = new Error('Unknown route type.');
                    err.throwToNext = true;
                    break;
            }
        }
        return key;
    });
};

},{"155":155}],187:[function(require,module,exports){
var Keys = require(155);
var actionWrapper = require(184);
var pathSyntax = require(125);
var convertTypes = require(186);
var prettifyRoute = require(214);
var errors = require(166);
var cloneArray = require(206);
var ROUTE_ID = -3;

module.exports = function parseTree(routes) {
    var pTree = {};
    var parseMap = {};
    routes.forEach(function forEachRoute(route) {
        // converts the virtual string path to a real path with
        // extended syntax on.
        if (typeof route.route === 'string') {
            route.route = pathSyntax(route.route, true);
            convertTypes(route);
        }
        if (route.get) {
            route.getId = ++ROUTE_ID;
        }
        if (route.set) {
            route.setId = ++ROUTE_ID;
        }
        if (route.call) {
            route.callId = ++ROUTE_ID;
        }

        setHashOrThrowError(parseMap, route);
        buildParseTree(pTree, route, 0, []);
    });
    return pTree;
};

function buildParseTree(node, routeObject, depth) {

    var route = routeObject.route;
    var get = routeObject.get;
    var set = routeObject.set;
    var call = routeObject.call;
    var el = route[depth];

    el = !isNaN(+el) && +el || el;
    var isArray = Array.isArray(el);
    var i = 0;

    do {
        var value = el;
        var next;
        if (isArray) {
            value = value[i];
        }

        // There is a ranged token in this location with / without name.
        // only happens from parsed path-syntax paths.
        if (typeof value === 'object') {
            var routeType = value.type;
            next = decendTreeByRoutedToken(node, routeType, value);
        }

        // This is just a simple key.  Could be a ranged key.
        else {
            next = decendTreeByRoutedToken(node, value);

            // we have to create a falcor-router virtual object
            // so that the rest of the algorithm can match and coerse
            // when needed.
            if (next) {
                route[depth] = {type: value, named: false};
            }
            else {
                if (!node[value]) {
                    node[value] = {};
                }
                next = node[value];
            }
        }

        // Continue to recurse or put get/set.
        if (depth + 1 === route.length) {

            // Insert match into routeSyntaxTree
            var matchObject = next[Keys.match] || {};
            if (!next[Keys.match]) {
                next[Keys.match] = matchObject;
            }

            if (get) {
                matchObject.get = actionWrapper(route, get);
                matchObject.getId = routeObject.getId;
            }
            if (set) {
                matchObject.set = actionWrapper(route, set);
                matchObject.setId = routeObject.setId;
            }
            if (call) {
                matchObject.call = actionWrapper(route, call);
                matchObject.callId = routeObject.callId;
            }
        } else {
            buildParseTree(next, routeObject, depth + 1);
        }

    } while (isArray && ++i < el.length);
}

/**
 * ensure that two routes of the same precedence do not get
 * set in.
 */
function setHashOrThrowError(parseMap, routeObject) {
    var route = routeObject.route;
    var get = routeObject.get;
    var set = routeObject.set;
    var call = routeObject.call;

    getHashesFromRoute(route).
        map(function mapHashToString(hash) { return hash.join(','); }).
        forEach(function forEachRouteHash(hash) {
            if (get && parseMap[hash + 'get'] ||
                set && parseMap[hash + 'set'] ||
                    call && parseMap[hash + 'call']) {
                throw new Error(errors.routeWithSamePrecedence + ' ' +
                               prettifyRoute(route));
            }
            if (get) {
                parseMap[hash + 'get'] = true;
            }
            if (set) {
                parseMap[hash + 'set'] = true;
            }
            if (call) {
                parseMap[hash + 'call'] = true;
            }
        });
}

/**
 * decends the rst and fills in any naming information at the node.
 * if what is passed in is not a routed token identifier, then the return
 * value will be null
 */
function decendTreeByRoutedToken(node, value, routeToken) {
    var next = null;
    switch (value) {
        case Keys.keys:
        case Keys.integers:
        case Keys.ranges:
            next = node[value];
            if (!next) {
                next = node[value] = {};
            }
            break;
        default:
            break;
    }
    if (next && routeToken) {
        // matches the naming information on the node.
        next[Keys.named] = routeToken.named;
        next[Keys.name] = routeToken.name;
    }

    return next;
}

/**
 * creates a hash of the virtual path where integers and ranges
 * will collide but everything else is unique.
 */
function getHashesFromRoute(route, depth, hashes, hash) {
    /*eslint-disable no-func-assign, no-param-reassign*/
    depth = depth || 0;
    hashes = hashes || [];
    hash = hash || [];
    /*eslint-enable no-func-assign, no-param-reassign*/

    var routeValue = route[depth];
    var isArray = Array.isArray(routeValue);
    var length = isArray && routeValue.length || 0;
    var idx = 0;
    var value;

    if (typeof routeValue === 'object' && !isArray) {
        value = routeValue.type;
    }

    else if (!isArray) {
        value = routeValue;
    }

    do {
        if (isArray) {
            value = routeValue[idx];
        }

        if (value === Keys.integers || value === Keys.ranges) {
            hash[depth] = '__I__';
        }

        else if (value === Keys.keys) {
            hash[depth] ='__K__';
        }

        else {
            hash[depth] = value;
        }

        // recurse down the routed token
        if (depth + 1 !== route.length) {
            getHashesFromRoute(route, depth + 1, hashes, hash);
        }

        // Or just add it to hashes
        else {
            hashes.push(cloneArray(hash));
        }
    } while (isArray && ++idx < length);

    return hashes;
}


},{"125":125,"155":155,"166":166,"184":184,"186":186,"206":206,"214":214}],188:[function(require,module,exports){
var call = 'call';
var runCallAction = require(192);
var recurseMatchAndExecute = require(201);
var normalizePathSets = require(178);
var CallNotFoundError = require(162);
var materialize = require(197);
var pathUtils = require(136);
var collapse = pathUtils.collapse;
var Observable = require(203).Observable;
var MaxPathsExceededError = require(165);
var getPathsCount = require(190);

/**
 * Performs the call mutation.  If a call is unhandled, IE throws error, then
 * we will chain to the next dataSource in the line.
 */
module.exports = function routerCall(callPath, args,
                                     refPathsArg, thisPathsArg) {
    var router = this;

    return Observable.defer(function() {

        var refPaths = normalizePathSets(refPathsArg || []);
        var thisPaths = normalizePathSets(thisPathsArg || []);
        var jsongCache = {};
        var action = runCallAction(router, callPath, args,
                                   refPaths, thisPaths, jsongCache);
        var callPaths = [callPath];

        if (getPathsCount(refPaths) +
            getPathsCount(thisPaths) +
            getPathsCount(callPaths) >
            router.maxPaths) {
            throw new MaxPathsExceededError();
        }

        return recurseMatchAndExecute(router._matcher, action, callPaths, call,
                                      router, jsongCache).

            // Take that
            map(function(jsongResult) {
                var reportedPaths = jsongResult.reportedPaths;
                var jsongEnv = {
                    jsonGraph: jsongResult.jsonGraph
                };

                // Call must report the paths that have been produced.
                if (reportedPaths.length) {
                    // Collapse the reported paths as they may be inefficient
                    // to send across the wire.
                    jsongEnv.paths = collapse(reportedPaths);
                }
                else {
                    jsongEnv.paths = [];
                    jsongEnv.jsonGraph = {};
                }

                // add the invalidated paths to the jsonGraph Envelope
                var invalidated = jsongResult.invalidated;
                if (invalidated && invalidated.length) {
                    jsongEnv.invalidated = invalidated;
                }

                // Calls are currently materialized.
                materialize(router, reportedPaths, jsongEnv);
                return jsongEnv;
            }).

            // For us to be able to chain call requests then the error that is
            // caught has to be a 'function does not exist.' error.  From that
            // we will try the next dataSource in the line.
            catch(function catchException(e) {
                if (e instanceof CallNotFoundError && router._unhandled) {
                    return router._unhandled.
                        call(callPath, args, refPaths, thisPaths);
                }
                throw e;
            });
    });
};

},{"136":136,"162":162,"165":165,"178":178,"190":190,"192":192,"197":197,"201":201,"203":203}],189:[function(require,module,exports){
var runGetAction = require(196);
var get = 'get';
var recurseMatchAndExecute = require(201);
var normalizePathSets = require(178);
var materialize = require(197);
var Observable = require(203).Observable;
var mCGRI = require(198);
var MaxPathsExceededError = require(165);
var getPathsCount = require(190);

/**
 * The router get function
 */
module.exports = function routerGet(paths) {

    var router = this;

    return Observable.defer(function() {

        var jsongCache = {};
        var action = runGetAction(router, jsongCache);
        var normPS = normalizePathSets(paths);

        if (getPathsCount(normPS) > router.maxPaths) {
            throw new MaxPathsExceededError();
        }

        return recurseMatchAndExecute(router._matcher, action, normPS,
                                      get, router, jsongCache).

            // Turn it(jsongGraph, invalidations, missing, etc.) into a
            // jsonGraph envelope
            flatMap(function flatMapAfterRouterGet(details) {
                var out = {
                    jsonGraph: details.jsonGraph
                };


                // If the unhandledPaths are present then we need to
                // call the backup method for generating materialized.
                if (details.unhandledPaths.length && router._unhandled) {
                    var unhandledPaths = details.unhandledPaths;

                    // The 3rd argument is the beginning of the actions
                    // arguments, which for get is the same as the
                    // unhandledPaths.
                    return router._unhandled.
                        get(unhandledPaths).

                        // Merge the solution back into the overall message.
                        map(function(jsonGraphFragment) {
                            mCGRI(out.jsonGraph, [{
                                jsonGraph: jsonGraphFragment.jsonGraph,
                                paths: unhandledPaths
                            }]);
                            return out;
                        }).
                        defaultIfEmpty(out);
                }

                return Observable.of(out);
            }).

            // We will continue to materialize over the whole jsonGraph message.
            // This makes sense if you think about pathValues and an API that if
            // ask for a range of 10 and only 8 were returned, it would not
            // materialize for you, instead, allow the router to do that.
            map(function(jsonGraphEnvelope) {
                return materialize(router, normPS, jsonGraphEnvelope);
            });
    });
};

},{"165":165,"178":178,"190":190,"196":196,"197":197,"198":198,"201":201,"203":203}],190:[function(require,module,exports){
var falcorPathUtils = require(136);

function getPathsCount(pathSets) {
    return pathSets.reduce(function(numPaths, pathSet) {
        return numPaths + falcorPathUtils.pathCount(pathSet);
    }, 0);
}

module.exports = getPathsCount;

},{"136":136}],191:[function(require,module,exports){
var set = 'set';
var recurseMatchAndExecute = require(201);
var runSetAction = require(202);
var materialize = require(197);
var Observable = require(203).Observable;
var spreadPaths = require(216);
var pathValueMerge = require(161);
var optimizePathSets = require(160);
var hasIntersectionWithTree =
    require(173);
var getValue = require(158);
var normalizePathSets = require(178);
var pathUtils = require(136);
var collapse = pathUtils.collapse;
var mCGRI = require(198);
var MaxPathsExceededError = require(165);
var getPathsCount = require(190);

/**
 * @returns {Observable.<JSONGraph>}
 * @private
 */
module.exports = function routerSet(jsonGraph) {

    var router = this;

    return Observable.defer(function() {
        var jsongCache = {};
        var action = runSetAction(router, jsonGraph, jsongCache);
        jsonGraph.paths = normalizePathSets(jsonGraph.paths);

        if (getPathsCount(jsonGraph.paths) > router.maxPaths) {
            throw new MaxPathsExceededError();
        }

        return recurseMatchAndExecute(router._matcher, action, jsonGraph.paths,
                                      set, router, jsongCache).

            // Takes the jsonGraphEnvelope and extra details that comes out
            // of the recursive matching algorithm and either attempts the
            // fallback options or returns the built jsonGraph.
            flatMap(function(details) {
                var out = {
                    jsonGraph: details.jsonGraph
                };

                // If there is an unhandler then we should call that method and
                // provide the subset of jsonGraph that represents the missing
                // routes.
                if (details.unhandledPaths.length && router._unhandled) {
                    var unhandledPaths = details.unhandledPaths;
                    var jsonGraphFragment = {};

                    // PERFORMANCE:
                    //   We know this is a potential performance downfall
                    //   but we want to see if its even a corner case.
                    //   Most likely this will not be hit, but if it does
                    //   then we can take care of it
                    // Set is interesting.  This is what has to happen.
                    // 1. incoming paths are spread so that each one is simple.
                    // 2. incoming path, one at a time, are optimized by the
                    //    incoming jsonGraph.
                    // 3. test intersection against incoming optimized path and
                    //    unhandledPathSet
                    // 4. If 3 is true, build the jsonGraphFragment by using a
                    //    pathValue of optimizedPath and vale from un-optimized
                    //    path and original jsonGraphEnvelope.
                    var jsonGraphEnvelope = {jsonGraph: jsonGraphFragment};
                    var unhandledPathsTree = unhandledPaths.
                        reduce(function(acc, path) {
                            pathValueMerge(acc, {path: path, value: null});
                            return acc;
                        }, {});

                    // 1. Spread
                    var pathIntersection = spreadPaths(jsonGraph.paths).

                        // 2.1 Optimize.  We know its one at a time therefore we
                        // just pluck [0] out.
                        map(function(path) {
                            return [
                                // full path
                                path,

                                // optimized path
                                optimizePathSets(details.jsonGraph, [path],
                                                    router.maxRefFollow)[0]]
                        }).

                        // 2.2 Remove all the optimized paths that were found in
                        // the cache.
                        filter(function(x) { return x[1]; }).

                        // 3.1 test intersection.
                        map(function(pathAndOPath) {
                            var oPath = pathAndOPath[1];
                            var hasIntersection = hasIntersectionWithTree(
                                oPath, unhandledPathsTree);

                            // Creates the pathValue if there are a path
                            // intersection
                            if (hasIntersection) {
                                var value =
                                    getValue(jsonGraph.jsonGraph,
                                        pathAndOPath[0]);

                                return {
                                    path: oPath,
                                    value: value
                                };
                            }

                            return null;
                        }).

                        // 3.2 strip out nulls (the non-intersection paths).
                        filter(function(x) { return x !== null; });

                        // 4. build the optimized JSONGraph envelope.
                        pathIntersection.
                            reduce(function(acc, pathValue) {
                                pathValueMerge(acc, pathValue);
                                return acc;
                            }, jsonGraphFragment);

                    jsonGraphEnvelope.paths = collapse(
                        pathIntersection.map(function(pV) {
                            return pV.path;
                        }));

                    return router._unhandled.
                        set(jsonGraphEnvelope).

                        // Merge the solution back into the overall message.
                        map(function(unhandledJsonGraphEnv) {
                            mCGRI(out.jsonGraph, [{
                                jsonGraph: unhandledJsonGraphEnv.jsonGraph,
                                paths: unhandledPaths
                            }]);
                            return out;
                        }).
                        defaultIfEmpty(out);
                }

                return Observable.of(out);
            }).

            // We will continue to materialize over the whole jsonGraph message.
            // This makes sense if you think about pathValues and an API that
            // if ask for a range of 10 and only 8 were returned, it would not
            // materialize for you, instead, allow the router to do that.
            map(function(jsonGraphEnvelope) {
                return materialize(router, jsonGraph.paths, jsonGraphEnvelope);
            });
    });
};

},{"136":136,"158":158,"160":160,"161":161,"165":165,"173":173,"178":178,"190":190,"197":197,"198":198,"201":201,"202":202,"203":203,"216":216}],192:[function(require,module,exports){
var isJSONG = require(207);
var outputToObservable = require(195);
var noteToJsongOrPV = require(194);
var CallRequiresPathsError = require(163);
var mCGRI = require(198);
var Observable = require(203).Observable;

module.exports =  outerRunCallAction;

function outerRunCallAction(routerInstance, callPath, args,
                            suffixes, paths, jsongCache) {
    return function innerRunCallAction(matchAndPath) {
        return runCallAction(matchAndPath, routerInstance, callPath,
                             args, suffixes, paths, jsongCache);
    };
}

function runCallAction(matchAndPath, routerInstance, callPath, args,
                       suffixes, paths, jsongCache) {

    var match = matchAndPath.match;
    var matchedPath = matchAndPath.path;
    var out;

    // We are at out destination.  Its time to get out
    // the pathValues from the
    if (match.isCall) {

        // This is where things get interesting
        out = Observable.
            defer(function() {
            var next;
                try {
                    next = match.
                        action.call(
                            routerInstance, matchedPath, args, suffixes, paths);
                } catch (e) {
                    e.throwToNext = true;
                    throw e;
                }
                return outputToObservable(next).
                    toArray();
            }).

            // Required to get the references from the outputting jsong
            // and pathValues.
            map(function(res) {

                // checks call for isJSONG and if there is jsong without paths
                // throw errors.
                var refs = [];
                var values = [];

                // Will flatten any arrays of jsong/pathValues.
                var callOutput = res.

                    // Filters out any falsy values
                    filter(function(x) {
                        return x;
                    }).
                    reduce(function(flattenedRes, next) {
                        return flattenedRes.concat(next);
                    }, []);

                // An empty output from call
                if (callOutput.length === 0) {
                    return [];
                }

                var refLen = -1;
                callOutput.forEach(function(r) {

                    // its json graph.
                    if (isJSONG(r)) {

                        // This is a hard error and must fully stop the server
                        if (!r.paths) {
                            var err =
                                new CallRequiresPathsError();
                            err.throwToNext = true;
                            throw err;
                        }
                    }

                });

                var invsRefsAndValues = mCGRI(jsongCache, callOutput);
                invsRefsAndValues.references.forEach(function(ref) {
                    refs[++refLen] = ref;
                });

                values = invsRefsAndValues.values.map(function(pv) {
                    return pv.path;
                });

                var callLength = callOutput.length;
                var callPathSave1 = callPath.slice(0, callPath.length - 1);
                var hasSuffixes = suffixes && suffixes.length;
                var hasPaths = paths && paths.length;

                // We are going to use recurseMatchAndExecute to run
                // the paths and suffixes for call.  For that to happen
                // we must send a message to the outside to switch from
                // call to get.
                callOutput[++callLength] = {isMessage: true, method: 'get'};

                // If there are paths to add then push them into the next
                // paths through 'additionalPaths' message.
                if (hasPaths && (callLength + 1)) {
                    paths.forEach(function(path) {
                        callOutput[++callLength] = {
                            isMessage: true,
                            additionalPath: callPathSave1.concat(path)
                        };
                    });
                }

                // Suffix is the same as paths except for how to calculate
                // a path per reference found from the callPath.
                if (hasSuffixes) {

                    // matchedPath is the optimized path to call.
                    // e.g:
                    // callPath: [genreLists, 0, add] ->
                    // matchedPath: [lists, 'abc', add]
                    var optimizedPathLength = matchedPath.length - 1;

                    // For every reference build the complete path
                    // from the callPath - 1 and concat remaining
                    // path from the PathReference (path is where the
                    // reference was found, not the value of the reference).
                    // e.g: from the above example the output is:
                    // output = {path: [lists, abc, 0], value: [titles, 123]}
                    //
                    // This means the refs object = [output];
                    // callPathSave1: [genreLists, 0],
                    // optimizedPathLength: 3 - 1 = 2
                    // ref.path.slice(2): [lists, abc, 0].slice(2) = [0]
                    // deoptimizedPath: [genreLists, 0, 0]
                    //
                    // Add the deoptimizedPath to the callOutput messages.
                    // This will make the outer expand run those as a 'get'
                    refs.forEach(function(ref) {
                        var deoptimizedPath = callPathSave1.concat(
                                ref.path.slice(optimizedPathLength));
                        suffixes.forEach(function(suffix) {
                            var additionalPath =
                                deoptimizedPath.concat(suffix);
                            callOutput[++callLength] = {
                                isMessage: true,
                                additionalPath: additionalPath
                            };
                        });
                    });
                }

                // If there are no suffixes but there are references, report
                // the paths to the references.  There may be values as well,
                // add those to the output.
                if (refs.length && !hasSuffixes || values.length) {
                    var additionalPaths = [];
                    if (refs.length && !hasSuffixes) {
                        additionalPaths = refs.
                            map(function(x) { return x.path; });
                    }
                    additionalPaths.
                        concat(values).
                        forEach(function(path) {
                            callOutput[++callLength] = {
                                isMessage: true,
                                additionalPath: path
                            };
                        });
                }

                return callOutput;
            }).

            // When call has an error it needs to be propagated to the next
            // level instead of onCompleted'ing
            do(null, function(e) {
                e.throwToNext = true;
                throw e;
            });
    } else {
        out = match.action.call(routerInstance, matchAndPath.path);
        out = outputToObservable(out);
    }

    return out.
        materialize().
        filter(function(note) {
            return note.kind !== 'C';
        }).
        map(noteToJsongOrPV(matchAndPath.path)).
        map(function(jsonGraphOrPV) {
            return [matchAndPath.match, jsonGraphOrPV];
        });
}

},{"163":163,"194":194,"195":195,"198":198,"203":203,"207":207}],193:[function(require,module,exports){
var JSONGraphError = require(164);
module.exports = function errorToPathValue(error, path) {
    var typeValue = {
        $type: 'error',
        value: {}
    };

    if (error.throwToNext) {
        throw error;
    }

    // If it is a special JSONGraph error then pull all the data
    if (error instanceof JSONGraphError) {
        typeValue = error.typeValue;
    }

    else if (error instanceof Error) {
        typeValue.value.message = error.message;
    }

    return {
        path: path,
        value: typeValue
    };
};

},{"164":164}],194:[function(require,module,exports){
var isJSONG = require(207);
var onNext = 'N';
var errorToPathValue = require(193);

/**
 * Takes a path and for every onNext / onError it will attempt
 * to pluck the value or error from the note and process it
 * with the path object passed in.
 * @param {PathSet|PathSet[]} pathOrPathSet -
 * @param {Boolean} isPathSet -
 */
module.exports = function noteToJsongOrPV(pathOrPathSet, isPathSet) {
    return function(note) {
        return convertNoteToJsongOrPV(pathOrPathSet, note, isPathSet);
    };
};

function convertNoteToJsongOrPV(pathOrPathSet, note, isPathSet) {
    var incomingJSONGOrPathValues;
    var kind = note.kind;

    // Take what comes out of the function and assume its either a pathValue or
    // jsonGraph.
    if (kind === onNext) {
        incomingJSONGOrPathValues = note.value;
    }

    // Convert the error to a pathValue.
    else {
        incomingJSONGOrPathValues =
            errorToPathValue(note.exception, pathOrPathSet);
    }

    // If its jsong we may need to optionally attach the
    // paths if the paths do not exist
    if (isJSONG(incomingJSONGOrPathValues) &&
        !incomingJSONGOrPathValues.paths) {

        incomingJSONGOrPathValues = {
            jsonGraph: incomingJSONGOrPathValues.jsonGraph,
            paths: isPathSet && pathOrPathSet || [pathOrPathSet]
        };
    }

    return incomingJSONGOrPathValues;
}


},{"193":193,"207":207}],195:[function(require,module,exports){
var Observable = require(203).Observable;
var isArray = Array.isArray;

/**
 * For the router there are several return types from user
 * functions.  The standard set are: synchronous type (boolean or
 * json graph) or an async type (observable or a thenable).
 */
module.exports = function outputToObservable(valueOrObservable) {
    var value = valueOrObservable,
        oldObservable;

    // falsy value
    if (!value) {
        return Observable.of(value);
    }

    // place holder.  Observables have highest precedence.
    else if (value.subscribe) {
        if (!(value instanceof Observable)) {
            oldObservable = value;
            value = Observable.create(function(observer) {
                return oldObservable.subscribe(observer);
            });
        }
    }

    // promise
    else if (value.then) {
        value = Observable.fromPromise(value);
    }

    // from array of pathValues.
    else if (isArray(value)) {
        value = Observable.of(value);
    }

    // this will be jsong or pathValue at this point.
    // NOTE: For the case of authorize this will be a boolean
    else {
        value = Observable.of(value);
    }

    return value;
};

},{"203":203}],196:[function(require,module,exports){
var outputToObservable = require(195);
var noteToJsongOrPV = require(194);
var Observable = require(203).Observable;

module.exports = function runGetAction(routerInstance, jsongCache) {
    return function innerGetAction(matchAndPath) {
        return getAction(routerInstance, matchAndPath, jsongCache);
    };
};

function getAction(routerInstance, matchAndPath, jsongCache) {
    var match = matchAndPath.match;
    var out;
    try {
        out = match.action.call(routerInstance, matchAndPath.path);
        out = outputToObservable(out);
    } catch (e) {
        out = Observable.throw(e);
    }

    return out.
        materialize().
        filter(function(note) {
            return note.kind !== 'C';
        }).
        map(noteToJsongOrPV(matchAndPath.path)).
        map(function(jsonGraphOrPV) {
            return [matchAndPath.match, jsonGraphOrPV];
        });
}


},{"194":194,"195":195,"203":203}],197:[function(require,module,exports){
var pathValueMerge = require(161);
var optimizePathSets = require(160);
var $atom = require(217).$atom;

/**
 * given a set of paths and a jsonGraph envelope, materialize missing will
 * crawl all the paths to ensure that they have been fully filled in.  The
 * paths that are missing will be filled with materialized atoms.
 */
module.exports = function materializeMissing(router, paths, jsongEnv) {
    var jsonGraph = jsongEnv.jsonGraph;
    var materializedAtom = {$type: $atom};

    // Optimizes the pathSets from the jsong then
    // inserts atoms of undefined.
    optimizePathSets(jsonGraph, paths, router.maxRefFollow).
        forEach(function(optMissingPath) {
            pathValueMerge(jsonGraph, {
                path: optMissingPath,
                value: materializedAtom
            });
        });

    return {jsonGraph: jsonGraph};
}

},{"160":160,"161":161,"217":217}],198:[function(require,module,exports){
var jsongMerge = require(159);
var pathValueMerge = require(161);
var isJSONG = require(207);
var isMessage = require(208);
module.exports = mergeCacheAndGatherRefsAndInvalidations;

/**
 * takes the response from an action and merges it into the
 * cache.  Anything that is an invalidation will be added to
 * the first index of the return value, and the inserted refs
 * are the second index of the return value.  The third index
 * of the return value is messages from the action handlers
 *
 * @param {Object} cache
 * @param {Array} jsongOrPVs
 */
function mergeCacheAndGatherRefsAndInvalidations(cache, jsongOrPVs) {
    var references = [];
    var len = -1;
    var invalidations = [];
    var unhandledPaths = [];
    var messages = [];
    var values = [];

    // Go through each of the outputs from the route end point and separate out
    // each type of potential output.
    //
    // * There are values that need to be merged into the JSONGraphCache
    // * There are references that need to be merged and potentially followed
    // * There are messages that can alter the behavior of the
    //   recurseMatchAndExecute cycle.
    // * unhandledPaths happens when a path matches a route but the route does
    //   not match the entire path, therefore there is unmatched paths.
    jsongOrPVs.forEach(function(jsongOrPV) {
        var refsAndValues = [];

        if (isMessage(jsongOrPV)) {
            messages[messages.length] = jsongOrPV;
        }

        else if (isJSONG(jsongOrPV)) {
            refsAndValues = jsongMerge(cache, jsongOrPV);
        }

        // Last option are path values.
        else {
            refsAndValues = pathValueMerge(cache, jsongOrPV);
        }

        var refs = refsAndValues.references;
        var vals = refsAndValues.values;
        var invs = refsAndValues.invalidations;
        var unhandled = refsAndValues.unhandledPaths;

        if (vals && vals.length) {
            values = values.concat(vals);
        }

        if (invs && invs.length) {
            invalidations = invalidations.concat(invs);
        }

        if (unhandled && unhandled.length) {
            unhandledPaths = unhandledPaths.concat(unhandled);
        }

        if (refs && refs.length) {
            refs.forEach(function(ref) {
                references[++len] = ref;
            });
        }
    });

    return {
        invalidations: invalidations,
        references: references,
        messages: messages,
        values: values,
        unhandledPaths: unhandledPaths
    };
}

},{"159":159,"161":161,"207":207,"208":208}],199:[function(require,module,exports){
/* eslint-disable max-len */
var pathUtils = require(136);
var collapse = pathUtils.collapse;
var stripPath = require(183);
var hasIntersection = require(172);
/* eslint-enable max-len */

/**
 * takes in the set of ordered matches and pathSet that got those matches.
 * From there it will give back a list of matches to execute.
 */
module.exports = function getExecutableMatches(matches, pathSet) {
    var remainingPaths = pathSet;
    var matchAndPaths = [];
    var out = {
        matchAndPaths: matchAndPaths,
        unhandledPaths: false
    };
    for (var i = 0; i < matches.length && remainingPaths.length > 0; ++i) {
        var availablePaths = remainingPaths;
        var match = matches[i];

        remainingPaths = [];

        if (i > 0) {
            availablePaths = collapse(availablePaths);
        }

        // For every available path attempt to intersect.  If there
        // is an intersection then strip and replace.
        // any relative complements, add to remainingPaths
        for (var j = 0; j < availablePaths.length; ++j) {
            var path = availablePaths[j];
            if (hasIntersection(path, match.virtual)) {
                var stripResults = stripPath(path, match.virtual);
                matchAndPaths[matchAndPaths.length] = {
                    path: stripResults[0],
                    match: match
                };
                remainingPaths = remainingPaths.concat(stripResults[1]);
            }
        }
    }

    // Adds the remaining paths to the unhandled paths section.
    if (remainingPaths && remainingPaths.length) {
        out.unhandledPaths = remainingPaths;
    }

    return out;
};




},{"136":136,"172":172,"183":183}],200:[function(require,module,exports){
var Observable = require(203).Observable;
var getExecutableMatches = require(199);

/**
 * Sorts and strips the set of available matches given the pathSet.
 */
module.exports = function runByPrecedence(pathSet, matches, actionRunner) {

    // Precendence matching
    var sortedMatches = matches.
        sort(sortByPrecedence);

    var execs = getExecutableMatches(sortedMatches, [pathSet]);

    var setOfMatchedPaths = Observable.
        from(execs.matchAndPaths).
        flatMap(actionRunner).

        // Note: We do not wait for each observable to finish,
        // but repeat the cycle per onNext.
        map(function(actionTuple) {

            return {
                match: actionTuple[0],
                value: actionTuple[1]
            };
        });

    if (execs.unhandledPaths) {
        setOfMatchedPaths = setOfMatchedPaths.
            concat(Observable.of({
                match: {suffix: []},
                value: {
                    isMessage: true,
                    unhandledPaths: execs.unhandledPaths
                }
            }));
    }

    return setOfMatchedPaths;
};

function sortByPrecedence(a, b) {

    var aPrecedence = a.precedence;
    var bPrecedence = b.precedence;

    if (aPrecedence < bPrecedence) {
        return 1;
    } else if (aPrecedence > bPrecedence) {
        return -1;
    }

    return 0;
}

},{"199":199,"203":203}],201:[function(require,module,exports){
var Rx = require(203);
var Observable = Rx.Observable;
var runByPrecedence = require(200);
var pathUtils = require(136);
var collapse = pathUtils.collapse;
var optimizePathSets = require(160);
var mCGRI = require(198);
var isArray = Array.isArray;

/**
 * The recurse and match function will async recurse as long as
 * there are still more paths to be executed.  The match function
 * will return a set of objects that have how much of the path that
 * is matched.  If there still is more, denoted by suffixes,
 * paths to be matched then the recurser will keep running.
 */
module.exports = function recurseMatchAndExecute(
        match, actionRunner, paths,
        method, routerInstance, jsongCache) {

    return _recurseMatchAndExecute(
        match, actionRunner, paths,
        method, routerInstance, jsongCache);
};

/**
 * performs the actual recursing
 */
function _recurseMatchAndExecute(
        match, actionRunner, paths,
        method, routerInstance, jsongCache) {
    var unhandledPaths = [];
    var invalidated = [];
    var reportedPaths = [];
    var currentMethod = method;

    return Observable.

        // Each pathSet (some form of collapsed path) need to be sent
        // independently.  for each collapsed pathSet will, if producing
        // refs, be the highest likelihood of collapsibility.
        from(paths).
        expand(function(nextPaths) {
            if (!nextPaths.length) {
                return Observable.empty();
            }

            // We have to return an Observable of error instead of just
            // throwing.
            var matchedResults;
            try {
                matchedResults = match(currentMethod, nextPaths);
            } catch (e) {
                return Observable.throw(e);
            }

            // When there is explicitly not a match then we need to handle
            // the unhandled paths.
            if (!matchedResults.length) {
                unhandledPaths.push(nextPaths);
                return Observable.empty();
            }

            return runByPrecedence(nextPaths, matchedResults, actionRunner).

                // Generate from the combined results the next requestable paths
                // and insert errors / values into the cache.
                flatMap(function(results) {
                    var value = results.value;
                    var suffix = results.match.suffix;

                    // TODO: MaterializedPaths, use result.path to build up a
                    // "foundPaths" array.  This could be used to materialize
                    // if that is the case.  I don't think this is a
                    // requirement, but it could be.
                    if (!isArray(value)) {
                        value = [value];
                    }

                    var invsRefsAndValues = mCGRI(jsongCache, value);
                    var invalidations = invsRefsAndValues.invalidations;
                    var unhandled = invsRefsAndValues.unhandledPaths;
                    var messages = invsRefsAndValues.messages;
                    var pathsToExpand = [];

                    if (suffix.length > 0) {
                        pathsToExpand = invsRefsAndValues.references;
                    }

                    // Merge the invalidations and unhandledPaths.
                    invalidations.forEach(function(invalidation) {
                        invalidated[invalidated.length] = invalidation.path;
                    });

                    unhandled.forEach(function(unhandledPath) {
                        unhandledPaths[unhandledPaths.length] = unhandledPath;
                    });

                    // Merges the remaining suffix with remaining nextPaths
                    pathsToExpand = pathsToExpand.map(function(next) {
                        return next.value.concat(suffix);
                    });

                    // Alters the behavior of the expand
                    messages.forEach(function(message) {
                        // mutates the method type for the matcher
                        if (message.method) {
                            currentMethod = message.method;
                        }

                        // Mutates the nextPaths and adds any additionalPaths
                        else if (message.additionalPath) {
                            var path = message.additionalPath;
                            pathsToExpand[pathsToExpand.length] = path;
                            reportedPaths[reportedPaths.length] = path;
                        }

                        // Any invalidations that come down from a call
                        else if (message.invalidations) {
                            message.
                                invalidations.
                                forEach(function(invalidation) {
                                    invalidated.push(invalidation);
                                });
                        }

                        // We need to add the unhandledPaths to the jsonGraph
                        // response.
                        else if (message.unhandledPaths) {
                            unhandledPaths = unhandledPaths.
                                concat(message.unhandledPaths);
                        }
                    });

                    // Explodes and collapse the tree to remove
                    // redundants and get optimized next set of
                    // paths to evaluate.
                    pathsToExpand = optimizePathSets(
                        jsongCache, pathsToExpand, routerInstance.maxRefFollow);

                    if (pathsToExpand.length) {
                        pathsToExpand = collapse(pathsToExpand);
                    }

                    return Observable.
                        from(pathsToExpand);
                }).
                defaultIfEmpty([]);

        }).
        reduce(function(acc, x) {
            return acc;
        }, null).
        map(function() {
            return {
                unhandledPaths: unhandledPaths,
                invalidated: invalidated,
                jsonGraph: jsongCache,
                reportedPaths: reportedPaths
            };
        });
}


},{"136":136,"160":160,"198":198,"200":200,"203":203}],202:[function(require,module,exports){
/* eslint-disable max-len */
var outputToObservable = require(195);
var noteToJsongOrPV = require(194);
var spreadPaths = require(216);
var getValue = require(158);
var jsongMerge = require(159);
var optimizePathSets = require(160);
var hasIntersection = require(172);
var pathValueMerge = require(161);
var Observable = require(203).Observable;
/* eslint-enable max-len */

module.exports = function outerRunSetAction(routerInstance, modelContext,
                                            jsongCache) {
    return function innerRunSetAction(matchAndPath) {
        return runSetAction(routerInstance, modelContext,
                            matchAndPath, jsongCache);
    };
};

function runSetAction(routerInstance, jsongMessage, matchAndPath, jsongCache) {
    var match = matchAndPath.match;
    var out;
    var arg = matchAndPath.path;

    // We are at out destination.  Its time to get out
    // the pathValues from the
    if (match.isSet) {
        var paths = spreadPaths(jsongMessage.paths);

        // We have to ensure that the paths maps in order
        // to the optimized paths array.
        var optimizedPathsAndPaths =
            paths.
                // Optimizes each path.
                map(function(path) {
                    return [optimizePathSets(
                        jsongCache, [path], routerInstance.maxRefFollow)[0],
                        path];
                }).
                // only includes the paths from the set that intersect
                // the virtual path
                filter(function(optimizedAndPath) {
                    return optimizedAndPath[0] &&
                        hasIntersection(optimizedAndPath[0], match.virtual);
                });
        var optimizedPaths = optimizedPathsAndPaths.map(function(opp) {
            return opp[0];
        });
        var subSetPaths = optimizedPathsAndPaths.map(function(opp) {
            return opp[1];
        });
        var tmpJsonGraph = subSetPaths.
            reduce(function(json, path, i) {
                pathValueMerge(json, {
                    path: optimizedPaths[i],
                    value: getValue(jsongMessage.jsonGraph, path)
                });
                return json;
            }, {});

        // Takes the temporary JSONGraph, attaches only the matched paths
        // then creates the subset json and assigns it to the argument to
        // the set function.
        var subJsonGraphEnv = {
            jsonGraph: tmpJsonGraph,
            paths: [match.requested]
        };
        arg = {};
        jsongMerge(arg, subJsonGraphEnv);
    }
    try {
        out = match.action.call(routerInstance, arg);
        out = outputToObservable(out);
    } catch (e) {
        out = Observable.throw(e);
    }

    return out.
        materialize().
        filter(function(note) {
            return note.kind !== 'C';
        }).
        map(noteToJsongOrPV(matchAndPath.path)).
        map(function(jsonGraphOrPV) {
            return [matchAndPath.match, jsonGraphOrPV];
        });
}

},{"158":158,"159":159,"160":160,"161":161,"172":172,"194":194,"195":195,"203":203,"216":216}],203:[function(require,module,exports){
var Observable = require(234).Observable;

require(239);
require(240);
require(241);
require(242);
require(243);
require(244);

require(245);
require(246);
require(247);
require(248);
require(249);
require(250);
require(251);
require(252);
require(253);
require(254);
require(255);

module.exports = { Observable: Observable };

},{"234":234,"239":239,"240":240,"241":241,"242":242,"243":243,"244":244,"245":245,"246":246,"247":247,"248":248,"249":249,"250":250,"251":251,"252":252,"253":253,"254":254,"255":255}],204:[function(require,module,exports){
module.exports = function catAndSlice(a, b, slice) {
    var next = [], i, j, len;
    for (i = 0, len = a.length; i < len; ++i) {
        next[i] = a[i];
    }

    for (j = slice || 0, len = b.length; j < len; ++j, ++i) {
        next[i] = b[j];
    }

    return next;
};

},{}],205:[function(require,module,exports){
module.exports = function copy(valueType) {
    if ((typeof valueType !== 'object') || (valueType === null)) {
        return valueType;
    }

    return Object.
        keys(valueType).
        reduce(function(acc, k) {
            acc[k] = valueType[k];
            return acc;
        }, {});
};


},{}],206:[function(require,module,exports){
function cloneArray(arr, index) {
    var a = [];
    var len = arr.length;
    for (var i = index || 0; i < len; i++) {
        a[i] = arr[i];
    }
    return a;
}

module.exports = cloneArray;

},{}],207:[function(require,module,exports){
module.exports = function isJSONG(x) {
    return x.jsonGraph;
};

},{}],208:[function(require,module,exports){
module.exports = function isMessage(output) {
    return output.hasOwnProperty('isMessage');
};

},{}],209:[function(require,module,exports){
/**
 * Will determine of the argument is a number.
 *
 * '1' returns true
 * 1 returns true
 * [1] returns false
 * null returns false
 * @param {*} x
 */
module.exports = function(x) {
    return String(Number(x)) === String(x) && typeof x !== 'object';
};

},{}],210:[function(require,module,exports){
module.exports = function(x) {
    return x.hasOwnProperty('path') && x.hasOwnProperty('value');
};

},{}],211:[function(require,module,exports){
module.exports = function isRange(range) {
    return range.hasOwnProperty('to') && range.hasOwnProperty('from');
};

},{}],212:[function(require,module,exports){
/**
 * Determines if the object is a routed token by hasOwnProperty
 * of type and named
 */
module.exports = function isRoutedToken(obj) {
    return obj.hasOwnProperty('type') && obj.hasOwnProperty('named');
};

},{}],213:[function(require,module,exports){
module.exports = String.fromCharCode(30);


},{}],214:[function(require,module,exports){
var Keys = require(155);

/**
 * beautify the virtual path, meaning paths with virtual keys will
 * not be displayed as a stringified object but instead as a string.
 *
 * @param {Array} route -
 */
module.exports = function prettifyRoute(route) {
    var length = 0;
    var str = [];
    for (var i = 0, len = route.length; i < len; ++i, ++length) {
        var value = route[i];
        if (typeof value === 'object') {
            value = value.type;
        }

        if (value === Keys.integers) {
            str[length] = 'integers';
        }

        else if (value === Keys.ranges) {
            str[length] = 'ranges';
        }

        else if (value === Keys.keys) {
            str[length] = 'keys';
        }

        else {
            if (Array.isArray(value)) {
                str[length] = JSON.stringify(value);
            }

            else {
                str[length] = value;
            }
        }
    }

    return str;
}

},{"155":155}],215:[function(require,module,exports){
module.exports = function slice(args, index) {
    var len = args.length;
    var out = [];
    var j = 0;
    var i = index;
    while (i < len) {
        out[j] = args[i];
        ++i;
        ++j;
    }
    return out;
};

},{}],216:[function(require,module,exports){
var iterateKeySet = require(136).iterateKeySet;
var cloneArray = require(206);

/**
 * Takes in a ptahSet and will create a set of simple paths.
 * @param {Array} paths
 */
module.exports = function spreadPaths(paths) {
    var allPaths = [];
    paths.forEach(function(x) {
        _spread(x, 0, allPaths);
    });

    return allPaths;
};

function _spread(pathSet, depth, out, currentPath) {

    /* eslint-disable no-param-reassign */
    currentPath = currentPath || [];
    /* eslint-enable no-param-reassign */

    if (depth === pathSet.length) {
        out[out.length] = cloneArray(currentPath);
        return;
    }

    // Simple case
    var key = pathSet[depth];
    if (typeof key !== 'object') {
        currentPath[depth] = key;
        _spread(pathSet, depth + 1, out, currentPath);
        return;
    }

    // complex key.
    var iteratorNote = {};
    var innerKey = iterateKeySet(key, iteratorNote);
    do {
        // spreads the paths
        currentPath[depth] = innerKey;
        _spread(pathSet, depth + 1, out, currentPath);
        currentPath.length = depth;

        innerKey = iterateKeySet(key, iteratorNote);
    } while (!iteratorNote.done);
}

},{"136":136,"206":206}],217:[function(require,module,exports){
module.exports = {
    $ref: 'ref',
    $atom: 'atom',
    $error: 'error'
};

},{}],218:[function(require,module,exports){
"use strict";

// rawAsap provides everything we need except exception management.
var rawAsap = require(219);
// RawTasks are recycled to reduce GC churn.
var freeTasks = [];
// We queue errors to ensure they are thrown in right order (FIFO).
// Array-as-queue is good enough here, since we are just dealing with exceptions.
var pendingErrors = [];
var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);

function throwFirstError() {
    if (pendingErrors.length) {
        throw pendingErrors.shift();
    }
}

/**
 * Calls a task as soon as possible after returning, in its own event, with priority
 * over other events like animation, reflow, and repaint. An error thrown from an
 * event will not interrupt, nor even substantially slow down the processing of
 * other events, but will be rather postponed to a lower priority event.
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */
module.exports = asap;
function asap(task) {
    var rawTask;
    if (freeTasks.length) {
        rawTask = freeTasks.pop();
    } else {
        rawTask = new RawTask();
    }
    rawTask.task = task;
    rawAsap(rawTask);
}

// We wrap tasks with recyclable task objects.  A task object implements
// `call`, just like a function.
function RawTask() {
    this.task = null;
}

// The sole purpose of wrapping the task is to catch the exception and recycle
// the task object after its single use.
RawTask.prototype.call = function () {
    try {
        this.task.call();
    } catch (error) {
        if (asap.onerror) {
            // This hook exists purely for testing purposes.
            // Its name will be periodically randomized to break any code that
            // depends on its existence.
            asap.onerror(error);
        } else {
            // In a web browser, exceptions are not fatal. However, to avoid
            // slowing down the queue of pending tasks, we rethrow the error in a
            // lower priority turn.
            pendingErrors.push(error);
            requestErrorThrow();
        }
    } finally {
        this.task = null;
        freeTasks[freeTasks.length] = this;
    }
};

},{"219":219}],219:[function(require,module,exports){
(function (global){
"use strict";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including IO, animation, reflow, and redraw
// events in browsers.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Equivalent to push, but avoids a function call.
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// `requestFlush` is an implementation-specific method that attempts to kick
// off a `flush` event as quickly as possible. `flush` will attempt to exhaust
// the event queue before yielding to the browser's own event loop.
var requestFlush;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory exhaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

// `requestFlush` is implemented using a strategy based on data collected from
// every available SauceLabs Selenium web driver worker at time of writing.
// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593

// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
// have WebKitMutationObserver but not un-prefixed MutationObserver.
// Must use `global` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.
var BrowserMutationObserver = global.MutationObserver || global.WebKitMutationObserver;

// MutationObservers are desirable because they have high priority and work
// reliably everywhere they are implemented.
// They are implemented in all modern browsers.
//
// - Android 4-4.3
// - Chrome 26-34
// - Firefox 14-29
// - Internet Explorer 11
// - iPad Safari 6-7.1
// - iPhone Safari 7-7.1
// - Safari 6-7
if (typeof BrowserMutationObserver === "function") {
    requestFlush = makeRequestCallFromMutationObserver(flush);

// MessageChannels are desirable because they give direct access to the HTML
// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
// 11-12, and in web workers in many engines.
// Although message channels yield to any queued rendering and IO tasks, they
// would be better than imposing the 4ms delay of timers.
// However, they do not work reliably in Internet Explorer or Safari.

// Internet Explorer 10 is the only browser that has setImmediate but does
// not have MutationObservers.
// Although setImmediate yields to the browser's renderer, it would be
// preferrable to falling back to setTimeout since it does not have
// the minimum 4ms penalty.
// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
// Desktop to a lesser extent) that renders both setImmediate and
// MessageChannel useless for the purposes of ASAP.
// https://github.com/kriskowal/q/issues/396

// Timers are implemented universally.
// We fall back to timers in workers in most engines, and in foreground
// contexts in the following browsers.
// However, note that even this simple case requires nuances to operate in a
// broad spectrum of browsers.
//
// - Firefox 3-13
// - Internet Explorer 6-9
// - iPad Safari 4.3
// - Lynx 2.8.7
} else {
    requestFlush = makeRequestCallFromTimer(flush);
}

// `requestFlush` requests that the high priority event queue be flushed as
// soon as possible.
// This is useful to prevent an error thrown in a task from stalling the event
// queue if the exception handled by Node.js’s
// `process.on("uncaughtException")` or by a domain.
rawAsap.requestFlush = requestFlush;

// To request a high priority event, we induce a mutation observer by toggling
// the text of a text node between "1" and "-1".
function makeRequestCallFromMutationObserver(callback) {
    var toggle = 1;
    var observer = new BrowserMutationObserver(callback);
    var node = document.createTextNode("");
    observer.observe(node, {characterData: true});
    return function requestCall() {
        toggle = -toggle;
        node.data = toggle;
    };
}

// The message channel technique was discovered by Malte Ubl and was the
// original foundation for this library.
// http://www.nonblocking.io/2011/06/windownexttick.html

// Safari 6.0.5 (at least) intermittently fails to create message ports on a
// page's first load. Thankfully, this version of Safari supports
// MutationObservers, so we don't need to fall back in that case.

// function makeRequestCallFromMessageChannel(callback) {
//     var channel = new MessageChannel();
//     channel.port1.onmessage = callback;
//     return function requestCall() {
//         channel.port2.postMessage(0);
//     };
// }

// For reasons explained above, we are also unable to use `setImmediate`
// under any circumstances.
// Even if we were, there is another bug in Internet Explorer 10.
// It is not sufficient to assign `setImmediate` to `requestFlush` because
// `setImmediate` must be called *by name* and therefore must be wrapped in a
// closure.
// Never forget.

// function makeRequestCallFromSetImmediate(callback) {
//     return function requestCall() {
//         setImmediate(callback);
//     };
// }

// Safari 6.0 has a problem where timers will get lost while the user is
// scrolling. This problem does not impact ASAP because Safari 6.0 supports
// mutation observers, so that implementation is used instead.
// However, if we ever elect to use timers in Safari, the prevalent work-around
// is to add a scroll event listener that calls for a flush.

// `setTimeout` does not call the passed callback if the delay is less than
// approximately 7 in web workers in Firefox 8 through 18, and sometimes not
// even then.

function makeRequestCallFromTimer(callback) {
    return function requestCall() {
        // We dispatch a timeout with a specified delay of 0 for engines that
        // can reliably accommodate that request. This will usually be snapped
        // to a 4 milisecond delay, but once we're flushing, there's no delay
        // between events.
        var timeoutHandle = setTimeout(handleTimer, 0);
        // However, since this timer gets frequently dropped in Firefox
        // workers, we enlist an interval handle that will try to fire
        // an event 20 times per second until it succeeds.
        var intervalHandle = setInterval(handleTimer, 50);

        function handleTimer() {
            // Whichever timer succeeds will cancel both timers and
            // execute the callback.
            clearTimeout(timeoutHandle);
            clearInterval(intervalHandle);
            callback();
        }
    };
}

// This is for `asap.js` only.
// Its name will be periodically randomized to break any code that depends on
// its existence.
rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;

// ASAP was originally a nextTick shim included in Q. This was factored out
// into this ASAP package. It was later adapted to RSVP which made further
// amendments. These decisions, particularly to marginalize MessageChannel and
// to capture the MutationObserver implementation in a closure, were integrated
// back into ASAP proper.
// https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],220:[function(require,module,exports){
'use strict';
var request = require(224);
var buildQueryObject = require(221);
var isArray = Array.isArray;

function simpleExtend(obj, obj2) {
  var prop;
  for (prop in obj2) {
    obj[prop] = obj2[prop];
  }
  return obj;
}

function XMLHttpSource(jsongUrl, config) {
  this._jsongUrl = jsongUrl;
  if (typeof config === 'number') {
    var newConfig = {
      timeout: config
    };
    config = newConfig;
  }
  this._config = simpleExtend({
    timeout: 15000,
    headers: {}
  }, config || {});
}

XMLHttpSource.prototype = {
  // because javascript
  constructor: XMLHttpSource,
  /**
   * buildQueryObject helper
   */
  buildQueryObject: buildQueryObject,

  /**
   * @inheritDoc DataSource#get
   */
  get: function httpSourceGet(pathSet) {
    var method = 'GET';
    var queryObject = this.buildQueryObject(this._jsongUrl, method, {
      paths: pathSet,
      method: 'get'
    });
    var config = simpleExtend(queryObject, this._config);
    // pass context for onBeforeRequest callback
    var context = this;
    return request(method, config, context);
  },

  /**
   * @inheritDoc DataSource#set
   */
  set: function httpSourceSet(jsongEnv) {
    var method = 'POST';
    var queryObject = this.buildQueryObject(this._jsongUrl, method, {
      jsonGraph: jsongEnv,
      method: 'set'
    });
    var config = simpleExtend(queryObject, this._config);
    config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    
    // pass context for onBeforeRequest callback
    var context = this;
    return request(method, config, context);

  },

  /**
   * @inheritDoc DataSource#call
   */
  call: function httpSourceCall(callPath, args, pathSuffix, paths) {
    // arguments defaults
    args = args || [];
    pathSuffix = pathSuffix || [];
    paths = paths || [];

    var method = 'POST';
    var queryData = [];
    queryData.push('method=call');
    queryData.push('callPath=' + encodeURIComponent(JSON.stringify(callPath)));
    queryData.push('arguments=' + encodeURIComponent(JSON.stringify(args)));
    queryData.push('pathSuffixes=' + encodeURIComponent(JSON.stringify(pathSuffix)));
    queryData.push('paths=' + encodeURIComponent(JSON.stringify(paths)));

    var queryObject = this.buildQueryObject(this._jsongUrl, method, queryData.join('&'));
    var config = simpleExtend(queryObject, this._config);
    config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    
    // pass context for onBeforeRequest callback
    var context = this;
    return request(method, config, context);
  }
};
// ES6 modules
XMLHttpSource.XMLHttpSource = XMLHttpSource;
XMLHttpSource['default'] = XMLHttpSource;
// commonjs
module.exports = XMLHttpSource;

},{"221":221,"224":224}],221:[function(require,module,exports){
'use strict';
module.exports = function buildQueryObject(url, method, queryData) {
  var qData = [];
  var keys;
  var data = {url: url};
  var isQueryParamUrl = url.indexOf('?') !== -1;
  var startUrl = (isQueryParamUrl) ? '&' : '?';

  if (typeof queryData === 'string') {
    qData.push(queryData);
  } else {

    keys = Object.keys(queryData);
    keys.forEach(function (k) {
      var value = (typeof queryData[k] === 'object') ? JSON.stringify(queryData[k]) : queryData[k];
      qData.push(k + '=' + encodeURIComponent(value));
    });
  }

  if (method === 'GET') {
    data.url += startUrl + qData.join('&');
  } else {
    data.data = qData.join('&');
  }

  return data;
};

},{}],222:[function(require,module,exports){
(function (global){
'use strict';
// Get CORS support even for older IE
module.exports = function getCORSRequest() {
    var xhr = new global.XMLHttpRequest();
    if ('withCredentials' in xhr) {
        return xhr;
    } else if (!!global.XDomainRequest) {
        return new XDomainRequest();
    } else {
        throw new Error('CORS is not supported by your browser');
    }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],223:[function(require,module,exports){
(function (global){
'use strict';
module.exports = function getXMLHttpRequest() {
  var progId,
    progIds,
    i;
  if (global.XMLHttpRequest) {
    return new global.XMLHttpRequest();
  } else {
    try {
    progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];
    for (i = 0; i < 3; i++) {
      try {
        progId = progIds[i];
        if (new global.ActiveXObject(progId)) {
          break;
        }
      } catch(e) { }
    }
    return new global.ActiveXObject(progId);
    } catch (e) {
    throw new Error('XMLHttpRequest is not supported by your browser');
    }
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],224:[function(require,module,exports){
'use strict';
var getXMLHttpRequest = require(223);
var getCORSRequest = require(222);
var hasOwnProp = Object.prototype.hasOwnProperty;

var noop = function() {};

function Observable() {}

Observable.create = function(subscribe) {
  var o = new Observable();

  o.subscribe = function(onNext, onError, onCompleted) {

    var observer;
    var disposable;

    if (typeof onNext === 'function') {
        observer = {
            onNext: onNext,
            onError: (onError || noop),
            onCompleted: (onCompleted || noop)
        };
    } else {
        observer = onNext;
    }

    disposable = subscribe(observer);

    if (typeof disposable === 'function') {
      return {
        dispose: disposable
      };
    } else {
      return disposable;
    }
  };

  return o;
};

function request(method, options, context) {
  return Observable.create(function requestObserver(observer) {

    var config = {
      method: method || 'GET',
      crossDomain: false,
      async: true,
      headers: {},
      responseType: 'json'
    };

    var xhr,
      isDone,
      headers,
      header,
      prop;

    for (prop in options) {
      if (hasOwnProp.call(options, prop)) {
        config[prop] = options[prop];
      }
    }

    // Add request with Headers
    if (!config.crossDomain && !config.headers['X-Requested-With']) {
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    // allow the user to mutate the config open
    if (context.onBeforeRequest != null) {
      context.onBeforeRequest(config);
    }

    // create xhr
    try {
      xhr = config.crossDomain ? getCORSRequest() : getXMLHttpRequest();
    } catch (err) {
      observer.onError(err);
    }
    try {
      // Takes the url and opens the connection
      if (config.user) {
        xhr.open(config.method, config.url, config.async, config.user, config.password);
      } else {
        xhr.open(config.method, config.url, config.async);
      }

      // Sets timeout information
      xhr.timeout = config.timeout;

      // Anything but explicit false results in true.
      xhr.withCredentials = config.withCredentials !== false;

      // Fills the request headers
      headers = config.headers;
      for (header in headers) {
        if (hasOwnProp.call(headers, header)) {
          xhr.setRequestHeader(header, headers[header]);
        }
      }

      if (config.responseType) {
        try {
          xhr.responseType = config.responseType;
        } catch (e) {
          // WebKit added support for the json responseType value on 09/03/2013
          // https://bugs.webkit.org/show_bug.cgi?id=73648. Versions of Safari prior to 7 are
          // known to throw when setting the value "json" as the response type. Other older
          // browsers implementing the responseType
          //
          // The json response type can be ignored if not supported, because JSON payloads are
          // parsed on the client-side regardless.
          if (config.responseType !== 'json') {
            throw e;
          }
        }
      }

      xhr.onreadystatechange = function onreadystatechange(e) {
        // Complete
        if (xhr.readyState === 4) {
          if (!isDone) {
            isDone = true;
            onXhrLoad(observer, xhr, e);
          }
        }
      };

      // Timeout
      xhr.ontimeout = function ontimeout(e) {
        if (!isDone) {
          isDone = true;
          onXhrError(observer, xhr, 'timeout error', e);
        }
      };

      // Send Request
      xhr.send(config.data);

    } catch (e) {
      observer.onError(e);
    }
    // Dispose
    return function dispose() {
      // Doesn't work in IE9
      if (!isDone && xhr.readyState !== 4) {
        isDone = true;
        xhr.abort();
      }
    };//Dispose
  });
}

/*
 * General handling of ultimate failure (after appropriate retries)
 */
function _handleXhrError(observer, textStatus, errorThrown) {
  // IE9: cross-domain request may be considered errors
  if (!errorThrown) {
    errorThrown = new Error(textStatus);
  }

  observer.onError(errorThrown);
}

function onXhrLoad(observer, xhr, e) {
  var responseData,
    responseObject,
    responseType;

  // If there's no observer, the request has been (or is being) cancelled.
  if (xhr && observer) {
    responseType = xhr.responseType;
    // responseText is the old-school way of retrieving response (supported by IE8 & 9)
    // response/responseType properties were introduced in XHR Level2 spec (supported by IE10)
    responseData = ('response' in xhr) ? xhr.response : xhr.responseText;

    // normalize IE9 bug (http://bugs.jquery.com/ticket/1450)
    var status = (xhr.status === 1223) ? 204 : xhr.status;

    if (status >= 200 && status <= 399) {
      try {
        if (responseType !== 'json') {
          responseData = JSON.parse(responseData || '');
        }
        if (typeof responseData === 'string') {
          responseData = JSON.parse(responseData || '');
        }
      } catch (e) {
        _handleXhrError(observer, 'invalid json', e);
      }
      observer.onNext(responseData);
      observer.onCompleted();
      return;

    } else if (status === 401 || status === 403 || status === 407) {

      return _handleXhrError(observer, responseData);

    } else if (status === 410) {
      // TODO: Retry ?
      return _handleXhrError(observer, responseData);

    } else if (status === 408 || status === 504) {
      // TODO: Retry ?
      return _handleXhrError(observer, responseData);

    } else {

      return _handleXhrError(observer, responseData || ('Response code ' + status));

    }//if
  }//if
}//onXhrLoad

function onXhrError(observer, xhr, status, e) {
  _handleXhrError(observer, status || xhr.statusText || 'request error', e);
}

module.exports = request;

},{"222":222,"223":223}],225:[function(require,module,exports){
'use strict';

module.exports = require(230)

},{"230":230}],226:[function(require,module,exports){
'use strict';

var asap = require(219);

function noop() {}

// States:
//
// 0 - pending
// 1 - fulfilled with _value
// 2 - rejected with _value
// 3 - adopted the state of another promise, _value
//
// once the state is no longer pending (0) it is immutable

// All `_` prefixed properties will be reduced to `_{random number}`
// at build time to obfuscate them and discourage their use.
// We don't use symbols or Object.defineProperty to fully hide them
// because the performance isn't good enough.


// to avoid using try/catch inside critical functions, we
// extract them to here.
var LAST_ERROR = null;
var IS_ERROR = {};
function getThen(obj) {
  try {
    return obj.then;
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallOne(fn, a) {
  try {
    return fn(a);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}
function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

module.exports = Promise;

function Promise(fn) {
  if (typeof this !== 'object') {
    throw new TypeError('Promises must be constructed via new');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('not a function');
  }
  this._37 = 0;
  this._12 = null;
  this._59 = [];
  if (fn === noop) return;
  doResolve(fn, this);
}
Promise._99 = noop;

Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise) {
    return safeThen(this, onFulfilled, onRejected);
  }
  var res = new Promise(noop);
  handle(this, new Handler(onFulfilled, onRejected, res));
  return res;
};

function safeThen(self, onFulfilled, onRejected) {
  return new self.constructor(function (resolve, reject) {
    var res = new Promise(noop);
    res.then(resolve, reject);
    handle(self, new Handler(onFulfilled, onRejected, res));
  });
};
function handle(self, deferred) {
  while (self._37 === 3) {
    self = self._12;
  }
  if (self._37 === 0) {
    self._59.push(deferred);
    return;
  }
  asap(function() {
    var cb = self._37 === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      if (self._37 === 1) {
        resolve(deferred.promise, self._12);
      } else {
        reject(deferred.promise, self._12);
      }
      return;
    }
    var ret = tryCallOne(cb, self._12);
    if (ret === IS_ERROR) {
      reject(deferred.promise, LAST_ERROR);
    } else {
      resolve(deferred.promise, ret);
    }
  });
}
function resolve(self, newValue) {
  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === self) {
    return reject(
      self,
      new TypeError('A promise cannot be resolved with itself.')
    );
  }
  if (
    newValue &&
    (typeof newValue === 'object' || typeof newValue === 'function')
  ) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return reject(self, LAST_ERROR);
    }
    if (
      then === self.then &&
      newValue instanceof Promise
    ) {
      self._37 = 3;
      self._12 = newValue;
      finale(self);
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._37 = 1;
  self._12 = newValue;
  finale(self);
}

function reject(self, newValue) {
  self._37 = 2;
  self._12 = newValue;
  finale(self);
}
function finale(self) {
  for (var i = 0; i < self._59.length; i++) {
    handle(self, self._59[i]);
  }
  self._59 = null;
}

function Handler(onFulfilled, onRejected, promise){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, promise) {
  var done = false;
  var res = tryCallTwo(fn, function (value) {
    if (done) return;
    done = true;
    resolve(promise, value);
  }, function (reason) {
    if (done) return;
    done = true;
    reject(promise, reason);
  })
  if (!done && res === IS_ERROR) {
    done = true;
    reject(promise, LAST_ERROR);
  }
}

},{"219":219}],227:[function(require,module,exports){
'use strict';

var Promise = require(226);

module.exports = Promise;
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this;
  self.then(null, function (err) {
    setTimeout(function () {
      throw err;
    }, 0);
  });
};

},{"226":226}],228:[function(require,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require(226);

module.exports = Promise;

/* Static Functions */

var TRUE = valuePromise(true);
var FALSE = valuePromise(false);
var NULL = valuePromise(null);
var UNDEFINED = valuePromise(undefined);
var ZERO = valuePromise(0);
var EMPTYSTRING = valuePromise('');

function valuePromise(value) {
  var p = new Promise(Promise._99);
  p._37 = 1;
  p._12 = value;
  return p;
}
Promise.resolve = function (value) {
  if (value instanceof Promise) return value;

  if (value === null) return NULL;
  if (value === undefined) return UNDEFINED;
  if (value === true) return TRUE;
  if (value === false) return FALSE;
  if (value === 0) return ZERO;
  if (value === '') return EMPTYSTRING;

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then;
      if (typeof then === 'function') {
        return new Promise(then.bind(value));
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex);
      });
    }
  }
  return valuePromise(value);
};

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr);

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([]);
    var remaining = args.length;
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        if (val instanceof Promise && val.then === Promise.prototype.then) {
          while (val._37 === 3) {
            val = val._12;
          }
          if (val._37 === 1) return res(i, val._12);
          if (val._37 === 2) reject(val._12);
          val.then(function (val) {
            res(i, val);
          }, reject);
          return;
        } else {
          var then = val.then;
          if (typeof then === 'function') {
            var p = new Promise(then.bind(val));
            p.then(function (val) {
              res(i, val);
            }, reject);
            return;
          }
        }
      }
      args[i] = val;
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) {
    reject(value);
  });
};

Promise.race = function (values) {
  return new Promise(function (resolve, reject) {
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    });
  });
};

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
};

},{"226":226}],229:[function(require,module,exports){
'use strict';

var Promise = require(226);

module.exports = Promise;
Promise.prototype['finally'] = function (f) {
  return this.then(function (value) {
    return Promise.resolve(f()).then(function () {
      return value;
    });
  }, function (err) {
    return Promise.resolve(f()).then(function () {
      throw err;
    });
  });
};

},{"226":226}],230:[function(require,module,exports){
'use strict';

module.exports = require(226);
require(227);
require(229);
require(228);
require(231);

},{"226":226,"227":227,"228":228,"229":229,"231":231}],231:[function(require,module,exports){
'use strict';

// This file contains then/promise specific extensions that are only useful
// for node.js interop

var Promise = require(226);
var asap = require(218);

module.exports = Promise;

/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  argumentCount = argumentCount || Infinity;
  return function () {
    var self = this;
    var args = Array.prototype.slice.call(arguments, 0,
        argumentCount > 0 ? argumentCount : 0);
    return new Promise(function (resolve, reject) {
      args.push(function (err, res) {
        if (err) reject(err);
        else resolve(res);
      })
      var res = fn.apply(self, args);
      if (res &&
        (
          typeof res === 'object' ||
          typeof res === 'function'
        ) &&
        typeof res.then === 'function'
      ) {
        resolve(res);
      }
    })
  }
}
Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var callback =
      typeof args[args.length - 1] === 'function' ? args.pop() : null;
    var ctx = this;
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx);
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) {
          reject(ex);
        });
      } else {
        asap(function () {
          callback.call(ctx, ex);
        })
      }
    }
  }
}

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this;

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value);
    });
  }, function (err) {
    asap(function () {
      callback.call(ctx, err);
    });
  });
}

},{"218":218,"226":226}],232:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require(237);
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var InnerSubscriber = (function (_super) {
    __extends(InnerSubscriber, _super);
    function InnerSubscriber(parent, outerValue, outerIndex) {
        _super.call(this);
        this.parent = parent;
        this.outerValue = outerValue;
        this.outerIndex = outerIndex;
        this.index = 0;
    }
    InnerSubscriber.prototype._next = function (value) {
        this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++, this);
    };
    InnerSubscriber.prototype._error = function (error) {
        this.parent.notifyError(error, this);
        this.unsubscribe();
    };
    InnerSubscriber.prototype._complete = function () {
        this.parent.notifyComplete(this);
        this.unsubscribe();
    };
    return InnerSubscriber;
}(Subscriber_1.Subscriber));
exports.InnerSubscriber = InnerSubscriber;

},{"237":237}],233:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
/**
 * Represents a push-based event or value that an {@link Observable} can emit.
 * This class is particularly useful for operators that manage notifications,
 * like {@link materialize}, {@link dematerialize}, {@link observeOn}, and
 * others. Besides wrapping the actual delivered value, it also annotates it
 * with metadata of, for instance, what type of push message it is (`next`,
 * `error`, or `complete`).
 *
 * @see {@link materialize}
 * @see {@link dematerialize}
 * @see {@link observeOn}
 *
 * @class Notification<T>
 */
var Notification = (function () {
    function Notification(kind, value, exception) {
        this.kind = kind;
        this.value = value;
        this.exception = exception;
        this.hasValue = kind === 'N';
    }
    /**
     * Delivers to the given `observer` the value wrapped by this Notification.
     * @param {Observer} observer
     * @return
     */
    Notification.prototype.observe = function (observer) {
        switch (this.kind) {
            case 'N':
                return observer.next && observer.next(this.value);
            case 'E':
                return observer.error && observer.error(this.exception);
            case 'C':
                return observer.complete && observer.complete();
        }
    };
    /**
     * Given some {@link Observer} callbacks, deliver the value represented by the
     * current Notification to the correctly corresponding callback.
     * @param {function(value: T): void} next An Observer `next` callback.
     * @param {function(err: any): void} [error] An Observer `error` callback.
     * @param {function(): void} [complete] An Observer `complete` callback.
     * @return {any}
     */
    Notification.prototype.do = function (next, error, complete) {
        var kind = this.kind;
        switch (kind) {
            case 'N':
                return next && next(this.value);
            case 'E':
                return error && error(this.exception);
            case 'C':
                return complete && complete();
        }
    };
    /**
     * Takes an Observer or its individual callback functions, and calls `observe`
     * or `do` methods accordingly.
     * @param {Observer|function(value: T): void} nextOrObserver An Observer or
     * the `next` callback.
     * @param {function(err: any): void} [error] An Observer `error` callback.
     * @param {function(): void} [complete] An Observer `complete` callback.
     * @return {any}
     */
    Notification.prototype.accept = function (nextOrObserver, error, complete) {
        if (nextOrObserver && typeof nextOrObserver.next === 'function') {
            return this.observe(nextOrObserver);
        }
        else {
            return this.do(nextOrObserver, error, complete);
        }
    };
    /**
     * Returns a simple Observable that just delivers the notification represented
     * by this Notification instance.
     * @return {any}
     */
    Notification.prototype.toObservable = function () {
        var kind = this.kind;
        switch (kind) {
            case 'N':
                return Observable_1.Observable.of(this.value);
            case 'E':
                return Observable_1.Observable.throw(this.exception);
            case 'C':
                return Observable_1.Observable.empty();
        }
        throw new Error('unexpected notification kind value');
    };
    /**
     * A shortcut to create a Notification instance of the type `next` from a
     * given value.
     * @param {T} value The `next` value.
     * @return {Notification<T>} The "next" Notification representing the
     * argument.
     */
    Notification.createNext = function (value) {
        if (typeof value !== 'undefined') {
            return new Notification('N', value);
        }
        return this.undefinedValueNotification;
    };
    /**
     * A shortcut to create a Notification instance of the type `error` from a
     * given error.
     * @param {any} [err] The `error` exception.
     * @return {Notification<T>} The "error" Notification representing the
     * argument.
     */
    Notification.createError = function (err) {
        return new Notification('E', undefined, err);
    };
    /**
     * A shortcut to create a Notification instance of the type `complete`.
     * @return {Notification<any>} The valueless "complete" Notification.
     */
    Notification.createComplete = function () {
        return this.completeNotification;
    };
    Notification.completeNotification = new Notification('C');
    Notification.undefinedValueNotification = new Notification('N', undefined);
    return Notification;
}());
exports.Notification = Notification;

},{"234":234}],234:[function(require,module,exports){
"use strict";
var root_1 = require(294);
var toSubscriber_1 = require(296);
var observable_1 = require(285);
/**
 * A representation of any set of values over any amount of time. This the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
var Observable = (function () {
    /**
     * @constructor
     * @param {Function} subscribe the function that is  called when the Observable is
     * initially subscribed to. This function is given a Subscriber, to which new values
     * can be `next`ed, or an `error` method can be called to raise an error, or
     * `complete` can be called to notify of a successful completion.
     */
    function Observable(subscribe) {
        this._isScalar = false;
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    /**
     * Creates a new Observable, with this Observable as the source, and the passed
     * operator defined as the new observable's operator.
     * @method lift
     * @param {Operator} operator the operator defining the operation to take on the observable
     * @return {Observable} a new observable with the Operator applied
     */
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    /**
     * Registers handlers for handling emitted values, error and completions from the observable, and
     *  executes the observable's subscriber function, which will take action to set up the underlying data stream
     * @method subscribe
     * @param {PartialObserver|Function} observerOrNext (optional) either an observer defining all functions to be called,
     *  or the first of three possible handlers, which is the handler for each value emitted from the observable.
     * @param {Function} error (optional) a handler for a terminal event resulting from an error. If no error handler is provided,
     *  the error will be thrown as unhandled
     * @param {Function} complete (optional) a handler for a terminal event resulting from successful completion.
     * @return {ISubscription} a subscription reference to the registered handlers
     */
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var operator = this.operator;
        var sink = toSubscriber_1.toSubscriber(observerOrNext, error, complete);
        if (operator) {
            operator.call(sink, this);
        }
        else {
            sink.add(this._subscribe(sink));
        }
        if (sink.syncErrorThrowable) {
            sink.syncErrorThrowable = false;
            if (sink.syncErrorThrown) {
                throw sink.syncErrorValue;
            }
        }
        return sink;
    };
    /**
     * @method forEach
     * @param {Function} next a handler for each value emitted by the observable
     * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise
     * @return {Promise} a promise that either resolves on observable completion or
     *  rejects with the handled error
     */
    Observable.prototype.forEach = function (next, PromiseCtor) {
        var _this = this;
        if (!PromiseCtor) {
            if (root_1.root.Rx && root_1.root.Rx.config && root_1.root.Rx.config.Promise) {
                PromiseCtor = root_1.root.Rx.config.Promise;
            }
            else if (root_1.root.Promise) {
                PromiseCtor = root_1.root.Promise;
            }
        }
        if (!PromiseCtor) {
            throw new Error('no Promise impl found');
        }
        return new PromiseCtor(function (resolve, reject) {
            var subscription = _this.subscribe(function (value) {
                if (subscription) {
                    // if there is a subscription, then we can surmise
                    // the next handling is asynchronous. Any errors thrown
                    // need to be rejected explicitly and unsubscribe must be
                    // called manually
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        subscription.unsubscribe();
                    }
                }
                else {
                    // if there is NO subscription, then we're getting a nexted
                    // value synchronously during subscription. We can just call it.
                    // If it errors, Observable's `subscribe` will ensure the
                    // unsubscription logic is called, then synchronously rethrow the error.
                    // After that, Promise will trap the error and send it
                    // down the rejection path.
                    next(value);
                }
            }, reject, resolve);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        return this.source.subscribe(subscriber);
    };
    /**
     * An interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
     * @method Symbol.observable
     * @return {Observable} this instance of the observable
     */
    Observable.prototype[observable_1.$$observable] = function () {
        return this;
    };
    // HACK: Since TypeScript inherits static properties too, we have to
    // fight against TypeScript here so Subject can have a different static create signature
    /**
     * Creates a new cold Observable by calling the Observable constructor
     * @static true
     * @owner Observable
     * @method create
     * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
     * @return {Observable} a new cold observable
     */
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());
exports.Observable = Observable;

},{"285":285,"294":294,"296":296}],235:[function(require,module,exports){
"use strict";
exports.empty = {
    closed: true,
    next: function (value) { },
    error: function (err) { throw err; },
    complete: function () { }
};

},{}],236:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require(237);
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var OuterSubscriber = (function (_super) {
    __extends(OuterSubscriber, _super);
    function OuterSubscriber() {
        _super.apply(this, arguments);
    }
    OuterSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        this.destination.next(innerValue);
    };
    OuterSubscriber.prototype.notifyError = function (error, innerSub) {
        this.destination.error(error);
    };
    OuterSubscriber.prototype.notifyComplete = function (innerSub) {
        this.destination.complete();
    };
    return OuterSubscriber;
}(Subscriber_1.Subscriber));
exports.OuterSubscriber = OuterSubscriber;

},{"237":237}],237:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var isFunction_1 = require(290);
var Subscription_1 = require(238);
var Observer_1 = require(235);
var rxSubscriber_1 = require(286);
/**
 * Implements the {@link Observer} interface and extends the
 * {@link Subscription} class. While the {@link Observer} is the public API for
 * consuming the values of an {@link Observable}, all Observers get converted to
 * a Subscriber, in order to provide Subscription-like capabilities such as
 * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for
 * implementing operators, but it is rarely used as a public API.
 *
 * @class Subscriber<T>
 */
var Subscriber = (function (_super) {
    __extends(Subscriber, _super);
    /**
     * @param {Observer|function(value: T): void} [destinationOrNext] A partially
     * defined Observer or a `next` callback function.
     * @param {function(e: ?any): void} [error] The `error` callback of an
     * Observer.
     * @param {function(): void} [complete] The `complete` callback of an
     * Observer.
     */
    function Subscriber(destinationOrNext, error, complete) {
        _super.call(this);
        this.syncErrorValue = null;
        this.syncErrorThrown = false;
        this.syncErrorThrowable = false;
        this.isStopped = false;
        switch (arguments.length) {
            case 0:
                this.destination = Observer_1.empty;
                break;
            case 1:
                if (!destinationOrNext) {
                    this.destination = Observer_1.empty;
                    break;
                }
                if (typeof destinationOrNext === 'object') {
                    if (destinationOrNext instanceof Subscriber) {
                        this.destination = destinationOrNext;
                        this.destination.add(this);
                    }
                    else {
                        this.syncErrorThrowable = true;
                        this.destination = new SafeSubscriber(this, destinationOrNext);
                    }
                    break;
                }
            default:
                this.syncErrorThrowable = true;
                this.destination = new SafeSubscriber(this, destinationOrNext, error, complete);
                break;
        }
    }
    Subscriber.prototype[rxSubscriber_1.$$rxSubscriber] = function () { return this; };
    /**
     * A static factory for a Subscriber, given a (potentially partial) definition
     * of an Observer.
     * @param {function(x: ?T): void} [next] The `next` callback of an Observer.
     * @param {function(e: ?any): void} [error] The `error` callback of an
     * Observer.
     * @param {function(): void} [complete] The `complete` callback of an
     * Observer.
     * @return {Subscriber<T>} A Subscriber wrapping the (partially defined)
     * Observer represented by the given arguments.
     */
    Subscriber.create = function (next, error, complete) {
        var subscriber = new Subscriber(next, error, complete);
        subscriber.syncErrorThrowable = false;
        return subscriber;
    };
    /**
     * The {@link Observer} callback to receive notifications of type `next` from
     * the Observable, with a value. The Observable may call this method 0 or more
     * times.
     * @param {T} [value] The `next` value.
     * @return {void}
     */
    Subscriber.prototype.next = function (value) {
        if (!this.isStopped) {
            this._next(value);
        }
    };
    /**
     * The {@link Observer} callback to receive notifications of type `error` from
     * the Observable, with an attached {@link Error}. Notifies the Observer that
     * the Observable has experienced an error condition.
     * @param {any} [err] The `error` exception.
     * @return {void}
     */
    Subscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            this.isStopped = true;
            this._error(err);
        }
    };
    /**
     * The {@link Observer} callback to receive a valueless notification of type
     * `complete` from the Observable. Notifies the Observer that the Observable
     * has finished sending push-based notifications.
     * @return {void}
     */
    Subscriber.prototype.complete = function () {
        if (!this.isStopped) {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (this.closed) {
            return;
        }
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        this.destination.error(err);
        this.unsubscribe();
    };
    Subscriber.prototype._complete = function () {
        this.destination.complete();
        this.unsubscribe();
    };
    return Subscriber;
}(Subscription_1.Subscription));
exports.Subscriber = Subscriber;
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var SafeSubscriber = (function (_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(_parent, observerOrNext, error, complete) {
        _super.call(this);
        this._parent = _parent;
        var next;
        var context = this;
        if (isFunction_1.isFunction(observerOrNext)) {
            next = observerOrNext;
        }
        else if (observerOrNext) {
            context = observerOrNext;
            next = observerOrNext.next;
            error = observerOrNext.error;
            complete = observerOrNext.complete;
            if (isFunction_1.isFunction(context.unsubscribe)) {
                this.add(context.unsubscribe.bind(context));
            }
            context.unsubscribe = this.unsubscribe.bind(this);
        }
        this._context = context;
        this._next = next;
        this._error = error;
        this._complete = complete;
    }
    SafeSubscriber.prototype.next = function (value) {
        if (!this.isStopped && this._next) {
            var _parent = this._parent;
            if (!_parent.syncErrorThrowable) {
                this.__tryOrUnsub(this._next, value);
            }
            else if (this.__tryOrSetError(_parent, this._next, value)) {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var _parent = this._parent;
            if (this._error) {
                if (!_parent.syncErrorThrowable) {
                    this.__tryOrUnsub(this._error, err);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parent, this._error, err);
                    this.unsubscribe();
                }
            }
            else if (!_parent.syncErrorThrowable) {
                this.unsubscribe();
                throw err;
            }
            else {
                _parent.syncErrorValue = err;
                _parent.syncErrorThrown = true;
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.complete = function () {
        if (!this.isStopped) {
            var _parent = this._parent;
            if (this._complete) {
                if (!_parent.syncErrorThrowable) {
                    this.__tryOrUnsub(this._complete);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parent, this._complete);
                    this.unsubscribe();
                }
            }
            else {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            this.unsubscribe();
            throw err;
        }
    };
    SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            parent.syncErrorValue = err;
            parent.syncErrorThrown = true;
            return true;
        }
        return false;
    };
    SafeSubscriber.prototype._unsubscribe = function () {
        var _parent = this._parent;
        this._context = null;
        this._parent = null;
        _parent.unsubscribe();
    };
    return SafeSubscriber;
}(Subscriber));

},{"235":235,"238":238,"286":286,"290":290}],238:[function(require,module,exports){
"use strict";
var isArray_1 = require(289);
var isObject_1 = require(291);
var isFunction_1 = require(290);
var tryCatch_1 = require(297);
var errorObject_1 = require(288);
var UnsubscriptionError_1 = require(287);
/**
 * Represents a disposable resource, such as the execution of an Observable. A
 * Subscription has one important method, `unsubscribe`, that takes no argument
 * and just disposes the resource held by the subscription.
 *
 * Additionally, subscriptions may be grouped together through the `add()`
 * method, which will attach a child Subscription to the current Subscription.
 * When a Subscription is unsubscribed, all its children (and its grandchildren)
 * will be unsubscribed as well.
 *
 * @class Subscription
 */
var Subscription = (function () {
    /**
     * @param {function(): void} [unsubscribe] A function describing how to
     * perform the disposal of resources when the `unsubscribe` method is called.
     */
    function Subscription(unsubscribe) {
        /**
         * A flag to indicate whether this Subscription has already been unsubscribed.
         * @type {boolean}
         */
        this.closed = false;
        if (unsubscribe) {
            this._unsubscribe = unsubscribe;
        }
    }
    /**
     * Disposes the resources held by the subscription. May, for instance, cancel
     * an ongoing Observable execution or cancel any other type of work that
     * started when the Subscription was created.
     * @return {void}
     */
    Subscription.prototype.unsubscribe = function () {
        var hasErrors = false;
        var errors;
        if (this.closed) {
            return;
        }
        this.closed = true;
        var _a = this, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
        this._subscriptions = null;
        if (isFunction_1.isFunction(_unsubscribe)) {
            var trial = tryCatch_1.tryCatch(_unsubscribe).call(this);
            if (trial === errorObject_1.errorObject) {
                hasErrors = true;
                (errors = errors || []).push(errorObject_1.errorObject.e);
            }
        }
        if (isArray_1.isArray(_subscriptions)) {
            var index = -1;
            var len = _subscriptions.length;
            while (++index < len) {
                var sub = _subscriptions[index];
                if (isObject_1.isObject(sub)) {
                    var trial = tryCatch_1.tryCatch(sub.unsubscribe).call(sub);
                    if (trial === errorObject_1.errorObject) {
                        hasErrors = true;
                        errors = errors || [];
                        var err = errorObject_1.errorObject.e;
                        if (err instanceof UnsubscriptionError_1.UnsubscriptionError) {
                            errors = errors.concat(err.errors);
                        }
                        else {
                            errors.push(err);
                        }
                    }
                }
            }
        }
        if (hasErrors) {
            throw new UnsubscriptionError_1.UnsubscriptionError(errors);
        }
    };
    /**
     * Adds a tear down to be called during the unsubscribe() of this
     * Subscription.
     *
     * If the tear down being added is a subscription that is already
     * unsubscribed, is the same reference `add` is being called on, or is
     * `Subscription.EMPTY`, it will not be added.
     *
     * If this subscription is already in an `closed` state, the passed
     * tear down logic will be executed immediately.
     *
     * @param {TeardownLogic} teardown The additional logic to execute on
     * teardown.
     * @return {Subscription} Returns the Subscription used or created to be
     * added to the inner subscriptions list. This Subscription can be used with
     * `remove()` to remove the passed teardown logic from the inner subscriptions
     * list.
     */
    Subscription.prototype.add = function (teardown) {
        if (!teardown || (teardown === Subscription.EMPTY)) {
            return Subscription.EMPTY;
        }
        if (teardown === this) {
            return this;
        }
        var sub = teardown;
        switch (typeof teardown) {
            case 'function':
                sub = new Subscription(teardown);
            case 'object':
                if (sub.closed || typeof sub.unsubscribe !== 'function') {
                    break;
                }
                else if (this.closed) {
                    sub.unsubscribe();
                }
                else {
                    (this._subscriptions || (this._subscriptions = [])).push(sub);
                }
                break;
            default:
                throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
        }
        return sub;
    };
    /**
     * Removes a Subscription from the internal list of subscriptions that will
     * unsubscribe during the unsubscribe process of this Subscription.
     * @param {Subscription} subscription The subscription to remove.
     * @return {void}
     */
    Subscription.prototype.remove = function (subscription) {
        // HACK: This might be redundant because of the logic in `add()`
        if (subscription == null || (subscription === this) || (subscription === Subscription.EMPTY)) {
            return;
        }
        var subscriptions = this._subscriptions;
        if (subscriptions) {
            var subscriptionIndex = subscriptions.indexOf(subscription);
            if (subscriptionIndex !== -1) {
                subscriptions.splice(subscriptionIndex, 1);
            }
        }
    };
    Subscription.EMPTY = (function (empty) {
        empty.closed = true;
        return empty;
    }(new Subscription()));
    return Subscription;
}());
exports.Subscription = Subscription;

},{"287":287,"288":288,"289":289,"290":290,"291":291,"297":297}],239:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var defer_1 = require(265);
Observable_1.Observable.defer = defer_1.defer;

},{"234":234,"265":265}],240:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var empty_1 = require(266);
Observable_1.Observable.empty = empty_1.empty;

},{"234":234,"266":266}],241:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var from_1 = require(267);
Observable_1.Observable.from = from_1.from;

},{"234":234,"267":267}],242:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var fromPromise_1 = require(268);
Observable_1.Observable.fromPromise = fromPromise_1.fromPromise;

},{"234":234,"268":268}],243:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var of_1 = require(269);
Observable_1.Observable.of = of_1.of;

},{"234":234,"269":269}],244:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var throw_1 = require(270);
Observable_1.Observable.throw = throw_1._throw;

},{"234":234,"270":270}],245:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var catch_1 = require(271);
Observable_1.Observable.prototype.catch = catch_1._catch;

},{"234":234,"271":271}],246:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var concat_1 = require(272);
Observable_1.Observable.prototype.concat = concat_1.concat;

},{"234":234,"272":272}],247:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var defaultIfEmpty_1 = require(273);
Observable_1.Observable.prototype.defaultIfEmpty = defaultIfEmpty_1.defaultIfEmpty;

},{"234":234,"273":273}],248:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var do_1 = require(274);
Observable_1.Observable.prototype.do = do_1._do;

},{"234":234,"274":274}],249:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var expand_1 = require(275);
Observable_1.Observable.prototype.expand = expand_1.expand;

},{"234":234,"275":275}],250:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var filter_1 = require(276);
Observable_1.Observable.prototype.filter = filter_1.filter;

},{"234":234,"276":276}],251:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var map_1 = require(277);
Observable_1.Observable.prototype.map = map_1.map;

},{"234":234,"277":277}],252:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var materialize_1 = require(278);
Observable_1.Observable.prototype.materialize = materialize_1.materialize;

},{"234":234,"278":278}],253:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var mergeMap_1 = require(280);
Observable_1.Observable.prototype.mergeMap = mergeMap_1.mergeMap;
Observable_1.Observable.prototype.flatMap = mergeMap_1.mergeMap;

},{"234":234,"280":280}],254:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var reduce_1 = require(282);
Observable_1.Observable.prototype.reduce = reduce_1.reduce;

},{"234":234,"282":282}],255:[function(require,module,exports){
"use strict";
var Observable_1 = require(234);
var toArray_1 = require(283);
Observable_1.Observable.prototype.toArray = toArray_1.toArray;

},{"234":234,"283":283}],256:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require(234);
var ScalarObservable_1 = require(264);
var EmptyObservable_1 = require(259);
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var ArrayLikeObservable = (function (_super) {
    __extends(ArrayLikeObservable, _super);
    function ArrayLikeObservable(arrayLike, scheduler) {
        _super.call(this);
        this.arrayLike = arrayLike;
        this.scheduler = scheduler;
        if (!scheduler && arrayLike.length === 1) {
            this._isScalar = true;
            this.value = arrayLike[0];
        }
    }
    ArrayLikeObservable.create = function (arrayLike, scheduler) {
        var length = arrayLike.length;
        if (length === 0) {
            return new EmptyObservable_1.EmptyObservable();
        }
        else if (length === 1) {
            return new ScalarObservable_1.ScalarObservable(arrayLike[0], scheduler);
        }
        else {
            return new ArrayLikeObservable(arrayLike, scheduler);
        }
    };
    ArrayLikeObservable.dispatch = function (state) {
        var arrayLike = state.arrayLike, index = state.index, length = state.length, subscriber = state.subscriber;
        if (subscriber.closed) {
            return;
        }
        if (index >= length) {
            subscriber.complete();
            return;
        }
        subscriber.next(arrayLike[index]);
        state.index = index + 1;
        this.schedule(state);
    };
    ArrayLikeObservable.prototype._subscribe = function (subscriber) {
        var index = 0;
        var _a = this, arrayLike = _a.arrayLike, scheduler = _a.scheduler;
        var length = arrayLike.length;
        if (scheduler) {
            return scheduler.schedule(ArrayLikeObservable.dispatch, 0, {
                arrayLike: arrayLike, index: index, length: length, subscriber: subscriber
            });
        }
        else {
            for (var i = 0; i < length && !subscriber.closed; i++) {
                subscriber.next(arrayLike[i]);
            }
            subscriber.complete();
        }
    };
    return ArrayLikeObservable;
}(Observable_1.Observable));
exports.ArrayLikeObservable = ArrayLikeObservable;

},{"234":234,"259":259,"264":264}],257:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require(234);
var ScalarObservable_1 = require(264);
var EmptyObservable_1 = require(259);
var isScheduler_1 = require(293);
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var ArrayObservable = (function (_super) {
    __extends(ArrayObservable, _super);
    function ArrayObservable(array, scheduler) {
        _super.call(this);
        this.array = array;
        this.scheduler = scheduler;
        if (!scheduler && array.length === 1) {
            this._isScalar = true;
            this.value = array[0];
        }
    }
    ArrayObservable.create = function (array, scheduler) {
        return new ArrayObservable(array, scheduler);
    };
    /**
     * Creates an Observable that emits some values you specify as arguments,
     * immediately one after the other, and then emits a complete notification.
     *
     * <span class="informal">Emits the arguments you provide, then completes.
     * </span>
     *
     * <img src="./img/of.png" width="100%">
     *
     * This static operator is useful for creating a simple Observable that only
     * emits the arguments given, and the complete notification thereafter. It can
     * be used for composing with other Observables, such as with {@link concat}.
     * By default, it uses a `null` Scheduler, which means the `next`
     * notifications are sent synchronously, although with a different Scheduler
     * it is possible to determine when those notifications will be delivered.
     *
     * @example <caption>Emit 10, 20, 30, then 'a', 'b', 'c', then start ticking every second.</caption>
     * var numbers = Rx.Observable.of(10, 20, 30);
     * var letters = Rx.Observable.of('a', 'b', 'c');
     * var interval = Rx.Observable.interval(1000);
     * var result = numbers.concat(letters).concat(interval);
     * result.subscribe(x => console.log(x));
     *
     * @see {@link create}
     * @see {@link empty}
     * @see {@link never}
     * @see {@link throw}
     *
     * @param {...T} values Arguments that represent `next` values to be emitted.
     * @param {Scheduler} [scheduler] A {@link Scheduler} to use for scheduling
     * the emissions of the `next` notifications.
     * @return {Observable<T>} An Observable that emits each given input value.
     * @static true
     * @name of
     * @owner Observable
     */
    ArrayObservable.of = function () {
        var array = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            array[_i - 0] = arguments[_i];
        }
        var scheduler = array[array.length - 1];
        if (isScheduler_1.isScheduler(scheduler)) {
            array.pop();
        }
        else {
            scheduler = null;
        }
        var len = array.length;
        if (len > 1) {
            return new ArrayObservable(array, scheduler);
        }
        else if (len === 1) {
            return new ScalarObservable_1.ScalarObservable(array[0], scheduler);
        }
        else {
            return new EmptyObservable_1.EmptyObservable(scheduler);
        }
    };
    ArrayObservable.dispatch = function (state) {
        var array = state.array, index = state.index, count = state.count, subscriber = state.subscriber;
        if (index >= count) {
            subscriber.complete();
            return;
        }
        subscriber.next(array[index]);
        if (subscriber.closed) {
            return;
        }
        state.index = index + 1;
        this.schedule(state);
    };
    ArrayObservable.prototype._subscribe = function (subscriber) {
        var index = 0;
        var array = this.array;
        var count = array.length;
        var scheduler = this.scheduler;
        if (scheduler) {
            return scheduler.schedule(ArrayObservable.dispatch, 0, {
                array: array, index: index, count: count, subscriber: subscriber
            });
        }
        else {
            for (var i = 0; i < count && !subscriber.closed; i++) {
                subscriber.next(array[i]);
            }
            subscriber.complete();
        }
    };
    return ArrayObservable;
}(Observable_1.Observable));
exports.ArrayObservable = ArrayObservable;

},{"234":234,"259":259,"264":264,"293":293}],258:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require(234);
var subscribeToResult_1 = require(295);
var OuterSubscriber_1 = require(236);
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var DeferObservable = (function (_super) {
    __extends(DeferObservable, _super);
    function DeferObservable(observableFactory) {
        _super.call(this);
        this.observableFactory = observableFactory;
    }
    /**
     * Creates an Observable that, on subscribe, calls an Observable factory to
     * make an Observable for each new Observer.
     *
     * <span class="informal">Creates the Observable lazily, that is, only when it
     * is subscribed.
     * </span>
     *
     * <img src="./img/defer.png" width="100%">
     *
     * `defer` allows you to create the Observable only when the Observer
     * subscribes, and create a fresh Observable for each Observer. It waits until
     * an Observer subscribes to it, and then it generates an Observable,
     * typically with an Observable factory function. It does this afresh for each
     * subscriber, so although each subscriber may think it is subscribing to the
     * same Observable, in fact each subscriber gets its own individual
     * Observable.
     *
     * @example <caption>Subscribe to either an Observable of clicks or an Observable of interval, at random</caption>
     * var clicksOrInterval = Rx.Observable.defer(function () {
     *   if (Math.random() > 0.5) {
     *     return Rx.Observable.fromEvent(document, 'click');
     *   } else {
     *     return Rx.Observable.interval(1000);
     *   }
     * });
     * clicksOrInterval.subscribe(x => console.log(x));
     *
     * @see {@link create}
     *
     * @param {function(): Observable|Promise} observableFactory The Observable
     * factory function to invoke for each Observer that subscribes to the output
     * Observable. May also return a Promise, which will be converted on the fly
     * to an Observable.
     * @return {Observable} An Observable whose Observers' subscriptions trigger
     * an invocation of the given Observable factory function.
     * @static true
     * @name defer
     * @owner Observable
     */
    DeferObservable.create = function (observableFactory) {
        return new DeferObservable(observableFactory);
    };
    DeferObservable.prototype._subscribe = function (subscriber) {
        return new DeferSubscriber(subscriber, this.observableFactory);
    };
    return DeferObservable;
}(Observable_1.Observable));
exports.DeferObservable = DeferObservable;
var DeferSubscriber = (function (_super) {
    __extends(DeferSubscriber, _super);
    function DeferSubscriber(destination, factory) {
        _super.call(this, destination);
        this.factory = factory;
        this.tryDefer();
    }
    DeferSubscriber.prototype.tryDefer = function () {
        try {
            this._callFactory();
        }
        catch (err) {
            this._error(err);
        }
    };
    DeferSubscriber.prototype._callFactory = function () {
        var result = this.factory();
        if (result) {
            this.add(subscribeToResult_1.subscribeToResult(this, result));
        }
    };
    return DeferSubscriber;
}(OuterSubscriber_1.OuterSubscriber));

},{"234":234,"236":236,"295":295}],259:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require(234);
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var EmptyObservable = (function (_super) {
    __extends(EmptyObservable, _super);
    function EmptyObservable(scheduler) {
        _super.call(this);
        this.scheduler = scheduler;
    }
    /**
     * Creates an Observable that emits no items to the Observer and immediately
     * emits a complete notification.
     *
     * <span class="informal">Just emits 'complete', and nothing else.
     * </span>
     *
     * <img src="./img/empty.png" width="100%">
     *
     * This static operator is useful for creating a simple Observable that only
     * emits the complete notification. It can be used for composing with other
     * Observables, such as in a {@link mergeMap}.
     *
     * @example <caption>Emit the number 7, then complete.</caption>
     * var result = Rx.Observable.empty().startWith(7);
     * result.subscribe(x => console.log(x));
     *
     * @example <caption>Map and flatten only odd numbers to the sequence 'a', 'b', 'c'</caption>
     * var interval = Rx.Observable.interval(1000);
     * var result = interval.mergeMap(x =>
     *   x % 2 === 1 ? Rx.Observable.of('a', 'b', 'c') : Rx.Observable.empty()
     * );
     * result.subscribe(x => console.log(x));
     *
     * @see {@link create}
     * @see {@link never}
     * @see {@link of}
     * @see {@link throw}
     *
     * @param {Scheduler} [scheduler] A {@link Scheduler} to use for scheduling
     * the emission of the complete notification.
     * @return {Observable} An "empty" Observable: emits only the complete
     * notification.
     * @static true
     * @name empty
     * @owner Observable
     */
    EmptyObservable.create = function (scheduler) {
        return new EmptyObservable(scheduler);
    };
    EmptyObservable.dispatch = function (arg) {
        var subscriber = arg.subscriber;
        subscriber.complete();
    };
    EmptyObservable.prototype._subscribe = function (subscriber) {
        var scheduler = this.scheduler;
        if (scheduler) {
            return scheduler.schedule(EmptyObservable.dispatch, 0, { subscriber: subscriber });
        }
        else {
            subscriber.complete();
        }
    };
    return EmptyObservable;
}(Observable_1.Observable));
exports.EmptyObservable = EmptyObservable;

},{"234":234}],260:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require(234);
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var ErrorObservable = (function (_super) {
    __extends(ErrorObservable, _super);
    function ErrorObservable(error, scheduler) {
        _super.call(this);
        this.error = error;
        this.scheduler = scheduler;
    }
    /**
     * Creates an Observable that emits no items to the Observer and immediately
     * emits an error notification.
     *
     * <span class="informal">Just emits 'error', and nothing else.
     * </span>
     *
     * <img src="./img/throw.png" width="100%">
     *
     * This static operator is useful for creating a simple Observable that only
     * emits the error notification. It can be used for composing with other
     * Observables, such as in a {@link mergeMap}.
     *
     * @example <caption>Emit the number 7, then emit an error.</caption>
     * var result = Rx.Observable.throw(new Error('oops!')).startWith(7);
     * result.subscribe(x => console.log(x), e => console.error(e));
     *
     * @example <caption>Map and flattens numbers to the sequence 'a', 'b', 'c', but throw an error for 13</caption>
     * var interval = Rx.Observable.interval(1000);
     * var result = interval.mergeMap(x =>
     *   x === 13 ?
     *     Rx.Observable.throw('Thirteens are bad') :
     *     Rx.Observable.of('a', 'b', 'c')
     * );
     * result.subscribe(x => console.log(x), e => console.error(e));
     *
     * @see {@link create}
     * @see {@link empty}
     * @see {@link never}
     * @see {@link of}
     *
     * @param {any} error The particular Error to pass to the error notification.
     * @param {Scheduler} [scheduler] A {@link Scheduler} to use for scheduling
     * the emission of the error notification.
     * @return {Observable} An error Observable: emits only the error notification
     * using the given error argument.
     * @static true
     * @name throw
     * @owner Observable
     */
    ErrorObservable.create = function (error, scheduler) {
        return new ErrorObservable(error, scheduler);
    };
    ErrorObservable.dispatch = function (arg) {
        var error = arg.error, subscriber = arg.subscriber;
        subscriber.error(error);
    };
    ErrorObservable.prototype._subscribe = function (subscriber) {
        var error = this.error;
        var scheduler = this.scheduler;
        if (scheduler) {
            return scheduler.schedule(ErrorObservable.dispatch, 0, {
                error: error, subscriber: subscriber
            });
        }
        else {
            subscriber.error(error);
        }
    };
    return ErrorObservable;
}(Observable_1.Observable));
exports.ErrorObservable = ErrorObservable;

},{"234":234}],261:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var isArray_1 = require(289);
var isPromise_1 = require(292);
var PromiseObservable_1 = require(263);
var IteratorObservable_1 = require(262);
var ArrayObservable_1 = require(257);
var ArrayLikeObservable_1 = require(256);
var iterator_1 = require(284);
var Observable_1 = require(234);
var observeOn_1 = require(281);
var observable_1 = require(285);
var isArrayLike = (function (x) { return x && typeof x.length === 'number'; });
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var FromObservable = (function (_super) {
    __extends(FromObservable, _super);
    function FromObservable(ish, scheduler) {
        _super.call(this, null);
        this.ish = ish;
        this.scheduler = scheduler;
    }
    /**
     * Creates an Observable from an Array, an array-like object, a Promise, an
     * iterable object, or an Observable-like object.
     *
     * <span class="informal">Converts almost anything to an Observable.</span>
     *
     * <img src="./img/from.png" width="100%">
     *
     * Convert various other objects and data types into Observables. `from`
     * converts a Promise or an array-like or an
     * [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterable)
     * object into an Observable that emits the items in that promise or array or
     * iterable. A String, in this context, is treated as an array of characters.
     * Observable-like objects (contains a function named with the ES2015 Symbol
     * for Observable) can also be converted through this operator.
     *
     * @example <caption>Converts an array to an Observable</caption>
     * var array = [10, 20, 30];
     * var result = Rx.Observable.from(array);
     * result.subscribe(x => console.log(x));
     *
     * @example <caption>Convert an infinite iterable (from a generator) to an Observable</caption>
     * function* generateDoubles(seed) {
     *   var i = seed;
     *   while (true) {
     *     yield i;
     *     i = 2 * i; // double it
     *   }
     * }
     *
     * var iterator = generateDoubles(3);
     * var result = Rx.Observable.from(iterator).take(10);
     * result.subscribe(x => console.log(x));
     *
     * @see {@link create}
     * @see {@link fromEvent}
     * @see {@link fromEventPattern}
     * @see {@link fromPromise}
     *
     * @param {ObservableInput<T>} ish A subscribable object, a Promise, an
     * Observable-like, an Array, an iterable or an array-like object to be
     * converted.
     * @param {Scheduler} [scheduler] The scheduler on which to schedule the
     * emissions of values.
     * @return {Observable<T>} The Observable whose values are originally from the
     * input object that was converted.
     * @static true
     * @name from
     * @owner Observable
     */
    FromObservable.create = function (ish, scheduler) {
        if (ish != null) {
            if (typeof ish[observable_1.$$observable] === 'function') {
                if (ish instanceof Observable_1.Observable && !scheduler) {
                    return ish;
                }
                return new FromObservable(ish, scheduler);
            }
            else if (isArray_1.isArray(ish)) {
                return new ArrayObservable_1.ArrayObservable(ish, scheduler);
            }
            else if (isPromise_1.isPromise(ish)) {
                return new PromiseObservable_1.PromiseObservable(ish, scheduler);
            }
            else if (typeof ish[iterator_1.$$iterator] === 'function' || typeof ish === 'string') {
                return new IteratorObservable_1.IteratorObservable(ish, scheduler);
            }
            else if (isArrayLike(ish)) {
                return new ArrayLikeObservable_1.ArrayLikeObservable(ish, scheduler);
            }
        }
        throw new TypeError((ish !== null && typeof ish || ish) + ' is not observable');
    };
    FromObservable.prototype._subscribe = function (subscriber) {
        var ish = this.ish;
        var scheduler = this.scheduler;
        if (scheduler == null) {
            return ish[observable_1.$$observable]().subscribe(subscriber);
        }
        else {
            return ish[observable_1.$$observable]().subscribe(new observeOn_1.ObserveOnSubscriber(subscriber, scheduler, 0));
        }
    };
    return FromObservable;
}(Observable_1.Observable));
exports.FromObservable = FromObservable;

},{"234":234,"256":256,"257":257,"262":262,"263":263,"281":281,"284":284,"285":285,"289":289,"292":292}],262:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var root_1 = require(294);
var Observable_1 = require(234);
var iterator_1 = require(284);
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var IteratorObservable = (function (_super) {
    __extends(IteratorObservable, _super);
    function IteratorObservable(iterator, scheduler) {
        _super.call(this);
        this.scheduler = scheduler;
        if (iterator == null) {
            throw new Error('iterator cannot be null.');
        }
        this.iterator = getIterator(iterator);
    }
    IteratorObservable.create = function (iterator, scheduler) {
        return new IteratorObservable(iterator, scheduler);
    };
    IteratorObservable.dispatch = function (state) {
        var index = state.index, hasError = state.hasError, iterator = state.iterator, subscriber = state.subscriber;
        if (hasError) {
            subscriber.error(state.error);
            return;
        }
        var result = iterator.next();
        if (result.done) {
            subscriber.complete();
            return;
        }
        subscriber.next(result.value);
        state.index = index + 1;
        if (subscriber.closed) {
            return;
        }
        this.schedule(state);
    };
    IteratorObservable.prototype._subscribe = function (subscriber) {
        var index = 0;
        var _a = this, iterator = _a.iterator, scheduler = _a.scheduler;
        if (scheduler) {
            return scheduler.schedule(IteratorObservable.dispatch, 0, {
                index: index, iterator: iterator, subscriber: subscriber
            });
        }
        else {
            do {
                var result = iterator.next();
                if (result.done) {
                    subscriber.complete();
                    break;
                }
                else {
                    subscriber.next(result.value);
                }
                if (subscriber.closed) {
                    break;
                }
            } while (true);
        }
    };
    return IteratorObservable;
}(Observable_1.Observable));
exports.IteratorObservable = IteratorObservable;
var StringIterator = (function () {
    function StringIterator(str, idx, len) {
        if (idx === void 0) { idx = 0; }
        if (len === void 0) { len = str.length; }
        this.str = str;
        this.idx = idx;
        this.len = len;
    }
    StringIterator.prototype[iterator_1.$$iterator] = function () { return (this); };
    StringIterator.prototype.next = function () {
        return this.idx < this.len ? {
            done: false,
            value: this.str.charAt(this.idx++)
        } : {
            done: true,
            value: undefined
        };
    };
    return StringIterator;
}());
var ArrayIterator = (function () {
    function ArrayIterator(arr, idx, len) {
        if (idx === void 0) { idx = 0; }
        if (len === void 0) { len = toLength(arr); }
        this.arr = arr;
        this.idx = idx;
        this.len = len;
    }
    ArrayIterator.prototype[iterator_1.$$iterator] = function () { return this; };
    ArrayIterator.prototype.next = function () {
        return this.idx < this.len ? {
            done: false,
            value: this.arr[this.idx++]
        } : {
            done: true,
            value: undefined
        };
    };
    return ArrayIterator;
}());
function getIterator(obj) {
    var i = obj[iterator_1.$$iterator];
    if (!i && typeof obj === 'string') {
        return new StringIterator(obj);
    }
    if (!i && obj.length !== undefined) {
        return new ArrayIterator(obj);
    }
    if (!i) {
        throw new TypeError('object is not iterable');
    }
    return obj[iterator_1.$$iterator]();
}
var maxSafeInteger = Math.pow(2, 53) - 1;
function toLength(o) {
    var len = +o.length;
    if (isNaN(len)) {
        return 0;
    }
    if (len === 0 || !numberIsFinite(len)) {
        return len;
    }
    len = sign(len) * Math.floor(Math.abs(len));
    if (len <= 0) {
        return 0;
    }
    if (len > maxSafeInteger) {
        return maxSafeInteger;
    }
    return len;
}
function numberIsFinite(value) {
    return typeof value === 'number' && root_1.root.isFinite(value);
}
function sign(value) {
    var valueAsNumber = +value;
    if (valueAsNumber === 0) {
        return valueAsNumber;
    }
    if (isNaN(valueAsNumber)) {
        return valueAsNumber;
    }
    return valueAsNumber < 0 ? -1 : 1;
}

},{"234":234,"284":284,"294":294}],263:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var root_1 = require(294);
var Observable_1 = require(234);
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var PromiseObservable = (function (_super) {
    __extends(PromiseObservable, _super);
    function PromiseObservable(promise, scheduler) {
        _super.call(this);
        this.promise = promise;
        this.scheduler = scheduler;
    }
    /**
     * Converts a Promise to an Observable.
     *
     * <span class="informal">Returns an Observable that just emits the Promise's
     * resolved value, then completes.</span>
     *
     * Converts an ES2015 Promise or a Promises/A+ spec compliant Promise to an
     * Observable. If the Promise resolves with a value, the output Observable
     * emits that resolved value as a `next`, and then completes. If the Promise
     * is rejected, then the output Observable emits the corresponding Error.
     *
     * @example <caption>Convert the Promise returned by Fetch to an Observable</caption>
     * var result = Rx.Observable.fromPromise(fetch('http://myserver.com/'));
     * result.subscribe(x => console.log(x), e => console.error(e));
     *
     * @see {@link bindCallback}
     * @see {@link from}
     *
     * @param {Promise<T>} promise The promise to be converted.
     * @param {Scheduler} [scheduler] An optional Scheduler to use for scheduling
     * the delivery of the resolved value (or the rejection).
     * @return {Observable<T>} An Observable which wraps the Promise.
     * @static true
     * @name fromPromise
     * @owner Observable
     */
    PromiseObservable.create = function (promise, scheduler) {
        return new PromiseObservable(promise, scheduler);
    };
    PromiseObservable.prototype._subscribe = function (subscriber) {
        var _this = this;
        var promise = this.promise;
        var scheduler = this.scheduler;
        if (scheduler == null) {
            if (this._isScalar) {
                if (!subscriber.closed) {
                    subscriber.next(this.value);
                    subscriber.complete();
                }
            }
            else {
                promise.then(function (value) {
                    _this.value = value;
                    _this._isScalar = true;
                    if (!subscriber.closed) {
                        subscriber.next(value);
                        subscriber.complete();
                    }
                }, function (err) {
                    if (!subscriber.closed) {
                        subscriber.error(err);
                    }
                })
                    .then(null, function (err) {
                    // escape the promise trap, throw unhandled errors
                    root_1.root.setTimeout(function () { throw err; });
                });
            }
        }
        else {
            if (this._isScalar) {
                if (!subscriber.closed) {
                    return scheduler.schedule(dispatchNext, 0, { value: this.value, subscriber: subscriber });
                }
            }
            else {
                promise.then(function (value) {
                    _this.value = value;
                    _this._isScalar = true;
                    if (!subscriber.closed) {
                        subscriber.add(scheduler.schedule(dispatchNext, 0, { value: value, subscriber: subscriber }));
                    }
                }, function (err) {
                    if (!subscriber.closed) {
                        subscriber.add(scheduler.schedule(dispatchError, 0, { err: err, subscriber: subscriber }));
                    }
                })
                    .then(null, function (err) {
                    // escape the promise trap, throw unhandled errors
                    root_1.root.setTimeout(function () { throw err; });
                });
            }
        }
    };
    return PromiseObservable;
}(Observable_1.Observable));
exports.PromiseObservable = PromiseObservable;
function dispatchNext(arg) {
    var value = arg.value, subscriber = arg.subscriber;
    if (!subscriber.closed) {
        subscriber.next(value);
        subscriber.complete();
    }
}
function dispatchError(arg) {
    var err = arg.err, subscriber = arg.subscriber;
    if (!subscriber.closed) {
        subscriber.error(err);
    }
}

},{"234":234,"294":294}],264:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require(234);
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var ScalarObservable = (function (_super) {
    __extends(ScalarObservable, _super);
    function ScalarObservable(value, scheduler) {
        _super.call(this);
        this.value = value;
        this.scheduler = scheduler;
        this._isScalar = true;
        if (scheduler) {
            this._isScalar = false;
        }
    }
    ScalarObservable.create = function (value, scheduler) {
        return new ScalarObservable(value, scheduler);
    };
    ScalarObservable.dispatch = function (state) {
        var done = state.done, value = state.value, subscriber = state.subscriber;
        if (done) {
            subscriber.complete();
            return;
        }
        subscriber.next(value);
        if (subscriber.closed) {
            return;
        }
        state.done = true;
        this.schedule(state);
    };
    ScalarObservable.prototype._subscribe = function (subscriber) {
        var value = this.value;
        var scheduler = this.scheduler;
        if (scheduler) {
            return scheduler.schedule(ScalarObservable.dispatch, 0, {
                done: false, value: value, subscriber: subscriber
            });
        }
        else {
            subscriber.next(value);
            if (!subscriber.closed) {
                subscriber.complete();
            }
        }
    };
    return ScalarObservable;
}(Observable_1.Observable));
exports.ScalarObservable = ScalarObservable;

},{"234":234}],265:[function(require,module,exports){
"use strict";
var DeferObservable_1 = require(258);
exports.defer = DeferObservable_1.DeferObservable.create;

},{"258":258}],266:[function(require,module,exports){
"use strict";
var EmptyObservable_1 = require(259);
exports.empty = EmptyObservable_1.EmptyObservable.create;

},{"259":259}],267:[function(require,module,exports){
"use strict";
var FromObservable_1 = require(261);
exports.from = FromObservable_1.FromObservable.create;

},{"261":261}],268:[function(require,module,exports){
"use strict";
var PromiseObservable_1 = require(263);
exports.fromPromise = PromiseObservable_1.PromiseObservable.create;

},{"263":263}],269:[function(require,module,exports){
"use strict";
var ArrayObservable_1 = require(257);
exports.of = ArrayObservable_1.ArrayObservable.of;

},{"257":257}],270:[function(require,module,exports){
"use strict";
var ErrorObservable_1 = require(260);
exports._throw = ErrorObservable_1.ErrorObservable.create;

},{"260":260}],271:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OuterSubscriber_1 = require(236);
var subscribeToResult_1 = require(295);
/**
 * Catches errors on the observable to be handled by returning a new observable or throwing an error.
 * @param {function} selector a function that takes as arguments `err`, which is the error, and `caught`, which
 *  is the source observable, in case you'd like to "retry" that observable by returning it again. Whatever observable
 *  is returned by the `selector` will be used to continue the observable chain.
 * @return {Observable} an observable that originates from either the source or the observable returned by the
 *  catch `selector` function.
 * @method catch
 * @owner Observable
 */
function _catch(selector) {
    var operator = new CatchOperator(selector);
    var caught = this.lift(operator);
    return (operator.caught = caught);
}
exports._catch = _catch;
var CatchOperator = (function () {
    function CatchOperator(selector) {
        this.selector = selector;
    }
    CatchOperator.prototype.call = function (subscriber, source) {
        return source._subscribe(new CatchSubscriber(subscriber, this.selector, this.caught));
    };
    return CatchOperator;
}());
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var CatchSubscriber = (function (_super) {
    __extends(CatchSubscriber, _super);
    function CatchSubscriber(destination, selector, caught) {
        _super.call(this, destination);
        this.selector = selector;
        this.caught = caught;
    }
    // NOTE: overriding `error` instead of `_error` because we don't want
    // to have this flag this subscriber as `isStopped`.
    CatchSubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var result = void 0;
            try {
                result = this.selector(err, this.caught);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            this.unsubscribe();
            this.destination.remove(this);
            subscribeToResult_1.subscribeToResult(this, result);
        }
    };
    return CatchSubscriber;
}(OuterSubscriber_1.OuterSubscriber));

},{"236":236,"295":295}],272:[function(require,module,exports){
"use strict";
var isScheduler_1 = require(293);
var ArrayObservable_1 = require(257);
var mergeAll_1 = require(279);
/**
 * Creates an output Observable which sequentially emits all values from every
 * given input Observable after the current Observable.
 *
 * <span class="informal">Concatenates multiple Observables together by
 * sequentially emitting their values, one Observable after the other.</span>
 *
 * <img src="./img/concat.png" width="100%">
 *
 * Joins this Observable with multiple other Observables by subscribing to them
 * one at a time, starting with the source, and merging their results into the
 * output Observable. Will wait for each Observable to complete before moving
 * on to the next.
 *
 * @example <caption>Concatenate a timer counting from 0 to 3 with a synchronous sequence from 1 to 10</caption>
 * var timer = Rx.Observable.interval(1000).take(4);
 * var sequence = Rx.Observable.range(1, 10);
 * var result = timer.concat(sequence);
 * result.subscribe(x => console.log(x));
 *
 * @example <caption>Concatenate 3 Observables</caption>
 * var timer1 = Rx.Observable.interval(1000).take(10);
 * var timer2 = Rx.Observable.interval(2000).take(6);
 * var timer3 = Rx.Observable.interval(500).take(10);
 * var result = timer1.concat(timer2, timer3);
 * result.subscribe(x => console.log(x));
 *
 * @see {@link concatAll}
 * @see {@link concatMap}
 * @see {@link concatMapTo}
 *
 * @param {Observable} other An input Observable to concatenate after the source
 * Observable. More than one input Observables may be given as argument.
 * @param {Scheduler} [scheduler=null] An optional Scheduler to schedule each
 * Observable subscription on.
 * @return {Observable} All values of each passed Observable merged into a
 * single Observable, in order, in serial fashion.
 * @method concat
 * @owner Observable
 */
function concat() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i - 0] = arguments[_i];
    }
    return concatStatic.apply(void 0, [this].concat(observables));
}
exports.concat = concat;
/* tslint:enable:max-line-length */
/**
 * Creates an output Observable which sequentially emits all values from every
 * given input Observable after the current Observable.
 *
 * <span class="informal">Concatenates multiple Observables together by
 * sequentially emitting their values, one Observable after the other.</span>
 *
 * <img src="./img/concat.png" width="100%">
 *
 * Joins multiple Observables together by subscribing to them one at a time and
 * merging their results into the output Observable. Will wait for each
 * Observable to complete before moving on to the next.
 *
 * @example <caption>Concatenate a timer counting from 0 to 3 with a synchronous sequence from 1 to 10</caption>
 * var timer = Rx.Observable.interval(1000).take(4);
 * var sequence = Rx.Observable.range(1, 10);
 * var result = Rx.Observable.concat(timer, sequence);
 * result.subscribe(x => console.log(x));
 *
 * @example <caption>Concatenate 3 Observables</caption>
 * var timer1 = Rx.Observable.interval(1000).take(10);
 * var timer2 = Rx.Observable.interval(2000).take(6);
 * var timer3 = Rx.Observable.interval(500).take(10);
 * var result = Rx.Observable.concat(timer1, timer2, timer3);
 * result.subscribe(x => console.log(x));
 *
 * @see {@link concatAll}
 * @see {@link concatMap}
 * @see {@link concatMapTo}
 *
 * @param {Observable} input1 An input Observable to concatenate with others.
 * @param {Observable} input2 An input Observable to concatenate with others.
 * More than one input Observables may be given as argument.
 * @param {Scheduler} [scheduler=null] An optional Scheduler to schedule each
 * Observable subscription on.
 * @return {Observable} All values of each passed Observable merged into a
 * single Observable, in order, in serial fashion.
 * @static true
 * @name concat
 * @owner Observable
 */
function concatStatic() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i - 0] = arguments[_i];
    }
    var scheduler = null;
    var args = observables;
    if (isScheduler_1.isScheduler(args[observables.length - 1])) {
        scheduler = args.pop();
    }
    return new ArrayObservable_1.ArrayObservable(observables, scheduler).lift(new mergeAll_1.MergeAllOperator(1));
}
exports.concatStatic = concatStatic;

},{"257":257,"279":279,"293":293}],273:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require(237);
/**
 * Emits a given value if the source Observable completes without emitting any
 * `next` value, otherwise mirrors the source Observable.
 *
 * <span class="informal">If the source Observable turns out to be empty, then
 * this operator will emit a default value.</span>
 *
 * <img src="./img/defaultIfEmpty.png" width="100%">
 *
 * `defaultIfEmpty` emits the values emitted by the source Observable or a
 * specified default value if the source Observable is empty (completes without
 * having emitted any `next` value).
 *
 * @example <caption>If no clicks happen in 5 seconds, then emit "no clicks"</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var clicksBeforeFive = clicks.takeUntil(Rx.Observable.interval(5000));
 * var result = clicksBeforeFive.defaultIfEmpty('no clicks');
 * result.subscribe(x => console.log(x));
 *
 * @see {@link empty}
 * @see {@link last}
 *
 * @param {any} [defaultValue=null] The default value used if the source
 * Observable is empty.
 * @return {Observable} An Observable that emits either the specified
 * `defaultValue` if the source Observable emits no items, or the values emitted
 * by the source Observable.
 * @method defaultIfEmpty
 * @owner Observable
 */
function defaultIfEmpty(defaultValue) {
    if (defaultValue === void 0) { defaultValue = null; }
    return this.lift(new DefaultIfEmptyOperator(defaultValue));
}
exports.defaultIfEmpty = defaultIfEmpty;
var DefaultIfEmptyOperator = (function () {
    function DefaultIfEmptyOperator(defaultValue) {
        this.defaultValue = defaultValue;
    }
    DefaultIfEmptyOperator.prototype.call = function (subscriber, source) {
        return source._subscribe(new DefaultIfEmptySubscriber(subscriber, this.defaultValue));
    };
    return DefaultIfEmptyOperator;
}());
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var DefaultIfEmptySubscriber = (function (_super) {
    __extends(DefaultIfEmptySubscriber, _super);
    function DefaultIfEmptySubscriber(destination, defaultValue) {
        _super.call(this, destination);
        this.defaultValue = defaultValue;
        this.isEmpty = true;
    }
    DefaultIfEmptySubscriber.prototype._next = function (value) {
        this.isEmpty = false;
        this.destination.next(value);
    };
    DefaultIfEmptySubscriber.prototype._complete = function () {
        if (this.isEmpty) {
            this.destination.next(this.defaultValue);
        }
        this.destination.complete();
    };
    return DefaultIfEmptySubscriber;
}(Subscriber_1.Subscriber));

},{"237":237}],274:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require(237);
/**
 * Perform a side effect for every emission on the source Observable, but return
 * an Observable that is identical to the source.
 *
 * <span class="informal">Intercepts each emission on the source and runs a
 * function, but returns an output which is identical to the source.</span>
 *
 * <img src="./img/do.png" width="100%">
 *
 * Returns a mirrored Observable of the source Observable, but modified so that
 * the provided Observer is called to perform a side effect for every value,
 * error, and completion emitted by the source. Any errors that are thrown in
 * the aforementioned Observer or handlers are safely sent down the error path
 * of the output Observable.
 *
 * This operator is useful for debugging your Observables for the correct values
 * or performing other side effects.
 *
 * Note: this is different to a `subscribe` on the Observable. If the Observable
 * returned by `do` is not subscribed, the side effects specified by the
 * Observer will never happen. `do` therefore simply spies on existing
 * execution, it does not trigger an execution to happen like `subscribe` does.
 *
 * @example <caption>Map every every click to the clientX position of that click, while also logging the click event</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var positions = clicks
 *   .do(ev => console.log(ev))
 *   .map(ev => ev.clientX);
 * positions.subscribe(x => console.log(x));
 *
 * @see {@link map}
 * @see {@link subscribe}
 *
 * @param {Observer|function} [nextOrObserver] A normal Observer object or a
 * callback for `next`.
 * @param {function} [error] Callback for errors in the source.
 * @param {function} [complete] Callback for the completion of the source.
 * @return {Observable} An Observable identical to the source, but runs the
 * specified Observer or callback(s) for each item.
 * @method do
 * @name do
 * @owner Observable
 */
function _do(nextOrObserver, error, complete) {
    return this.lift(new DoOperator(nextOrObserver, error, complete));
}
exports._do = _do;
var DoOperator = (function () {
    function DoOperator(nextOrObserver, error, complete) {
        this.nextOrObserver = nextOrObserver;
        this.error = error;
        this.complete = complete;
    }
    DoOperator.prototype.call = function (subscriber, source) {
        return source._subscribe(new DoSubscriber(subscriber, this.nextOrObserver, this.error, this.complete));
    };
    return DoOperator;
}());
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var DoSubscriber = (function (_super) {
    __extends(DoSubscriber, _super);
    function DoSubscriber(destination, nextOrObserver, error, complete) {
        _super.call(this, destination);
        var safeSubscriber = new Subscriber_1.Subscriber(nextOrObserver, error, complete);
        safeSubscriber.syncErrorThrowable = true;
        this.add(safeSubscriber);
        this.safeSubscriber = safeSubscriber;
    }
    DoSubscriber.prototype._next = function (value) {
        var safeSubscriber = this.safeSubscriber;
        safeSubscriber.next(value);
        if (safeSubscriber.syncErrorThrown) {
            this.destination.error(safeSubscriber.syncErrorValue);
        }
        else {
            this.destination.next(value);
        }
    };
    DoSubscriber.prototype._error = function (err) {
        var safeSubscriber = this.safeSubscriber;
        safeSubscriber.error(err);
        if (safeSubscriber.syncErrorThrown) {
            this.destination.error(safeSubscriber.syncErrorValue);
        }
        else {
            this.destination.error(err);
        }
    };
    DoSubscriber.prototype._complete = function () {
        var safeSubscriber = this.safeSubscriber;
        safeSubscriber.complete();
        if (safeSubscriber.syncErrorThrown) {
            this.destination.error(safeSubscriber.syncErrorValue);
        }
        else {
            this.destination.complete();
        }
    };
    return DoSubscriber;
}(Subscriber_1.Subscriber));

},{"237":237}],275:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tryCatch_1 = require(297);
var errorObject_1 = require(288);
var OuterSubscriber_1 = require(236);
var subscribeToResult_1 = require(295);
/**
 * Recursively projects each source value to an Observable which is merged in
 * the output Observable.
 *
 * <span class="informal">It's similar to {@link mergeMap}, but applies the
 * projection function to every source value as well as every output value.
 * It's recursive.</span>
 *
 * <img src="./img/expand.png" width="100%">
 *
 * Returns an Observable that emits items based on applying a function that you
 * supply to each item emitted by the source Observable, where that function
 * returns an Observable, and then merging those resulting Observables and
 * emitting the results of this merger. *Expand* will re-emit on the output
 * Observable every source value. Then, each output value is given to the
 * `project` function which returns an inner Observable to be merged on the
 * output Observable. Those output values resulting from the projection are also
 * given to the `project` function to produce new output values. This is how
 * *expand* behaves recursively.
 *
 * @example <caption>Start emitting the powers of two on every click, at most 10 of them</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var powersOfTwo = clicks
 *   .mapTo(1)
 *   .expand(x => Rx.Observable.of(2 * x).delay(1000))
 *   .take(10);
 * powersOfTwo.subscribe(x => console.log(x));
 *
 * @see {@link mergeMap}
 * @see {@link mergeScan}
 *
 * @param {function(value: T, index: number) => Observable} project A function
 * that, when applied to an item emitted by the source or the output Observable,
 * returns an Observable.
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input
 * Observables being subscribed to concurrently.
 * @param {Scheduler} [scheduler=null] The Scheduler to use for subscribing to
 * each projected inner Observable.
 * @return {Observable} An Observable that emits the source values and also
 * result of applying the projection function to each value emitted on the
 * output Observable and and merging the results of the Observables obtained
 * from this transformation.
 * @method expand
 * @owner Observable
 */
function expand(project, concurrent, scheduler) {
    if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
    if (scheduler === void 0) { scheduler = undefined; }
    concurrent = (concurrent || 0) < 1 ? Number.POSITIVE_INFINITY : concurrent;
    return this.lift(new ExpandOperator(project, concurrent, scheduler));
}
exports.expand = expand;
var ExpandOperator = (function () {
    function ExpandOperator(project, concurrent, scheduler) {
        this.project = project;
        this.concurrent = concurrent;
        this.scheduler = scheduler;
    }
    ExpandOperator.prototype.call = function (subscriber, source) {
        return source._subscribe(new ExpandSubscriber(subscriber, this.project, this.concurrent, this.scheduler));
    };
    return ExpandOperator;
}());
exports.ExpandOperator = ExpandOperator;
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var ExpandSubscriber = (function (_super) {
    __extends(ExpandSubscriber, _super);
    function ExpandSubscriber(destination, project, concurrent, scheduler) {
        _super.call(this, destination);
        this.project = project;
        this.concurrent = concurrent;
        this.scheduler = scheduler;
        this.index = 0;
        this.active = 0;
        this.hasCompleted = false;
        if (concurrent < Number.POSITIVE_INFINITY) {
            this.buffer = [];
        }
    }
    ExpandSubscriber.dispatch = function (arg) {
        var subscriber = arg.subscriber, result = arg.result, value = arg.value, index = arg.index;
        subscriber.subscribeToProjection(result, value, index);
    };
    ExpandSubscriber.prototype._next = function (value) {
        var destination = this.destination;
        if (destination.closed) {
            this._complete();
            return;
        }
        var index = this.index++;
        if (this.active < this.concurrent) {
            destination.next(value);
            var result = tryCatch_1.tryCatch(this.project)(value, index);
            if (result === errorObject_1.errorObject) {
                destination.error(errorObject_1.errorObject.e);
            }
            else if (!this.scheduler) {
                this.subscribeToProjection(result, value, index);
            }
            else {
                var state = { subscriber: this, result: result, value: value, index: index };
                this.add(this.scheduler.schedule(ExpandSubscriber.dispatch, 0, state));
            }
        }
        else {
            this.buffer.push(value);
        }
    };
    ExpandSubscriber.prototype.subscribeToProjection = function (result, value, index) {
        this.active++;
        this.add(subscribeToResult_1.subscribeToResult(this, result, value, index));
    };
    ExpandSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (this.hasCompleted && this.active === 0) {
            this.destination.complete();
        }
    };
    ExpandSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        this._next(innerValue);
    };
    ExpandSubscriber.prototype.notifyComplete = function (innerSub) {
        var buffer = this.buffer;
        this.remove(innerSub);
        this.active--;
        if (buffer && buffer.length > 0) {
            this._next(buffer.shift());
        }
        if (this.hasCompleted && this.active === 0) {
            this.destination.complete();
        }
    };
    return ExpandSubscriber;
}(OuterSubscriber_1.OuterSubscriber));
exports.ExpandSubscriber = ExpandSubscriber;

},{"236":236,"288":288,"295":295,"297":297}],276:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require(237);
/**
 * Filter items emitted by the source Observable by only emitting those that
 * satisfy a specified predicate.
 *
 * <span class="informal">Like
 * [Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter),
 * it only emits a value from the source if it passes a criterion function.</span>
 *
 * <img src="./img/filter.png" width="100%">
 *
 * Similar to the well-known `Array.prototype.filter` method, this operator
 * takes values from the source Observable, passes them through a `predicate`
 * function and only emits those values that yielded `true`.
 *
 * @example <caption>Emit only click events whose target was a DIV element</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var clicksOnDivs = clicks.filter(ev => ev.target.tagName === 'DIV');
 * clicksOnDivs.subscribe(x => console.log(x));
 *
 * @see {@link distinct}
 * @see {@link distinctKey}
 * @see {@link distinctUntilChanged}
 * @see {@link distinctUntilKeyChanged}
 * @see {@link ignoreElements}
 * @see {@link partition}
 * @see {@link skip}
 *
 * @param {function(value: T, index: number): boolean} predicate A function that
 * evaluates each value emitted by the source Observable. If it returns `true`,
 * the value is emitted, if `false` the value is not passed to the output
 * Observable. The `index` parameter is the number `i` for the i-th source
 * emission that has happened since the subscription, starting from the number
 * `0`.
 * @param {any} [thisArg] An optional argument to determine the value of `this`
 * in the `predicate` function.
 * @return {Observable} An Observable of values from the source that were
 * allowed by the `predicate` function.
 * @method filter
 * @owner Observable
 */
function filter(predicate, thisArg) {
    return this.lift(new FilterOperator(predicate, thisArg));
}
exports.filter = filter;
var FilterOperator = (function () {
    function FilterOperator(predicate, thisArg) {
        this.predicate = predicate;
        this.thisArg = thisArg;
    }
    FilterOperator.prototype.call = function (subscriber, source) {
        return source._subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
    };
    return FilterOperator;
}());
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var FilterSubscriber = (function (_super) {
    __extends(FilterSubscriber, _super);
    function FilterSubscriber(destination, predicate, thisArg) {
        _super.call(this, destination);
        this.predicate = predicate;
        this.thisArg = thisArg;
        this.count = 0;
        this.predicate = predicate;
    }
    // the try catch block below is left specifically for
    // optimization and perf reasons. a tryCatcher is not necessary here.
    FilterSubscriber.prototype._next = function (value) {
        var result;
        try {
            result = this.predicate.call(this.thisArg, value, this.count++);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        if (result) {
            this.destination.next(value);
        }
    };
    return FilterSubscriber;
}(Subscriber_1.Subscriber));

},{"237":237}],277:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require(237);
/**
 * Applies a given `project` function to each value emitted by the source
 * Observable, and emits the resulting values as an Observable.
 *
 * <span class="informal">Like [Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map),
 * it passes each source value through a transformation function to get
 * corresponding output values.</span>
 *
 * <img src="./img/map.png" width="100%">
 *
 * Similar to the well known `Array.prototype.map` function, this operator
 * applies a projection to each value and emits that projection in the output
 * Observable.
 *
 * @example <caption>Map every every click to the clientX position of that click</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var positions = clicks.map(ev => ev.clientX);
 * positions.subscribe(x => console.log(x));
 *
 * @see {@link mapTo}
 * @see {@link pluck}
 *
 * @param {function(value: T, index: number): R} project The function to apply
 * to each `value` emitted by the source Observable. The `index` parameter is
 * the number `i` for the i-th emission that has happened since the
 * subscription, starting from the number `0`.
 * @param {any} [thisArg] An optional argument to define what `this` is in the
 * `project` function.
 * @return {Observable<R>} An Observable that emits the values from the source
 * Observable transformed by the given `project` function.
 * @method map
 * @owner Observable
 */
function map(project, thisArg) {
    if (typeof project !== 'function') {
        throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
    }
    return this.lift(new MapOperator(project, thisArg));
}
exports.map = map;
var MapOperator = (function () {
    function MapOperator(project, thisArg) {
        this.project = project;
        this.thisArg = thisArg;
    }
    MapOperator.prototype.call = function (subscriber, source) {
        return source._subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
    };
    return MapOperator;
}());
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var MapSubscriber = (function (_super) {
    __extends(MapSubscriber, _super);
    function MapSubscriber(destination, project, thisArg) {
        _super.call(this, destination);
        this.project = project;
        this.count = 0;
        this.thisArg = thisArg || this;
    }
    // NOTE: This looks unoptimized, but it's actually purposefully NOT
    // using try/catch optimizations.
    MapSubscriber.prototype._next = function (value) {
        var result;
        try {
            result = this.project.call(this.thisArg, value, this.count++);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    return MapSubscriber;
}(Subscriber_1.Subscriber));

},{"237":237}],278:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require(237);
var Notification_1 = require(233);
/**
 * Represents all of the notifications from the source Observable as `next`
 * emissions marked with their original types within {@link Notification}
 * objects.
 *
 * <span class="informal">Wraps `next`, `error` and `complete` emissions in
 * {@link Notification} objects, emitted as `next` on the output Observable.
 * </span>
 *
 * <img src="./img/materialize.png" width="100%">
 *
 * `materialize` returns an Observable that emits a `next` notification for each
 * `next`, `error`, or `complete` emission of the source Observable. When the
 * source Observable emits `complete`, the output Observable will emit `next` as
 * a Notification of type "complete", and then it will emit `complete` as well.
 * When the source Observable emits `error`, the output will emit `next` as a
 * Notification of type "error", and then `complete`.
 *
 * This operator is useful for producing metadata of the source Observable, to
 * be consumed as `next` emissions. Use it in conjunction with
 * {@link dematerialize}.
 *
 * @example <caption>Convert a faulty Observable to an Observable of Notifications</caption>
 * var letters = Rx.Observable.of('a', 'b', 13, 'd');
 * var upperCase = letters.map(x => x.toUpperCase());
 * var materialized = upperCase.materialize();
 * materialized.subscribe(x => console.log(x));
 *
 * @see {@link Notification}
 * @see {@link dematerialize}
 *
 * @return {Observable<Notification<T>>} An Observable that emits
 * {@link Notification} objects that wrap the original emissions from the source
 * Observable with metadata.
 * @method materialize
 * @owner Observable
 */
function materialize() {
    return this.lift(new MaterializeOperator());
}
exports.materialize = materialize;
var MaterializeOperator = (function () {
    function MaterializeOperator() {
    }
    MaterializeOperator.prototype.call = function (subscriber, source) {
        return source._subscribe(new MaterializeSubscriber(subscriber));
    };
    return MaterializeOperator;
}());
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var MaterializeSubscriber = (function (_super) {
    __extends(MaterializeSubscriber, _super);
    function MaterializeSubscriber(destination) {
        _super.call(this, destination);
    }
    MaterializeSubscriber.prototype._next = function (value) {
        this.destination.next(Notification_1.Notification.createNext(value));
    };
    MaterializeSubscriber.prototype._error = function (err) {
        var destination = this.destination;
        destination.next(Notification_1.Notification.createError(err));
        destination.complete();
    };
    MaterializeSubscriber.prototype._complete = function () {
        var destination = this.destination;
        destination.next(Notification_1.Notification.createComplete());
        destination.complete();
    };
    return MaterializeSubscriber;
}(Subscriber_1.Subscriber));

},{"233":233,"237":237}],279:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OuterSubscriber_1 = require(236);
var subscribeToResult_1 = require(295);
/**
 * Converts a higher-order Observable into a first-order Observable which
 * concurrently delivers all values that are emitted on the inner Observables.
 *
 * <span class="informal">Flattens an Observable-of-Observables.</span>
 *
 * <img src="./img/mergeAll.png" width="100%">
 *
 * `mergeAll` subscribes to an Observable that emits Observables, also known as
 * a higher-order Observable. Each time it observes one of these emitted inner
 * Observables, it subscribes to that and delivers all the values from the
 * inner Observable on the output Observable. The output Observable only
 * completes once all inner Observables have completed. Any error delivered by
 * a inner Observable will be immediately emitted on the output Observable.
 *
 * @example <caption>Spawn a new interval Observable for each click event, and blend their outputs as one Observable</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var higherOrder = clicks.map((ev) => Rx.Observable.interval(1000));
 * var firstOrder = higherOrder.mergeAll();
 * firstOrder.subscribe(x => console.log(x));
 *
 * @example <caption>Count from 0 to 9 every second for each click, but only allow 2 concurrent timers</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var higherOrder = clicks.map((ev) => Rx.Observable.interval(1000).take(10));
 * var firstOrder = higherOrder.mergeAll(2);
 * firstOrder.subscribe(x => console.log(x));
 *
 * @see {@link combineAll}
 * @see {@link concatAll}
 * @see {@link exhaust}
 * @see {@link merge}
 * @see {@link mergeMap}
 * @see {@link mergeMapTo}
 * @see {@link mergeScan}
 * @see {@link switch}
 * @see {@link zipAll}
 *
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of inner
 * Observables being subscribed to concurrently.
 * @return {Observable} An Observable that emits values coming from all the
 * inner Observables emitted by the source Observable.
 * @method mergeAll
 * @owner Observable
 */
function mergeAll(concurrent) {
    if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
    return this.lift(new MergeAllOperator(concurrent));
}
exports.mergeAll = mergeAll;
var MergeAllOperator = (function () {
    function MergeAllOperator(concurrent) {
        this.concurrent = concurrent;
    }
    MergeAllOperator.prototype.call = function (observer, source) {
        return source._subscribe(new MergeAllSubscriber(observer, this.concurrent));
    };
    return MergeAllOperator;
}());
exports.MergeAllOperator = MergeAllOperator;
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var MergeAllSubscriber = (function (_super) {
    __extends(MergeAllSubscriber, _super);
    function MergeAllSubscriber(destination, concurrent) {
        _super.call(this, destination);
        this.concurrent = concurrent;
        this.hasCompleted = false;
        this.buffer = [];
        this.active = 0;
    }
    MergeAllSubscriber.prototype._next = function (observable) {
        if (this.active < this.concurrent) {
            this.active++;
            this.add(subscribeToResult_1.subscribeToResult(this, observable));
        }
        else {
            this.buffer.push(observable);
        }
    };
    MergeAllSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (this.active === 0 && this.buffer.length === 0) {
            this.destination.complete();
        }
    };
    MergeAllSubscriber.prototype.notifyComplete = function (innerSub) {
        var buffer = this.buffer;
        this.remove(innerSub);
        this.active--;
        if (buffer.length > 0) {
            this._next(buffer.shift());
        }
        else if (this.active === 0 && this.hasCompleted) {
            this.destination.complete();
        }
    };
    return MergeAllSubscriber;
}(OuterSubscriber_1.OuterSubscriber));
exports.MergeAllSubscriber = MergeAllSubscriber;

},{"236":236,"295":295}],280:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var subscribeToResult_1 = require(295);
var OuterSubscriber_1 = require(236);
/**
 * Projects each source value to an Observable which is merged in the output
 * Observable.
 *
 * <span class="informal">Maps each value to an Observable, then flattens all of
 * these inner Observables using {@link mergeAll}.</span>
 *
 * <img src="./img/mergeMap.png" width="100%">
 *
 * Returns an Observable that emits items based on applying a function that you
 * supply to each item emitted by the source Observable, where that function
 * returns an Observable, and then merging those resulting Observables and
 * emitting the results of this merger.
 *
 * @example <caption>Map and flatten each letter to an Observable ticking every 1 second</caption>
 * var letters = Rx.Observable.of('a', 'b', 'c');
 * var result = letters.mergeMap(x =>
 *   Rx.Observable.interval(1000).map(i => x+i)
 * );
 * result.subscribe(x => console.log(x));
 *
 * @see {@link concatMap}
 * @see {@link exhaustMap}
 * @see {@link merge}
 * @see {@link mergeAll}
 * @see {@link mergeMapTo}
 * @see {@link mergeScan}
 * @see {@link switchMap}
 *
 * @param {function(value: T, ?index: number): Observable} project A function
 * that, when applied to an item emitted by the source Observable, returns an
 * Observable.
 * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]
 * A function to produce the value on the output Observable based on the values
 * and the indices of the source (outer) emission and the inner Observable
 * emission. The arguments passed to this function are:
 * - `outerValue`: the value that came from the source
 * - `innerValue`: the value that came from the projected Observable
 * - `outerIndex`: the "index" of the value that came from the source
 * - `innerIndex`: the "index" of the value from the projected Observable
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input
 * Observables being subscribed to concurrently.
 * @return {Observable} An Observable that emits the result of applying the
 * projection function (and the optional `resultSelector`) to each item emitted
 * by the source Observable and merging the results of the Observables obtained
 * from this transformation.
 * @method mergeMap
 * @owner Observable
 */
function mergeMap(project, resultSelector, concurrent) {
    if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
    if (typeof resultSelector === 'number') {
        concurrent = resultSelector;
        resultSelector = null;
    }
    return this.lift(new MergeMapOperator(project, resultSelector, concurrent));
}
exports.mergeMap = mergeMap;
var MergeMapOperator = (function () {
    function MergeMapOperator(project, resultSelector, concurrent) {
        if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
        this.project = project;
        this.resultSelector = resultSelector;
        this.concurrent = concurrent;
    }
    MergeMapOperator.prototype.call = function (observer, source) {
        return source._subscribe(new MergeMapSubscriber(observer, this.project, this.resultSelector, this.concurrent));
    };
    return MergeMapOperator;
}());
exports.MergeMapOperator = MergeMapOperator;
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var MergeMapSubscriber = (function (_super) {
    __extends(MergeMapSubscriber, _super);
    function MergeMapSubscriber(destination, project, resultSelector, concurrent) {
        if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
        _super.call(this, destination);
        this.project = project;
        this.resultSelector = resultSelector;
        this.concurrent = concurrent;
        this.hasCompleted = false;
        this.buffer = [];
        this.active = 0;
        this.index = 0;
    }
    MergeMapSubscriber.prototype._next = function (value) {
        if (this.active < this.concurrent) {
            this._tryNext(value);
        }
        else {
            this.buffer.push(value);
        }
    };
    MergeMapSubscriber.prototype._tryNext = function (value) {
        var result;
        var index = this.index++;
        try {
            result = this.project(value, index);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.active++;
        this._innerSub(result, value, index);
    };
    MergeMapSubscriber.prototype._innerSub = function (ish, value, index) {
        this.add(subscribeToResult_1.subscribeToResult(this, ish, value, index));
    };
    MergeMapSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (this.active === 0 && this.buffer.length === 0) {
            this.destination.complete();
        }
    };
    MergeMapSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        if (this.resultSelector) {
            this._notifyResultSelector(outerValue, innerValue, outerIndex, innerIndex);
        }
        else {
            this.destination.next(innerValue);
        }
    };
    MergeMapSubscriber.prototype._notifyResultSelector = function (outerValue, innerValue, outerIndex, innerIndex) {
        var result;
        try {
            result = this.resultSelector(outerValue, innerValue, outerIndex, innerIndex);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    MergeMapSubscriber.prototype.notifyComplete = function (innerSub) {
        var buffer = this.buffer;
        this.remove(innerSub);
        this.active--;
        if (buffer.length > 0) {
            this._next(buffer.shift());
        }
        else if (this.active === 0 && this.hasCompleted) {
            this.destination.complete();
        }
    };
    return MergeMapSubscriber;
}(OuterSubscriber_1.OuterSubscriber));
exports.MergeMapSubscriber = MergeMapSubscriber;

},{"236":236,"295":295}],281:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require(237);
var Notification_1 = require(233);
/**
 * @see {@link Notification}
 *
 * @param scheduler
 * @param delay
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method observeOn
 * @owner Observable
 */
function observeOn(scheduler, delay) {
    if (delay === void 0) { delay = 0; }
    return this.lift(new ObserveOnOperator(scheduler, delay));
}
exports.observeOn = observeOn;
var ObserveOnOperator = (function () {
    function ObserveOnOperator(scheduler, delay) {
        if (delay === void 0) { delay = 0; }
        this.scheduler = scheduler;
        this.delay = delay;
    }
    ObserveOnOperator.prototype.call = function (subscriber, source) {
        return source._subscribe(new ObserveOnSubscriber(subscriber, this.scheduler, this.delay));
    };
    return ObserveOnOperator;
}());
exports.ObserveOnOperator = ObserveOnOperator;
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var ObserveOnSubscriber = (function (_super) {
    __extends(ObserveOnSubscriber, _super);
    function ObserveOnSubscriber(destination, scheduler, delay) {
        if (delay === void 0) { delay = 0; }
        _super.call(this, destination);
        this.scheduler = scheduler;
        this.delay = delay;
    }
    ObserveOnSubscriber.dispatch = function (arg) {
        var notification = arg.notification, destination = arg.destination;
        notification.observe(destination);
    };
    ObserveOnSubscriber.prototype.scheduleMessage = function (notification) {
        this.add(this.scheduler.schedule(ObserveOnSubscriber.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));
    };
    ObserveOnSubscriber.prototype._next = function (value) {
        this.scheduleMessage(Notification_1.Notification.createNext(value));
    };
    ObserveOnSubscriber.prototype._error = function (err) {
        this.scheduleMessage(Notification_1.Notification.createError(err));
    };
    ObserveOnSubscriber.prototype._complete = function () {
        this.scheduleMessage(Notification_1.Notification.createComplete());
    };
    return ObserveOnSubscriber;
}(Subscriber_1.Subscriber));
exports.ObserveOnSubscriber = ObserveOnSubscriber;
var ObserveOnMessage = (function () {
    function ObserveOnMessage(notification, destination) {
        this.notification = notification;
        this.destination = destination;
    }
    return ObserveOnMessage;
}());
exports.ObserveOnMessage = ObserveOnMessage;

},{"233":233,"237":237}],282:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require(237);
/**
 * Applies an accumulator function over the source Observable, and returns the
 * accumulated result when the source completes, given an optional seed value.
 *
 * <span class="informal">Combines together all values emitted on the source,
 * using an accumulator function that knows how to join a new source value into
 * the accumulation from the past.</span>
 *
 * <img src="./img/reduce.png" width="100%">
 *
 * Like
 * [Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce),
 * `reduce` applies an `accumulator` function against an accumulation and each
 * value of the source Observable (from the past) to reduce it to a single
 * value, emitted on the output Observable. Note that `reduce` will only emit
 * one value, only when the source Observable completes. It is equivalent to
 * applying operator {@link scan} followed by operator {@link last}.
 *
 * Returns an Observable that applies a specified `accumulator` function to each
 * item emitted by the source Observable. If a `seed` value is specified, then
 * that value will be used as the initial value for the accumulator. If no seed
 * value is specified, the first item of the source is used as the seed.
 *
 * @example <caption>Count the number of click events that happened in 5 seconds</caption>
 * var clicksInFiveSeconds = Rx.Observable.fromEvent(document, 'click')
 *   .takeUntil(Rx.Observable.interval(5000));
 * var ones = clicksInFiveSeconds.mapTo(1);
 * var seed = 0;
 * var count = ones.reduce((acc, one) => acc + one, seed);
 * count.subscribe(x => console.log(x));
 *
 * @see {@link count}
 * @see {@link expand}
 * @see {@link mergeScan}
 * @see {@link scan}
 *
 * @param {function(acc: R, value: T): R} accumulator The accumulator function
 * called on each source value.
 * @param {R} [seed] The initial accumulation value.
 * @return {Observable<R>} An observable of the accumulated values.
 * @return {Observable<R>} An Observable that emits a single value that is the
 * result of accumulating the values emitted by the source Observable.
 * @method reduce
 * @owner Observable
 */
function reduce(accumulator, seed) {
    return this.lift(new ReduceOperator(accumulator, seed));
}
exports.reduce = reduce;
var ReduceOperator = (function () {
    function ReduceOperator(accumulator, seed) {
        this.accumulator = accumulator;
        this.seed = seed;
    }
    ReduceOperator.prototype.call = function (subscriber, source) {
        return source._subscribe(new ReduceSubscriber(subscriber, this.accumulator, this.seed));
    };
    return ReduceOperator;
}());
exports.ReduceOperator = ReduceOperator;
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var ReduceSubscriber = (function (_super) {
    __extends(ReduceSubscriber, _super);
    function ReduceSubscriber(destination, accumulator, seed) {
        _super.call(this, destination);
        this.accumulator = accumulator;
        this.hasValue = false;
        this.acc = seed;
        this.accumulator = accumulator;
        this.hasSeed = typeof seed !== 'undefined';
    }
    ReduceSubscriber.prototype._next = function (value) {
        if (this.hasValue || (this.hasValue = this.hasSeed)) {
            this._tryReduce(value);
        }
        else {
            this.acc = value;
            this.hasValue = true;
        }
    };
    ReduceSubscriber.prototype._tryReduce = function (value) {
        var result;
        try {
            result = this.accumulator(this.acc, value);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.acc = result;
    };
    ReduceSubscriber.prototype._complete = function () {
        if (this.hasValue || this.hasSeed) {
            this.destination.next(this.acc);
        }
        this.destination.complete();
    };
    return ReduceSubscriber;
}(Subscriber_1.Subscriber));
exports.ReduceSubscriber = ReduceSubscriber;

},{"237":237}],283:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require(237);
/**
 * @return {Observable<any[]>|WebSocketSubject<T>|Observable<T>}
 * @method toArray
 * @owner Observable
 */
function toArray() {
    return this.lift(new ToArrayOperator());
}
exports.toArray = toArray;
var ToArrayOperator = (function () {
    function ToArrayOperator() {
    }
    ToArrayOperator.prototype.call = function (subscriber, source) {
        return source._subscribe(new ToArraySubscriber(subscriber));
    };
    return ToArrayOperator;
}());
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var ToArraySubscriber = (function (_super) {
    __extends(ToArraySubscriber, _super);
    function ToArraySubscriber(destination) {
        _super.call(this, destination);
        this.array = [];
    }
    ToArraySubscriber.prototype._next = function (x) {
        this.array.push(x);
    };
    ToArraySubscriber.prototype._complete = function () {
        this.destination.next(this.array);
        this.destination.complete();
    };
    return ToArraySubscriber;
}(Subscriber_1.Subscriber));

},{"237":237}],284:[function(require,module,exports){
"use strict";
var root_1 = require(294);
var Symbol = root_1.root.Symbol;
if (typeof Symbol === 'function') {
    if (Symbol.iterator) {
        exports.$$iterator = Symbol.iterator;
    }
    else if (typeof Symbol.for === 'function') {
        exports.$$iterator = Symbol.for('iterator');
    }
}
else {
    if (root_1.root.Set && typeof new root_1.root.Set()['@@iterator'] === 'function') {
        // Bug for mozilla version
        exports.$$iterator = '@@iterator';
    }
    else if (root_1.root.Map) {
        // es6-shim specific logic
        var keys = Object.getOwnPropertyNames(root_1.root.Map.prototype);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            if (key !== 'entries' && key !== 'size' && root_1.root.Map.prototype[key] === root_1.root.Map.prototype['entries']) {
                exports.$$iterator = key;
                break;
            }
        }
    }
    else {
        exports.$$iterator = '@@iterator';
    }
}

},{"294":294}],285:[function(require,module,exports){
"use strict";
var root_1 = require(294);
function getSymbolObservable(context) {
    var $$observable;
    var Symbol = context.Symbol;
    if (typeof Symbol === 'function') {
        if (Symbol.observable) {
            $$observable = Symbol.observable;
        }
        else {
            $$observable = Symbol('observable');
            Symbol.observable = $$observable;
        }
    }
    else {
        $$observable = '@@observable';
    }
    return $$observable;
}
exports.getSymbolObservable = getSymbolObservable;
exports.$$observable = getSymbolObservable(root_1.root);

},{"294":294}],286:[function(require,module,exports){
"use strict";
var root_1 = require(294);
var Symbol = root_1.root.Symbol;
exports.$$rxSubscriber = (typeof Symbol === 'function' && typeof Symbol.for === 'function') ?
    Symbol.for('rxSubscriber') : '@@rxSubscriber';

},{"294":294}],287:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * An error thrown when one or more errors have occurred during the
 * `unsubscribe` of a {@link Subscription}.
 */
var UnsubscriptionError = (function (_super) {
    __extends(UnsubscriptionError, _super);
    function UnsubscriptionError(errors) {
        _super.call(this);
        this.errors = errors;
        var err = Error.call(this, errors ?
            errors.length + " errors occurred during unsubscription:\n  " + errors.map(function (err, i) { return ((i + 1) + ") " + err.toString()); }).join('\n  ') : '');
        this.name = err.name = 'UnsubscriptionError';
        this.stack = err.stack;
        this.message = err.message;
    }
    return UnsubscriptionError;
}(Error));
exports.UnsubscriptionError = UnsubscriptionError;

},{}],288:[function(require,module,exports){
"use strict";
// typeof any so that it we don't have to cast when comparing a result to the error object
exports.errorObject = { e: {} };

},{}],289:[function(require,module,exports){
"use strict";
exports.isArray = Array.isArray || (function (x) { return x && typeof x.length === 'number'; });

},{}],290:[function(require,module,exports){
"use strict";
function isFunction(x) {
    return typeof x === 'function';
}
exports.isFunction = isFunction;

},{}],291:[function(require,module,exports){
"use strict";
function isObject(x) {
    return x != null && typeof x === 'object';
}
exports.isObject = isObject;

},{}],292:[function(require,module,exports){
"use strict";
function isPromise(value) {
    return value && typeof value.subscribe !== 'function' && typeof value.then === 'function';
}
exports.isPromise = isPromise;

},{}],293:[function(require,module,exports){
"use strict";
function isScheduler(value) {
    return value && typeof value.schedule === 'function';
}
exports.isScheduler = isScheduler;

},{}],294:[function(require,module,exports){
(function (global){
"use strict";
var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
};
exports.root = (objectTypes[typeof self] && self) || (objectTypes[typeof window] && window);
/* tslint:disable:no-unused-variable */
var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
var freeGlobal = objectTypes[typeof global] && global;
if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    exports.root = freeGlobal;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],295:[function(require,module,exports){
"use strict";
var root_1 = require(294);
var isArray_1 = require(289);
var isPromise_1 = require(292);
var Observable_1 = require(234);
var iterator_1 = require(284);
var InnerSubscriber_1 = require(232);
var observable_1 = require(285);
function subscribeToResult(outerSubscriber, result, outerValue, outerIndex) {
    var destination = new InnerSubscriber_1.InnerSubscriber(outerSubscriber, outerValue, outerIndex);
    if (destination.closed) {
        return null;
    }
    if (result instanceof Observable_1.Observable) {
        if (result._isScalar) {
            destination.next(result.value);
            destination.complete();
            return null;
        }
        else {
            return result.subscribe(destination);
        }
    }
    if (isArray_1.isArray(result)) {
        for (var i = 0, len = result.length; i < len && !destination.closed; i++) {
            destination.next(result[i]);
        }
        if (!destination.closed) {
            destination.complete();
        }
    }
    else if (isPromise_1.isPromise(result)) {
        result.then(function (value) {
            if (!destination.closed) {
                destination.next(value);
                destination.complete();
            }
        }, function (err) { return destination.error(err); })
            .then(null, function (err) {
            // Escaping the Promise trap: globally throw unhandled errors
            root_1.root.setTimeout(function () { throw err; });
        });
        return destination;
    }
    else if (typeof result[iterator_1.$$iterator] === 'function') {
        var iterator = result[iterator_1.$$iterator]();
        do {
            var item = iterator.next();
            if (item.done) {
                destination.complete();
                break;
            }
            destination.next(item.value);
            if (destination.closed) {
                break;
            }
        } while (true);
    }
    else if (typeof result[observable_1.$$observable] === 'function') {
        var obs = result[observable_1.$$observable]();
        if (typeof obs.subscribe !== 'function') {
            destination.error(new Error('invalid observable'));
        }
        else {
            return obs.subscribe(new InnerSubscriber_1.InnerSubscriber(outerSubscriber, outerValue, outerIndex));
        }
    }
    else {
        destination.error(new TypeError('unknown type returned'));
    }
    return null;
}
exports.subscribeToResult = subscribeToResult;

},{"232":232,"234":234,"284":284,"285":285,"289":289,"292":292,"294":294}],296:[function(require,module,exports){
"use strict";
var Subscriber_1 = require(237);
var rxSubscriber_1 = require(286);
function toSubscriber(nextOrObserver, error, complete) {
    if (nextOrObserver) {
        if (nextOrObserver instanceof Subscriber_1.Subscriber) {
            return nextOrObserver;
        }
        if (nextOrObserver[rxSubscriber_1.$$rxSubscriber]) {
            return nextOrObserver[rxSubscriber_1.$$rxSubscriber]();
        }
    }
    if (!nextOrObserver && !error && !complete) {
        return new Subscriber_1.Subscriber();
    }
    return new Subscriber_1.Subscriber(nextOrObserver, error, complete);
}
exports.toSubscriber = toSubscriber;

},{"237":237,"286":286}],297:[function(require,module,exports){
"use strict";
var errorObject_1 = require(288);
var tryCatchTarget;
function tryCatcher() {
    try {
        return tryCatchTarget.apply(this, arguments);
    }
    catch (e) {
        errorObject_1.errorObject.e = e;
        return errorObject_1.errorObject;
    }
}
function tryCatch(fn) {
    tryCatchTarget = fn;
    return tryCatcher;
}
exports.tryCatch = tryCatch;
;

},{"288":288}]},{},[1])(1)
});