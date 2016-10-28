/*!
 * 
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
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("falcor", [], factory);
	else if(typeof exports === 'object')
		exports["falcor"] = factory();
	else
		root["falcor"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 130);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

"use strict";
"use strict";

module.exports = "ref";

/***/ },
/* 1 */
/***/ function(module, exports) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var objTypeof = "object";
module.exports = function isObject(value) {
    return value !== null && (typeof value === "undefined" ? "undefined" : _typeof(value)) === objTypeof;
};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var now = __webpack_require__(37);
var $now = __webpack_require__(42);
var $never = __webpack_require__(41);

module.exports = function isExpired(node) {
    var exp = node.$expires;
    return exp != null && exp !== $never && (exp === $now || exp < now());
};

/***/ },
/* 3 */
/***/ function(module, exports) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var functionTypeof = "function";

module.exports = function isFunction(func) {
    return Boolean(func) && (typeof func === "undefined" ? "undefined" : _typeof(func)) === functionTypeof;
};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(73);


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var noop = __webpack_require__(22);
var _Symbol = __webpack_require__(83);
var toEsObservable = __webpack_require__(129);

/**
 * A ModelResponse is a container for the results of a get, set, or call operation performed on a Model. The ModelResponse provides methods which can be used to specify the output format of the data retrieved from a Model, as well as how that data is delivered.
 * @constructor ModelResponse
 * @augments Observable
*/
/** @constructor @implements IThenable */
function ModelResponse(subscribe) {
    this._subscribe = subscribe;
}

ModelResponse.prototype[_Symbol.observable] = function SymbolObservable() {
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

ModelResponse.prototype.subscribe = ModelResponse.prototype.forEach = function subscribe(a, b, c) {
    var observer = a;
    if (observer && (typeof observer === "undefined" ? "undefined" : _typeof(observer)) === "object") {
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
    switch (typeof subscription === "undefined" ? "undefined" : _typeof(subscription)) {
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

        self._promise = new global['Promise'](function (resolve, reject) {
            var rejected = false;
            var values = [];
            self.subscribe(function (value) {
                values[values.length] = value;
            }, function (errors) {
                rejected = true;
                reject(errors);
            }, function () {
                var value = values;
                if (values.length <= 1) {
                    value = values[0];
                }

                if (rejected === false) {
                    resolve(value);
                }
            });
        });
    }
    return self._promise.then(onNext, onError);
};

module.exports = ModelResponse;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(66)))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var splice = __webpack_require__(53);

module.exports = function expireNode(node, expired, lru) {
    if (!node["\u001eƒalcor_invalidated"]) {
        node["\u001eƒalcor_invalidated"] = true;
        expired.push(node);
        splice(lru, node);
    }
    return node;
};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var isObject = __webpack_require__(1);
module.exports = function getSize(node) {
    return isObject(node) && node.$size || 0;
};

/***/ },
/* 8 */
/***/ function(module, exports) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var objTypeof = "object";
module.exports = function isPrimitive(value) {
    return value == null || (typeof value === "undefined" ? "undefined" : _typeof(value)) !== objTypeof;
};

/***/ },
/* 9 */
/***/ function(module, exports) {

"use strict";
"use strict";

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
InvalidSourceError.is = function (e) {
    return e && e.name === NAME;
};

module.exports = InvalidSourceError;

/***/ },
/* 10 */
/***/ function(module, exports) {

"use strict";
"use strict";

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

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

module.exports = function createHardlink(from, to) {

    // create a back reference
    var backRefs = to["\u001eƒalcor_refs_length"] || 0;
    to["\u001eƒalcor_ref" + backRefs] = from;
    to["\u001eƒalcor_refs_length"] = backRefs + 1;

    // create a hard reference
    from["\u001eƒalcor_ref_index"] = backRefs;
    from["\u001eƒalcor_context"] = to;
};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

module.exports = clone;

function clone(node) {

    var key,
        keys = Object.keys(node),
        json = {},
        index = -1,
        length = keys.length;

    while (++index < length) {
        key = keys[index];
        if (key.charAt(0) === "\u001e") {
            continue;
        }
        json[key] = node[key];
    }

    return json;
}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var $ref = __webpack_require__(0);

/**
 * getCachePosition makes a fast walk to the bound value since all bound
 * paths are the most possible optimized path.
 *
 * @param {Model} model -
 * @param {Array} path -
 * @returns {Mixed} - undefined if there is nothing in this position.
 * @private
 */
module.exports = getCachePosition;

function getCachePosition(cache, path) {

    var node = cache;
    var type,
        depth = 0;
    var maxDepth = path.length;

    if (maxDepth > 0) {
        do {
            node = node[path[depth]];

            while (node && (type = node.$type) === $ref) {
                node = getCachePosition(cache, node.value);
            }
        } while (++depth < maxDepth && node && !type);
    }

    return node;
};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var EXPIRES_NEVER = __webpack_require__(41);

// [H] -> Next -> ... -> [T]
// [T] -> Prev -> ... -> [H]
module.exports = function lruPromote(root, object) {
    // Never promote node.$expires === 1.  They cannot expire.
    if (object.$expires === EXPIRES_NEVER) {
        return;
    }

    var head = root["\u001eƒalcor_head"];

    // Nothing is in the cache.
    if (!head) {
        root["\u001eƒalcor_head"] = root["\u001eƒalcor_tail"] = object;
        return;
    }

    if (head === object) {
        return;
    }

    // The item always exist in the cache since to get anything in the
    // cache it first must go through set.
    var prev = object["\u001eƒalcor_prev"];
    var next = object["\u001eƒalcor_next"];
    if (next) {
        next["\u001eƒalcor_prev"] = prev;
    }
    if (prev) {
        prev["\u001eƒalcor_next"] = next;
    }
    object["\u001eƒalcor_prev"] = undefined;

    // Insert into head position
    root["\u001eƒalcor_head"] = object;
    object["\u001eƒalcor_next"] = head;
    head["\u001eƒalcor_prev"] = object;

    // If the item we promoted was the tail, then set prev to tail.
    if (object === root["\u001eƒalcor_tail"]) {
        root["\u001eƒalcor_tail"] = prev;
    }
};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var isObject = __webpack_require__(1);
var hasOwn = Object.prototype.hasOwnProperty;

module.exports = function (obj, prop) {
  return isObject(obj) && hasOwn.call(obj, prop);
};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var removeNode = __webpack_require__(38);
var updateBackReferenceVersions = __webpack_require__(64);

module.exports = function updateNodeAncestors(nodeArg, offset, lru, version) {
    var child = nodeArg;
    do {
        var node = child["\u001eƒalcor_parent"];
        var size = child.$size = (child.$size || 0) - offset;
        if (size <= 0 && node != null) {
            removeNode(child, node, child["\u001eƒalcor_key"], lru);
        } else if (child["\u001eƒalcor_version"] !== version) {
            updateBackReferenceVersions(child, version);
        }
        child = node;
    } while (child);
    return nodeArg;
};

/***/ },
/* 17 */
/***/ function(module, exports) {

"use strict";
"use strict";

module.exports = "error";

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var getCachePosition = __webpack_require__(13);

module.exports = getBoundCacheNode;

function getBoundCacheNode(model, path) {
    path = path || model._path;
    var node = model._node;
    if (!node || node["\u001eƒalcor_parent"] === undefined || node["\u001eƒalcor_invalidated"]) {
        model._node = null;
        if (path.length === 0) {
            node = model._root.cache;
        } else {
            node = getCachePosition(model._root.cache, path);
            if (path === model._path) {
                model._node = node;
            }
        }
    }
    return node;
}

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var arr = new Array(5);
var $ref = __webpack_require__(0);
var createHardlink = __webpack_require__(11);
var isExpired = __webpack_require__(123);
var isFunction = __webpack_require__(3);
var isPrimitive = __webpack_require__(8);
var expireNode = __webpack_require__(6);
var iterateKeySet = __webpack_require__(4).iterateKeySet;
var mergeJSONGraphNode = __webpack_require__(125);
var NullInPathError = __webpack_require__(10);

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
    var initialVersion = cache["\u001eƒalcor_version"];

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

            setJSONGraphPathSet(path, 0, cache, cache, cache, jsonGraph, jsonGraph, jsonGraph, requestedPaths, optimizedPaths, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector);
        }
    }

    arr[0] = undefined;
    arr[1] = undefined;
    arr[2] = undefined;
    arr[3] = undefined;
    arr[4] = undefined;

    var newVersion = cache["\u001eƒalcor_version"];
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }

    return [requestedPaths, optimizedPaths];
};

/* eslint-disable no-constant-condition */
function setJSONGraphPathSet(path, depth, root, parent, node, messageRoot, messageParent, message, requestedPaths, optimizedPaths, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector) {

    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet(keySet, note);
    var optimizedIndex = optimizedPath.index;

    do {

        requestedPath.depth = depth;

        var results = setNode(root, parent, node, messageRoot, messageParent, message, key, branch, false, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector);

        requestedPath[depth] = key;
        requestedPath.index = depth;

        var nextNode = results[0];
        var nextParent = results[1];
        var nextOptimizedPath = results[4];
        nextOptimizedPath[nextOptimizedPath.index++] = key;

        if (nextNode) {
            if (branch) {
                setJSONGraphPathSet(path, depth + 1, root, nextParent, nextNode, messageRoot, results[3], results[2], requestedPaths, optimizedPaths, requestedPath, nextOptimizedPath, version, expired, lru, comparator, errorSelector);
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

function setReference(root, node, messageRoot, message, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector) {

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

            var results = setNode(root, parent, node, messageRoot, messageParent, message, key, branch, true, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector);
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

        if (container["\u001eƒalcor_context"] !== node) {
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

function setNode(root, parent, node, messageRoot, messageParent, message, key, branch, reference, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector) {

    var type = node.$type;

    while (type === $ref) {

        var results = setReference(root, node, messageRoot, message, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector);

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
                key = node["\u001eƒalcor_key"];
            }
        } else {
            parent = node;
            messageParent = message;
            node = parent[key];
            message = messageParent && messageParent[key];
        }

        node = mergeJSONGraphNode(parent, node, message, key, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector);
    }

    arr[0] = node;
    arr[1] = parent;
    arr[2] = message;
    arr[3] = messageParent;
    arr[4] = optimizedPath;

    return arr;
}

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var isObject = __webpack_require__(1);

module.exports = function isJSONEnvelope(envelope) {
    return isObject(envelope) && "json" in envelope;
};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var isArray = Array.isArray;
var isObject = __webpack_require__(1);

module.exports = function isPathValue(pathValue) {
    return isObject(pathValue) && (isArray(pathValue.path) || typeof pathValue.path === "string");
};

/***/ },
/* 22 */
/***/ function(module, exports) {

"use strict";
"use strict";

module.exports = function noop() {};

/***/ },
/* 23 */
/***/ function(module, exports) {

"use strict";
"use strict";

module.exports = "atom";

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isArray = Array.isArray;
var nullTerminator = __webpack_require__(25);

module.exports = hasIntersection;

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
    var keyset,
        keysetIndex = -1,
        keysetLength = 0;
    var next,
        nextKey,
        nextDepth = depth + 1,
        keyIsRange,
        rangeEnd,
        keysOrRanges;

    keyset = path[depth];

    if (keyset === null) {
        return tree === nullTerminator;
    }

    iteratingKeyset: do {
        // If the keyset is a primitive value, we've found our `nextKey`.
        if ('object' !== (typeof keyset === 'undefined' ? 'undefined' : _typeof(keyset))) {
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
                    if (rangeEnd - nextKey < 0) {
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

/***/ },
/* 25 */
/***/ function(module, exports) {

"use strict";
"use strict";

module.exports = { $__null__$: null };

/***/ },
/* 26 */
/***/ function(module, exports) {

"use strict";
"use strict";

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
    var err = Error.call(this, "The KeySet " + JSON.stringify(keysOrRanges) + " in path " + JSON.stringify(path) + " contains a KeySet. " + MESSAGE);
    err.name = NAME;
    this.stack = err.stack;
    this.message = err.message;
    return this;
}

// instanceof will be an error, but stack will be correct because its defined
// in the constructor.
InvalidKeySetError.prototype = Object.create(Error.prototype);
InvalidKeySetError.prototype.name = NAME;
InvalidKeySetError.is = function (e) {
    return e && e.name === NAME;
};

module.exports = InvalidKeySetError;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

module.exports = {
    getWithPathsAsPathMap: __webpack_require__(92),
    getWithPathsAsJSONGraph: __webpack_require__(96)
};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function FalcorJSON(f_meta) {
    this["\u001eƒalcor_metadata"] = f_meta || {};
}

FalcorJSON.prototype = Object.create(Object.prototype, Object.assign({
    toJSON: { value: toJSON },
    toProps: { value: toProps },
    serialize: { value: serialize },
    $__hash: {
        enumerable: false,
        get: function get() {
            var f_meta = this["\u001eƒalcor_metadata"];
            return f_meta && f_meta["$code"] || '';
        }
    },
    $__version: {
        enumerable: false,
        get: function get() {
            var f_meta = this["\u001eƒalcor_metadata"];
            return f_meta && f_meta["version"] || 0;
        }
    }
}, arrayProtoMethods().reduce(function (falcorJSONProto, methodName) {
    var method = Array.prototype[methodName];
    falcorJSONProto[methodName] = {
        writable: true, enumerable: false, value: function value() {
            return method.apply(this, arguments);
        }
    };
    return falcorJSONProto;
}, {})));

function arrayProtoMethods() {
    return ['concat', 'copyWithin', 'entries', 'every', 'fill', 'filter', 'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'keys', 'lastIndexOf', 'map', 'pop', 'push', 'reduce', 'reduceRight', 'reverse', 'shift', 'slice', 'some', 'sort', 'splice', 'unshift', 'values'];
}

var isArray = Array.isArray;
var typeofObject = 'object';
var typeofString = 'string';

function toJSON(inst) {
    if ((typeof inst === 'undefined' ? 'undefined' : _typeof(inst)) === typeofString) {
        if (arguments.length !== 1) {
            return inst;
        }
        inst = this;
    } else if (!inst) {
        inst = this;
    }
    if (inst['self'] === inst || inst['global'] === inst || inst['window'] === inst) {
        return undefined;
    }
    var json = serialize(inst, toJSON);
    if (json["\u001eƒalcor_metadata"]) {
        delete json["\u001eƒalcor_metadata"];
    }
    return json;
}

function toProps(inst, serializer) {
    var argsLen = arguments.length;
    inst = argsLen === 0 ? this : inst;
    if (!inst || (typeof inst === 'undefined' ? 'undefined' : _typeof(inst)) !== typeofObject) {
        return inst;
    } else if (inst['self'] === inst || inst['global'] === inst || inst['window'] === inst) {
        return undefined;
    }
    var json = serialize(inst, argsLen > 0 && serializer || toProps);
    var f_meta = json["\u001eƒalcor_metadata"];
    if (f_meta) {
        delete json["\u001eƒalcor_metadata"];
        f_meta["version"] = inst["\u001eƒalcor_metadata"]["version"];
        json.__proto__ = new FalcorJSON(f_meta);
    }
    return json;
}

function serialize(inst, serializer) {

    var argsLen = arguments.length;
    inst = argsLen === 0 ? this : inst;

    if (!inst || (typeof inst === 'undefined' ? 'undefined' : _typeof(inst)) !== typeofObject) {
        return inst;
    } else if (inst['self'] === inst || inst['global'] === inst || inst['window'] === inst) {
        return undefined;
    }

    var count, total, f_meta, keys, key, xs;

    serializer = argsLen > 0 && serializer || serialize;

    if (isArray(inst)) {
        count = -1;
        total = inst.length;
        xs = new Array(total);
        while (++count < total) {
            xs[count] = inst[count];
        }
    } else {
        xs = {};
        count = -1;
        f_meta = inst["\u001eƒalcor_metadata"];
        keys = Object.keys(inst);
        total = keys.length;
        if (f_meta) {
            var $code = f_meta["$code"],
                fm_abs_path = f_meta["abs_path"],
                fm_deref_to = f_meta["deref_to"],
                fm_deref_from = f_meta["deref_from"];
            xs["\u001eƒalcor_metadata"] = f_meta = {};
            $code && (f_meta["$code"] = $code);
            fm_abs_path && (f_meta["abs_path"] = fm_abs_path);
            fm_deref_to && (f_meta["deref_to"] = fm_deref_to);
            fm_deref_from && (f_meta["deref_from"] = fm_deref_from);
        }
        while (++count < total) {
            key = keys[count];
            if (key !== "\u001eƒalcor_metadata") {
                xs[key] = serializer(inst[key], serializer);
            }
        }
    }

    return xs;
}

module.exports = FalcorJSON;

/***/ },
/* 29 */
/***/ function(module, exports) {

"use strict";
"use strict";

module.exports = inlineJSONGraphValue;

/* eslint-disable no-constant-condition */
function inlineJSONGraphValue(node, path, length, seed) {

    var key,
        depth = 0,
        prev,
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

/***/ },
/* 30 */
/***/ function(module, exports) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isArray = Array.isArray;

module.exports = onMissing;

/* eslint-disable no-constant-condition */
function onMissing(path, depth, results, requestedPath, requestedLength, optimizedPath, optimizedLength) {

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
        missingPaths = results.requestedMissingPaths || (results.requestedMissingPaths = []);

    var isRequestedPath = true,
        index,
        count,
        mPath;

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
        missingPaths = results.optimizedMissingPaths || (results.optimizedMissingPaths = []);
    } while (true);
}
/* eslint-enable */

function isEmptyKeySet(keyset) {

    // false if the keyset is a primitive
    if ("object" !== (typeof keyset === "undefined" ? "undefined" : _typeof(keyset))) {
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

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var $atom = __webpack_require__(23);
var promote = __webpack_require__(14);
var isExpired = __webpack_require__(2);
var expireNode = __webpack_require__(6);

module.exports = onValueType;

function onValueType(node, type, path, depth, seed, results, requestedPath, requestedLength, optimizedPath, optimizedLength, fromReference, modelRoot, expired, boxValues, materialized, hasDataSource, treatErrorsAsValues, onValue, onMissing) {

    if (!node || !type) {
        if (materialized && !hasDataSource) {
            if (seed) {
                results.hasValue = true;
                return { $type: $atom };
            }
            return undefined;
        } else {
            return onMissing(path, depth, results, requestedPath, requestedLength, optimizedPath, optimizedLength);
        }
    } else if (isExpired(node)) {
        if (!node["\u001eƒalcor_invalidated"]) {
            expireNode(node, expired, modelRoot);
        }
        return onMissing(path, depth, results, requestedPath, requestedLength, optimizedPath, optimizedLength);
    }

    promote(modelRoot, node);

    if (seed) {
        if (fromReference) {
            requestedPath[depth] = null;
        }
        return onValue(node, type, depth, seed, results, requestedPath, optimizedPath, optimizedLength, fromReference, boxValues, materialized, treatErrorsAsValues);
    }

    return undefined;
}

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var removeNode = __webpack_require__(38);
var updateNodeAncestors = __webpack_require__(16);

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
        } else if (parent = node["\u001eƒalcor_parent"]) {
            // eslint-disable-line no-cond-assign
            removeNode(node, parent, node["\u001eƒalcor_key"], lru);
        }
        node = expired.pop();
    }

    if (total >= max) {
        var prev = lru["\u001eƒalcor_tail"];
        node = prev;
        while (total >= targetSize && node) {
            prev = prev["\u001eƒalcor_prev"];
            size = node.$size || 0;
            total -= size;
            if (shouldUpdate === true) {
                updateNodeAncestors(node, size, lru, version);
            }
            node = prev;
        }

        lru["\u001eƒalcor_tail"] = lru["\u001eƒalcor_prev"] = node;
        if (node == null) {
            lru["\u001eƒalcor_head"] = lru["\u001eƒalcor_next"] = undefined;
        } else {
            node["\u001eƒalcor_next"] = undefined;
        }
    }
};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var ModelResponse = __webpack_require__(5);
var checkCacheAndReport = __webpack_require__(56);
var getRequestCycle = __webpack_require__(109);
var noop = __webpack_require__(22);
var empty = { dispose: noop, unsubscribe: noop };
var collectLru = __webpack_require__(32);
var getSize = __webpack_require__(7);
var isFunction = __webpack_require__(3);

/**
 * The get response.  It takes in a model and paths and starts
 * the request cycle.  It has been optimized for cache first requests
 * and closures.
 * @param {Model} model -
 * @param {Array} paths -
 * @augments ModelResponse
 * @private
 */
var GetResponse = module.exports = function GetResponse(model, paths, isJSONGraph, isProgressive, forceCollect, initialCacheVersion, recycleJSON) {

    if (paths && paths[0] && Array.isArray(paths[0].$keys)) {
        paths = paths[0];
    }

    this.model = model;
    this.currentRemainingPaths = paths;
    this.isJSONGraph = isJSONGraph || false;
    this.isProgressive = isProgressive || false;
    this.forceCollect = forceCollect || false;
    this.recycleJSON = undefined !== recycleJSON ? recycleJSON : model._recycleJSON;

    var currentVersion = model._root.cache["\u001eƒalcor_version"];

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
    return new GetResponse(this.model, this.currentRemainingPaths, true, this.isProgressive, this.forceCollect, this.initialCacheVersion, this.recycleJSON);
};

/**
 * Progressively responding to data in the cache instead of once the whole
 * operation is complete.
 * @public
 */
GetResponse.prototype.progressively = function progressively() {
    return new GetResponse(this.model, this.currentRemainingPaths, this.isJSONGraph, true, this.forceCollect, this.initialCacheVersion, this.recycleJSON);
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
    var seed = [!shouldRecycleJSONSeed ? {} : model._seed || (model._seed = {})];

    var results = checkCacheAndReport(model, requestedPaths, observer, isProgressive, isJSONG, seed, errors, recycleJSON);

    // If there are no results, finish.
    if (!results) {

        var modelRoot = model._root;
        var modelCache = modelRoot.cache;
        var currentVersion = modelCache["\u001eƒalcor_version"];

        if (this.forceCollect) {
            collectLru(modelRoot, modelRoot.expired, getSize(modelCache), model._maxSize, model._collectRatio, currentVersion);
        }

        var initialCacheVersion = this.initialCacheVersion;
        var rootOnChangesCompletedHandler = modelRoot.onChangesCompleted;

        if (initialCacheVersion !== currentVersion && modelRoot.syncRefCount <= 0 && isFunction(rootOnChangesCompletedHandler)) {
            rootOnChangesCompletedHandler.call(modelRoot.topLevelModel);
        }
        return empty;
    }

    // Starts the async request cycle.
    return getRequestCycle(this, model, results, observer, errors, 1, this.initialCacheVersion, requestedPaths, recycleJSON);
};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var arr = new Array(3);
var isArray = Array.isArray;
var $ref = __webpack_require__(0);
var createHardlink = __webpack_require__(11);
var getCachePosition = __webpack_require__(13);
var hasOwn = __webpack_require__(15);
var isObject = __webpack_require__(1);
var isExpired = __webpack_require__(2);
var isFunction = __webpack_require__(3);
var isPrimitive = __webpack_require__(8);
var expireNode = __webpack_require__(6);
var mergeValueOrInsertBranch = __webpack_require__(61);
var NullInPathError = __webpack_require__(10);

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
    var parent = node["\u001eƒalcor_parent"] || cache;
    var initialVersion = cache["\u001eƒalcor_version"];

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

        setPathMap(pathMapEnvelope.json, 0, cache, parent, node, requestedPaths, optimizedPaths, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector);
    }

    arr[0] = undefined;
    arr[1] = undefined;
    arr[2] = undefined;

    var newVersion = cache["\u001eƒalcor_version"];
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }

    return [requestedPaths, optimizedPaths];
};

/* eslint-disable no-constant-condition */
function setPathMap(pathMap, depth, root, parent, node, requestedPaths, optimizedPaths, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector) {

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

            var results = setNode(root, parent, node, key, child, branch, false, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector);

            requestedPath[depth] = key;
            requestedPath.index = depth;

            var nextNode = results[0];
            var nextParent = results[1];
            var nextOptimizedPath = results[2];
            nextOptimizedPath[nextOptimizedPath.index++] = key;

            if (nextNode) {
                if (branch) {
                    setPathMap(child, depth + 1, root, nextParent, nextNode, requestedPaths, optimizedPaths, requestedPath, nextOptimizedPath, version, expired, lru, comparator, errorSelector);
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

function setReference(value, root, node, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector) {

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

        node = node["\u001eƒalcor_context"];

        if (node != null) {
            parent = node["\u001eƒalcor_parent"] || root;
            optimizedPath.index = reference.length;
        } else {

            var index = 0;
            var count = reference.length - 1;
            optimizedPath.index = index;

            parent = node = root;

            do {
                var key = reference[index];
                var branch = index < count;
                var results = setNode(root, parent, node, key, value, branch, true, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector);
                node = results[0];
                optimizedPath = results[2];
                if (isPrimitive(node)) {
                    optimizedPath.index = index;
                    return results;
                }
                parent = results[1];
            } while (index++ < count);

            optimizedPath.index = index;

            if (container["\u001eƒalcor_context"] !== node) {
                createHardlink(container, node);
            }
        }
    }

    arr[0] = node;
    arr[1] = parent;
    arr[2] = optimizedPath;

    return arr;
}

function setNode(root, parent, node, key, value, branch, reference, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector) {

    var type = node.$type;

    while (type === $ref) {

        var results = setReference(value, root, node, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector);

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
                key = node["\u001eƒalcor_key"];
            }
        } else {
            parent = node;
            node = parent[key];
        }

        node = mergeValueOrInsertBranch(parent, node, key, value, branch, reference, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector);
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
            if (key[0] === "\u001e" || key[0] === "$" || !hasOwn(pathMap, key)) {
                continue;
            }
            keys[itr++] = key;
        }
        return keys;
    }

    return void 0;
}

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var arr = new Array(3);
var $ref = __webpack_require__(0);
var createHardlink = __webpack_require__(11);
var getCachePosition = __webpack_require__(13);
var isExpired = __webpack_require__(2);
var isFunction = __webpack_require__(3);
var isPrimitive = __webpack_require__(8);
var expireNode = __webpack_require__(6);
var iterateKeySet = __webpack_require__(4).iterateKeySet;
var mergeValueOrInsertBranch = __webpack_require__(61);
var NullInPathError = __webpack_require__(10);

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
    var parent = node["\u001eƒalcor_parent"] || cache;
    var initialVersion = cache["\u001eƒalcor_version"];

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

        setPathSet(value, path, 0, cache, parent, node, requestedPaths, optimizedPaths, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector);
    }

    arr[0] = undefined;
    arr[1] = undefined;
    arr[2] = undefined;

    var newVersion = cache["\u001eƒalcor_version"];
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }

    return [requestedPaths, optimizedPaths];
};

/* eslint-disable no-constant-condition */
function setPathSet(value, path, depth, root, parent, node, requestedPaths, optimizedPaths, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector) {

    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet(keySet, note);
    var optimizedIndex = optimizedPath.index;

    do {

        requestedPath.depth = depth;
        requestedPath[depth] = key;
        requestedPath.index = depth;

        var results = setNode(root, parent, node, key, value, branch, false, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector);

        requestedPath[depth] = key;
        requestedPath.index = depth;

        var nextNode = results[0];
        var nextParent = results[1];
        var nextOptimizedPath = results[2];
        nextOptimizedPath[nextOptimizedPath.index++] = key;

        if (nextNode) {
            if (branch) {
                setPathSet(value, path, depth + 1, root, nextParent, nextNode, requestedPaths, optimizedPaths, requestedPath, nextOptimizedPath, version, expired, lru, comparator, errorSelector);
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

function setReference(value, root, node, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector) {

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

        node = node["\u001eƒalcor_context"];

        if (node != null) {
            parent = node["\u001eƒalcor_parent"] || root;
            optimizedPath.index = reference.length;
        } else {

            var index = 0;
            var count = reference.length - 1;

            parent = node = root;

            do {
                var key = reference[index];
                var branch = index < count;
                optimizedPath.index = index;

                var results = setNode(root, parent, node, key, value, branch, true, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector);
                node = results[0];
                optimizedPath = results[2];
                if (isPrimitive(node)) {
                    optimizedPath.index = index;
                    return results;
                }
                parent = results[1];
            } while (index++ < count);

            optimizedPath.index = index;

            if (container["\u001eƒalcor_context"] !== node) {
                createHardlink(container, node);
            }
        }
    }

    arr[0] = node;
    arr[1] = parent;
    arr[2] = optimizedPath;

    return arr;
}

function setNode(root, parent, node, key, value, branch, reference, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector) {

    var type = node.$type;

    while (type === $ref) {

        var results = setReference(value, root, node, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector);

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
                key = node["\u001eƒalcor_key"];
            }
        } else {
            parent = node;
            node = parent[key];
        }

        node = mergeValueOrInsertBranch(parent, node, key, value, branch, reference, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector);
    }

    arr[0] = node;
    arr[1] = parent;
    arr[2] = optimizedPath;

    return arr;
}

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var isArray = Array.isArray;
var isObject = __webpack_require__(1);

module.exports = function isJSONGraphEnvelope(envelope) {
    return isObject(envelope) && isArray(envelope.paths) && (isObject(envelope.jsonGraph) || isObject(envelope.jsong) || isObject(envelope.json) || isObject(envelope.values) || isObject(envelope.value));
};

/***/ },
/* 37 */
/***/ function(module, exports) {

"use strict";
"use strict";

module.exports = Date.now;

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var $ref = __webpack_require__(0);
var splice = __webpack_require__(53);
var isObject = __webpack_require__(1);
var unlinkBackReferences = __webpack_require__(127);
var unlinkForwardReference = __webpack_require__(128);

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
        parent[key] = node["\u001eƒalcor_parent"] = void 0;
        return true;
    }
    return false;
};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var hasOwn = __webpack_require__(15);
var removeNode = __webpack_require__(38);

module.exports = function removeNodeAndDescendants(node, parent, key, lru) {
    if (removeNode(node, parent, key, lru)) {
        if (node.$type == null) {
            for (var key2 in node) {
                if (key2[0] !== "\u001e" && key2[0] !== "$" && hasOwn(node, key2)) {
                    removeNodeAndDescendants(node[key2], node, key2, lru);
                }
            }
        }
        return true;
    }
    return false;
};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isArray = Array.isArray;
var isPathValue = __webpack_require__(21);
var isJSONGraphEnvelope = __webpack_require__(36);
var isJSONEnvelope = __webpack_require__(20);

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

        // Flat Buffer
        else if (isArray(arg["$keys"]) && allowedInput.flatBuffer) {
                valid = true;
            }

            // Path Syntax
            // else if (typeof arg === "string" && allowedInput.pathSyntax) {
            //     valid = true;
            // }

            // Path Value
            else if (isPathValue(arg) && allowedInput.pathValue) {
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
                        else if (typeof arg === "function" && i + 1 === len && allowedInput.selector) {
                                valid = true;
                            }

        if (!valid) {
            return new Error("Unrecognized argument " + (typeof arg === "undefined" ? "undefined" : _typeof(arg)) + " [" + String(arg) + "] " + "to Model#" + method + "");
        }
    }
    return true;
};

/***/ },
/* 41 */
/***/ function(module, exports) {

"use strict";
"use strict";

module.exports = 1;

/***/ },
/* 42 */
/***/ function(module, exports) {

"use strict";
"use strict";

module.exports = 0;

/***/ },
/* 43 */
/***/ function(module, exports) {

"use strict";
"use strict";

module.exports = getHashCode;

function getHashCode(str) {
    var hash = 5381,
        i = str.length;
    while (i) {
        hash = hash * 33 ^ str.charCodeAt(--i);
    }
    // JavaScript does bitwise operations (like XOR, above) on 32-bit signed
    // integers. Since we want the results to be always positive, convert the
    // signed int to an unsigned by doing an unsigned bitshift.
    return hash >>> 0;
}

/***/ },
/* 44 */
/***/ function(module, exports) {

"use strict";
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

            var idx = note.arrayOffset,
                length = keySet.length;
            if (idx >= length) {
                note.done = true;
                break;
            }

            var el = keySet[note.arrayOffset];
            var type = typeof el === 'undefined' ? 'undefined' : _typeof(el);

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
    var to = memo.to = key.to || typeof key.length === 'number' && memo.from + key.length - 1 || 0;
    memo.rangeOffset = memo.from;
    memo.loaded = true;
    if (from > to) {
        memo.empty = true;
    }
}

function initializeNote(key, note) {
    note.done = false;
    var isObject = note.isObject = !!(key && (typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object');
    note.isArray = isObject && isArray(key);
    note.arrayOffset = 0;
}

/***/ },
/* 45 */
/***/ function(module, exports) {

"use strict";
"use strict";

function cloneArray(arr, index) {
    var a = [];
    var len = arr.length;
    for (var i = index || 0; i < len; i++) {
        a[i] = arr[i];
    }
    return a;
}

module.exports = cloneArray;

/***/ },
/* 46 */
/***/ function(module, exports) {

"use strict";
'use strict';

module.exports = {
    $ref: 'ref',
    $atom: 'atom',
    $error: 'error'
};

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isArray = Array.isArray;
var typeOfObject = "object";
var typeOfString = "string";
var typeOfNumber = "number";
var MAX_SAFE_INTEGER = 9007199254740991; // Number.MAX_SAFE_INTEGER in es6
var MAX_SAFE_INTEGER_DIGITS = 16; // String(Number.MAX_SAFE_INTEGER).length
var MIN_SAFE_INTEGER_DIGITS = 17; // String(Number.MIN_SAFE_INTEGER).length (including sign)
var abs = Math.abs;
var safeNumberRegEx = /^(0|(\-?[1-9][0-9]*))$/;
var nullTerminator = __webpack_require__(25);

/* jshint forin: false */
module.exports = function toPaths(lengths) {
    var pathmap;
    var allPaths = [];
    var allPathsLength = 0;
    for (var length in lengths) {
        if (isSafeNumber(length) && isObject(pathmap = lengths[length])) {
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
    return value !== null && (typeof value === "undefined" ? "undefined" : _typeof(value)) === typeOfObject;
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

    var subPath, subCode, subKeys, subKeysIndex, subKeysCount, subSets, subSetsIndex, subSetsCount, pathset, pathsetIndex, pathsetCount, firstSubKey, pathsetClone;

    subKeys = [];
    subKeysIndex = -1;

    if (depth < length - 1) {

        subKeysCount = getSortedKeys(pathmap, subKeys);

        while (++subKeysIndex < subKeysCount) {
            key = subKeys[subKeysIndex];
            subPath = collapsePathMap(pathmap[key], depth + 1, length);
            subCode = subPath.code;
            if (subs[subCode]) {
                subPath = subs[subCode];
            } else {
                codes[codesCount++] = subCode;
                subPath = subs[subCode] = {
                    keys: [],
                    sets: subPath.sets
                };
            }
            code = getHashCode(code + key + subCode);

            isSafeNumber(key) && subPath.keys.push(parseInt(key, 10)) || subPath.keys.push(key);
        }

        while (++codesIndex < codesCount) {

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

        if (!isSafeNumber(key) /* || hash[key] === true*/) {
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
 * Return true if argument is a number or can be cast to a number which
 * roundtrips to the same string.
 * @private
 */
function isSafeNumber(val) {
    var num = val;
    var type = typeof val === "undefined" ? "undefined" : _typeof(val);
    if (type === typeOfString) {
        var length = val.length;
        // Number.MIN_SAFE_INTEGER is 17 digits including the sign.
        // Anything longer cannot be safe.
        if (length === 0 || length > MIN_SAFE_INTEGER_DIGITS) {
            return false;
        }
        if (!safeNumberRegEx.test(val)) {
            return false;
        }
        // Number.MAX_SAFE_INTEGER is 16 digits.
        // Anything shorter must be safe.
        if (length < MAX_SAFE_INTEGER_DIGITS) {
            return true;
        }
        num = +val;
    } else if (type !== typeOfNumber) {
        return false;
    }
    // Number.isSafeInteger(num) in es6.
    return num % 1 === 0 && abs(num) <= MAX_SAFE_INTEGER;
}

// export for testing
module.exports._isSafeNumber = isSafeNumber;

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isArray = Array.isArray;
var nullTerminator = __webpack_require__(25);

/**
 * @param {Array} paths -
 * @returns {Object} -
 */
module.exports = function toTree(paths) {
    return paths.reduce(function (acc, path) {
        return innerToTree(acc, path, 0, path.length);
    }, {});
};

function innerToTree(seed, path, depth, length) {

    if (depth === length) {
        return true;
    }

    var keyset,
        keysetIndex = -1,
        keysetLength = 0;
    var node,
        next,
        nextKey,
        nextDepth = depth + 1,
        keyIsRange,
        rangeEnd,
        keysOrRanges;

    keyset = path[depth];

    if (keyset === null) {
        return nullTerminator;
    }

    seed = seed || {};

    iteratingKeyset: do {
        // If the keyset is a primitive value, we've found our `nextKey`.
        if ('object' !== (typeof keyset === 'undefined' ? 'undefined' : _typeof(keyset))) {
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
                    if (rangeEnd - nextKey < 0) {
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

/***/ },
/* 49 */
/***/ function(module, exports) {

"use strict";
"use strict";

var NAME = "CircularReferenceError";

/**
 * Does not allow null in path
 */
function CircularReferenceError(referencePath) {
    var err = Error.call(this, "Encountered circular reference " + JSON.stringify(referencePath));
    err.name = NAME;
    this.stack = err.stack;
    this.message = err.message;
    return this;
}

// instanceof will be an error, but stack will be correct because its defined in the constructor.
CircularReferenceError.prototype = Object.create(Error.prototype);
CircularReferenceError.prototype.name = NAME;

module.exports = CircularReferenceError;

/***/ },
/* 50 */
/***/ function(module, exports) {

"use strict";
"use strict";

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
MaxRetryExceededError.is = function (e) {
    return e && e.name === NAME;
};

module.exports = MaxRetryExceededError;

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var arr = new Array(3);
var $ref = __webpack_require__(0);
var promote = __webpack_require__(14);
var isExpired = __webpack_require__(2);
var createHardlink = __webpack_require__(11);
var CircularReferenceError = __webpack_require__(49);

module.exports = getReferenceTarget;

/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function getReferenceTarget(root, ref, modelRoot) {

    promote(modelRoot, ref);

    var context,
        key,
        type,
        depth = 0,
        followedRefsCount = 0,
        node = root,
        path = ref.value,
        copy = path,
        length = path.length;

    do {
        if (depth === 0 && undefined !== (context = ref["\u001eƒalcor_context"])) {
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

                if (true) {
                    // If we follow too many references, we might have an indirect
                    // circular reference chain. Warn about this (but don't throw).
                    if (++followedRefsCount % 50 === 0) {
                        try {
                            throw new Error("Followed " + followedRefsCount + " references. " + "This might indicate the presence of an indirect " + "circular reference chain.");
                        } catch (e) {
                            if (console) {
                                var reportFn = typeof console.warn === "function" && console.warn || typeof console.log === "function" && console.log;
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

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var clone = __webpack_require__(12);
var onError = __webpack_require__(93);
var $atom = __webpack_require__(23);
var $error = __webpack_require__(17);

module.exports = onJSONValue;

function onJSONValue(node, type, depth, seed, results, requestedPath, optimizedPath, optimizedLength, fromReference, boxValues, materialized, treatErrorsAsValues) {

    if ($error === type && !treatErrorsAsValues) {
        return onError(node, depth, results, requestedPath, fromReference, boxValues);
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

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

module.exports = function lruSplice(root, object) {

    // Its in the cache.  Splice out.
    var prev = object["\u001eƒalcor_prev"];
    var next = object["\u001eƒalcor_next"];
    if (next) {
        next["\u001eƒalcor_prev"] = prev;
    }
    if (prev) {
        prev["\u001eƒalcor_next"] = next;
    }
    object["\u001eƒalcor_prev"] = object["\u001eƒalcor_next"] = undefined;

    if (object === root["\u001eƒalcor_head"]) {
        root["\u001eƒalcor_head"] = next;
    }
    if (object === root["\u001eƒalcor_tail"]) {
        root["\u001eƒalcor_tail"] = prev;
    }
};

/***/ },
/* 54 */
/***/ function(module, exports) {

"use strict";
"use strict";

module.exports = {
    GetRequest: "GET"
};

/***/ },
/* 55 */
/***/ function(module, exports) {

"use strict";
"use strict";

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

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var gets = __webpack_require__(27);
var mergeInto = __webpack_require__(111);
var collapse = __webpack_require__(4).collapse;
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
module.exports = function checkCacheAndReport(model, requestedPaths, observer, progressive, isJSONG, seed, errors, recycleJSON) {

    var recycledJSONSeed, f_meta, originalHashCode;
    var originalSeed,
        isSeedImmutable = progressive && !isJSONG && seed;
    var shouldRecycleJSONSeed = !isJSONG && !progressive && recycleJSON;

    // If we request paths as JSON in progressive mode, ensure each progressive
    // valueNode is immutable. If not in progressive mode, we can write into the
    // same JSON tree until the request is completed.
    if (isSeedImmutable) {
        originalSeed = seed[0];
        seed[0] = {};
    } else if (shouldRecycleJSONSeed && seed[0] && (recycledJSONSeed = seed[0].json) && (f_meta = recycledJSONSeed["\u001eƒalcor_metadata"])) {
        originalHashCode = f_meta["$code"];
    }

    // checks the cache for the data.
    var results;
    if (isJSONG) {
        results = getWithPathsAsJSONGraph(model, requestedPaths, seed);
    } else {
        results = getWithPathsAsPathMap(model, requestedPaths, seed, !recycleJSON);
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
    var hasValueOverall = Boolean(valueNode && valueNode.json || valueNode.jsonGraph);

    // We are done when there are no missing paths or the model does not
    // have a dataSource to continue on fetching from.
    var completed = !results.requestedMissingPaths || !results.requestedMissingPaths.length || !model._source;

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

    if (shouldRecycleJSONSeed && seed[0] && (recycledJSONSeed = seed[0].json) && (f_meta = recycledJSONSeed["\u001eƒalcor_metadata"])) {
        f_meta["$code"] = originalHashCode;
    }

    // Return the results object.
    return results;
};

/***/ },
/* 57 */
/***/ function(module, exports) {

"use strict";
"use strict";

module.exports = {
    path: true,
    pathSyntax: true,
    flatBuffer: true
};

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var ModelResponse = __webpack_require__(5);
var isArray = Array.isArray;
var isPathValue = __webpack_require__(21);
var isJSONGraphEnvelope = __webpack_require__(36);
var isJSONEnvelope = __webpack_require__(20);
var setRequestCycle = __webpack_require__(114);

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
var SetResponse = module.exports = function SetResponse(model, args, isJSONGraph, isProgressive, initialCacheVersion) {

    // The response properties.
    this._model = model;
    this._isJSONGraph = isJSONGraph || false;
    this._isProgressive = isProgressive || false;
    this._initialArgs = args;
    this._value = [{}];

    var currentVersion = model._root.cache["\u001eƒalcor_version"];

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
        if (isArray(arg)) {
            argType = "PathValues";
        } else if (isPathValue(arg)) {
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
    return setRequestCycle(model, observer, groups, isJSONGraph, isProgressive, 0, this.initialCacheVersion);
};

/**
 * Makes the output of a get response JSONGraph instead of json.
 * @private
 */
SetResponse.prototype._toJSONG = function _toJSONGraph() {
    return new SetResponse(this._model, this._initialArgs, true, this._isProgressive, this.initialCacheVersion);
};

/**
 * Progressively responding to data in the cache instead of once the whole
 * operation is complete.
 * @public
 */
SetResponse.prototype.progressively = function progressively() {
    return new SetResponse(this._model, this._initialArgs, this._isJSONGraph, true, this.initialCacheVersion);
};

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var isObject = __webpack_require__(1);
module.exports = function getTimestamp(node) {
    return isObject(node) && node.$timestamp || undefined;
};

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

module.exports = function insertNode(node, parent, key, version, optimizedPath) {
    node["\u001eƒalcor_key"] = key;
    node["\u001eƒalcor_parent"] = parent;

    if (version !== undefined) {
        node["\u001eƒalcor_version"] = version;
    }
    if (!node["\u001eƒalcor_abs_path"]) {
        node["\u001eƒalcor_abs_path"] = optimizedPath.slice(0, optimizedPath.index).concat(key);
    }

    parent[key] = node;

    return node;
};

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var $ref = __webpack_require__(0);
var $error = __webpack_require__(17);
var getType = __webpack_require__(122);
var getSize = __webpack_require__(7);
var getTimestamp = __webpack_require__(59);

var isExpired = __webpack_require__(2);
var isPrimitive = __webpack_require__(8);
var isFunction = __webpack_require__(3);

var wrapNode = __webpack_require__(65);
var expireNode = __webpack_require__(6);
var insertNode = __webpack_require__(60);
var replaceNode = __webpack_require__(63);
var updateNodeAncestors = __webpack_require__(16);
var reconstructPath = __webpack_require__(62);

module.exports = function mergeValueOrInsertBranch(parent, node, key, value, branch, reference, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector) {

    var type = getType(node, reference);

    if (branch || reference) {
        if (type && isExpired(node)) {
            type = "expired";
            expireNode(node, expired, lru);
        }
        if (type && type !== $ref || isPrimitive(node)) {
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
        var isDistinct = getTimestamp(message) < getTimestamp(node) === false;
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

/***/ },
/* 62 */
/***/ function(module, exports) {

"use strict";
"use strict";

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

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var isObject = __webpack_require__(1);
var transferBackReferences = __webpack_require__(126);
var removeNodeAndDescendants = __webpack_require__(39);
var updateBackReferenceVersions = __webpack_require__(64);

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

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

module.exports = function updateBackReferenceVersions(nodeArg, version) {
    var stack = [nodeArg];
    var count = 0;
    do {
        var node = stack[count];
        if (node && node["\u001eƒalcor_version"] !== version) {
            node["\u001eƒalcor_version"] = version;
            stack[count++] = node["\u001eƒalcor_parent"];
            var i = -1;
            var n = node["\u001eƒalcor_refs_length"] || 0;
            while (++i < n) {
                stack[count++] = node["\u001eƒalcor_ref" + i];
            }
        }
    } while (--count > -1);
    return nodeArg;
};

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var now = __webpack_require__(37);
var expiresNow = __webpack_require__(42);

var atomSize = 50;

var clone = __webpack_require__(120);
var isArray = Array.isArray;
var getSize = __webpack_require__(7);
var getExpires = __webpack_require__(121);
var atomType = __webpack_require__(23);

module.exports = function wrapNode(nodeArg, typeArg, value) {

    var size = 0;
    var node = nodeArg;
    var type = typeArg;

    if (type) {
        var modelCreated = node["\u001eƒalcor_wrapped_value"];
        node = clone(node);
        size = getSize(node);
        node.$type = type;
        node["\u001eƒalcor_prev"] = undefined;
        node["\u001eƒalcor_next"] = undefined;
        node["\u001eƒalcor_wrapped_value"] = modelCreated || false;
    } else {
        node = { $type: atomType, value: value };
        node["\u001eƒalcor_prev"] = undefined;
        node["\u001eƒalcor_next"] = undefined;
        node["\u001eƒalcor_wrapped_value"] = true;
    }

    if (value == null) {
        size = atomSize + 1;
    } else if (size == null || size <= 0) {
        switch (typeof value === "undefined" ? "undefined" : _typeof(value)) {
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
        node.$expires = now() + expires * -1;
    }

    node.$size = size;

    return node;
};

/***/ },
/* 66 */
/***/ function(module, exports) {

var g;

// This works in non-strict mode
g = (function() { return this; })();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var Model = __webpack_require__(80);
var FalcorJSON = __webpack_require__(28);

function falcor(opts) {
    return new Model(opts);
}

falcor["Model"] = Model;
falcor["FalcorJSON"] = FalcorJSON;
falcor["toProps"] = FalcorJSON.prototype.toProps;

module.exports = falcor;

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var toPaths = __webpack_require__(47);
var toTree = __webpack_require__(48);

module.exports = function collapse(paths) {
    var collapseMap = paths.reduce(function (acc, path) {
        var len = path.length;
        if (!acc[len]) {
            acc[len] = [];
        }
        acc[len].push(path);
        return acc;
    }, {});

    Object.keys(collapseMap).forEach(function (collapseKey) {
        collapseMap[collapseKey] = toTree(collapseMap[collapseKey]);
    });

    return toPaths(collapseMap);
};

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isArray = Array.isArray;
var getHashCode = __webpack_require__(43);

module.exports = computeFlatBufferHash;

function computeFlatBufferHash(seed) {

    if (seed === undefined) {
        return undefined;
    }

    var code = '';
    var keys = seed['$keys'];
    var keysIndex = -1;
    var keysLength = keys.length;

    while (++keysIndex < keysLength) {

        var key = keys[keysIndex];

        if (key === null) {
            code = '' + getHashCode('' + code + 'null');
            continue;
        } else if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
            key = '{from:' + key.from + ',length:' + key.length + '}';
        }

        var next = computeFlatBufferHash(seed[keysIndex]);
        if (next === undefined) {
            code = '' + getHashCode('' + code + key);
        } else {
            code = '' + getHashCode('' + code + key + next['$code']);
        }
    }

    seed['$code'] = code;

    return seed;
}

/***/ },
/* 70 */
/***/ function(module, exports) {

"use strict";
'use strict';

/*eslint-disable*/
module.exports = {
    innerReferences: 'References with inner references are not allowed.',
    circularReference: 'There appears to be a circular reference, maximum reference following exceeded.'
};

/***/ },
/* 71 */
/***/ function(module, exports) {

"use strict";
"use strict";

module.exports = flatBufferToPaths;

function flatBufferToPaths(flatBuf, paths, path) {

    path = path || [];
    paths = paths || [];

    var leaf = [];
    var keys = flatBuf.$keys;
    var keysLen = keys.length;
    var keysIndex = -1,
        key,
        len;

    while (++keysIndex < keysLen) {

        var rest = flatBuf[keysIndex];
        var keyset = keys[keysIndex];

        if (!rest) {
            leaf.push(keyset);
        } else {
            flatBufferToPaths(rest, paths, path.concat([keyset]));
        }
    }

    if (leaf.length === 1) {
        paths.push(path.concat(leaf));
    } else if (leaf.length > 1) {
        paths.push(path.concat([leaf]));
    }

    return paths;
}

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var cloneArray = __webpack_require__(45);
var $ref = __webpack_require__(46).$ref;
var errors = __webpack_require__(70);

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

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

module.exports = {
    toTree: __webpack_require__(48),
    toPaths: __webpack_require__(47),
    collapse: __webpack_require__(68),
    pathCount: __webpack_require__(75),
    getHashCode: __webpack_require__(43),
    toFlatBuffer: __webpack_require__(79),
    iterateKeySet: __webpack_require__(44),
    hasIntersection: __webpack_require__(24),
    optimizePathSets: __webpack_require__(74),
    flatBufferToPaths: __webpack_require__(71),
    computeFlatBufferHash: __webpack_require__(69),
    pathsComplementFromTree: __webpack_require__(77),
    pathsComplementFromLengthTree: __webpack_require__(76)
};

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var iterateKeySet = __webpack_require__(44);
var cloneArray = __webpack_require__(45);
var catAndSlice = __webpack_require__(78);
var $types = __webpack_require__(46);
var $ref = $types.$ref;
var followReference = __webpack_require__(72);

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
    paths.forEach(function (p) {
        optimizePathSet(cache, cache, p, 0, optimized, [], maxRefFollow);
    });

    return optimized;
};

/**
 * optimizes one pathSet at a time.
 */
function optimizePathSet(cache, cacheRoot, pathSet, depth, out, optimizedPath, maxRefFollow) {

    // at missing, report optimized path.
    if (cache === undefined) {
        out[out.length] = catAndSlice(optimizedPath, pathSet, depth);
        return;
    }

    // all other sentinels are short circuited.
    // Or we found a primitive (which includes null)
    if (cache === null || cache.$type && cache.$type !== $ref || (typeof cache === 'undefined' ? 'undefined' : _typeof(cache)) !== 'object') {
        return;
    }

    // If the reference is the last item in the path then do not
    // continue to search it.
    if (cache.$type === $ref && depth === pathSet.length) {
        return;
    }

    var keySet = pathSet[depth];
    var isKeySet = (typeof keySet === 'undefined' ? 'undefined' : _typeof(keySet)) === 'object';
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
            var refResults = followReference(cacheRoot, next.value, maxRefFollow);
            next = refResults[0];

            // must clone to avoid the mutation from above destroying the cache.
            nextOptimized = cloneArray(refResults[1]);
        } else {
            nextOptimized = optimizedPath;
        }

        optimizePathSet(next, cacheRoot, pathSet, nextDepth, out, nextOptimized, maxRefFollow);
        optimizedPath.length = optimizedPathLength;

        if (iteratorNote && !iteratorNote.done) {
            key = iterateKeySet(keySet, iteratorNote);
        }
    } while (iteratorNote && !iteratorNote.done);
}

/***/ },
/* 75 */
/***/ function(module, exports) {

"use strict";
"use strict";

/**
 * Helper for getPathCount. Used to determine the size of a key or range.
 * @function
 * @param {Object} rangeOrKey
 * @return The size of the key or range passed in.
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function getRangeOrKeySize(rangeOrKey) {
    if (rangeOrKey == null) {
        return 1;
    } else if (Array.isArray(rangeOrKey)) {
        throw new Error("Unexpected Array found in keySet: " + JSON.stringify(rangeOrKey));
    } else if ((typeof rangeOrKey === "undefined" ? "undefined" : _typeof(rangeOrKey)) === "object") {
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
            return to - from + 1;
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

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var hasIntersection = __webpack_require__(24);

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

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var hasIntersection = __webpack_require__(24);

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

/***/ },
/* 78 */
/***/ function(module, exports) {

"use strict";
"use strict";

module.exports = function catAndSlice(a, b, slice) {
    var next = [],
        i,
        j,
        len;
    for (i = 0, len = a.length; i < len; ++i) {
        next[i] = a[i];
    }

    for (j = slice || 0, len = b.length; j < len; ++j, ++i) {
        next[i] = b[j];
    }

    return next;
};

/***/ },
/* 79 */
/***/ function(module, exports) {

"use strict";
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isArray = Array.isArray;
var nullBuffer = { '$keys': [null], '$keysMap': { 'null': 0 } };

module.exports = toFlatBuffer;

/*
var inspect = require('util').inspect;
var computeFlatBufferHash = require('./computeFlatBufferHash');
var flatBuf = computeFlatBufferHash(toFlatBuffer([
    ['genreLists', 'length'],
    ['genreLists', { from: 1, length: 9 }, ['name', 'rating']],
    ['genreLists', { from: 1, length: 9 }, 'color', null],
    ['genreLists', { from: 1, length: 9 }, 'titles', 'length'],
    ['genreLists', { from: 1, length: 9 }, 'titles', { from: 9, length: 2 }, ['name', 'rating', 'box-shot']],
]));

console.log(inspect(flatBuf, { depth: null }));
*/

function toFlatBuffer(paths) {
    return paths.reduce(function (seed, path) {
        return _toFlatBuffer(seed, path, 0, path.length);
    }, {});
}

function _toFlatBuffer(seed, path, depth, length) {

    if (depth === length) {
        return undefined;
    }

    seed = seed || {};
    var keys = seed['$keys'] || (seed['$keys'] = []);
    var keysMap = seed['$keysMap'] || (seed['$keysMap'] = {});
    var keysIndex = -1;

    var keyset,
        keysetIndex = -1,
        keysetLength = 0;
    var node,
        next,
        nextKey,
        nextDepth = depth + 1,
        rangeEnd,
        keysOrRanges;

    keyset = path[depth];

    if (keyset === null) {
        return nullBuffer;
    }

    iteratingKeyset: do {
        // If the keyset is a primitive value, we've found our `nextKey`.
        if ('object' !== (typeof keyset === 'undefined' ? 'undefined' : _typeof(keyset))) {
            nextKey = keyset;
            if ('undefined' === typeof (keysIndex = keysMap[nextKey])) {
                keysIndex = keys.length;
            }
            keys[keysIndex] = nextKey;
            keysMap[nextKey] = keysIndex;
            next = _toFlatBuffer(seed[keysIndex], path, nextDepth, length);
            if (next !== undefined) {
                seed[keysIndex] = next;
            }
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
                    if ('number' !== typeof rangeEnd) {
                        rangeEnd = nextKey + (keyset.length || 0) - 1;
                    }
                    if (rangeEnd - nextKey < 0) {
                        break iteratingKeyset;
                    }
                    keyset = { from: nextKey, length: rangeEnd - nextKey + 1 };
                    nextKey = '{from:' + nextKey + ',length:' + (rangeEnd - nextKey + 1) + '}';
                    if ('undefined' === typeof (keysIndex = keysMap[nextKey])) {
                        keysIndex = keys.length;
                    }
                    keys[keysIndex] = keyset;
                    keysMap[nextKey] = keysIndex;
                    next = _toFlatBuffer(seed[keysIndex], path, nextDepth, length);
                    if (next !== undefined) {
                        seed[keysIndex] = next;
                    }
                }

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

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var ModelRoot = __webpack_require__(82);
var ModelDataSourceAdapter = __webpack_require__(81);

var RequestQueue = __webpack_require__(103);
var ModelResponse = __webpack_require__(5);
var CallResponse = __webpack_require__(107);
var InvalidateResponse = __webpack_require__(108);

var TimeoutScheduler = __webpack_require__(117);
var ImmediateScheduler = __webpack_require__(116);

var collectLru = __webpack_require__(32);

var getSize = __webpack_require__(7);
var isObject = __webpack_require__(1);
var isFunction = __webpack_require__(3);
var isPrimitive = __webpack_require__(8);
var isJSONEnvelope = __webpack_require__(20);
var getCachePosition = __webpack_require__(13);
var isJSONGraphEnvelope = __webpack_require__(36);

var setCache = __webpack_require__(34);
var setJSONGraphs = __webpack_require__(19);
var validateInput = __webpack_require__(40);
var noOp = function noOp() {};
var getCache = __webpack_require__(89);
var get = __webpack_require__(27);
var GET_VALID_INPUT = __webpack_require__(57);

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
    this._node = options._node || this._root.cache;
    this._source = options.source || options._source;
    this._recycleJSON = options.recycleJSON || options._recycleJSON;
    this._request = options.request || options._request || new RequestQueue(this, options.scheduler || new ImmediateScheduler());

    if (typeof options.maxSize === "number") {
        this._maxSize = options.maxSize;
    } else {
        this._maxSize = options._maxSize || Model.prototype._maxSize;
    }

    if (options._seed) {
        this._seed = options._seed;
        this._recycleJSON = true;
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
    } else if (this._recycleJSON) {
        this._treatErrorsAsValues = true;
    }

    this._allowFromWhenceYouCame = options.allowFromWhenceYouCame || options._allowFromWhenceYouCame || false;

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
Model.prototype.get = __webpack_require__(110);

/**
 * Sets the value at one or more places in the JSONGraph model. The set method accepts one or more {@link PathValue}s, each of which is a combination of a location in the document and the value to place there.  In addition to accepting  {@link PathValue}s, the set method also returns the values after the set operation is complete.
 * @function
 * @return {ModelResponse.<JSONEnvelope>} - an {@link Observable} stream containing the values in the JSONGraph model after the set was attempted
 */
Model.prototype.set = __webpack_require__(112);

/**
 * The preload method retrieves several {@link Path}s or {@link PathSet}s from a {@link Model} and loads them into the Model cache.
 * @function
 * @param {...PathSet} path - the path(s) to retrieve
 * @return {ModelResponse.<JSONEnvelope>} - a ModelResponse that completes when the data has been loaded into the cache.
 */
Model.prototype.preload = function preload() {
    var out = validateInput(arguments, GET_VALID_INPUT, "preload");
    if (out !== true) {
        return new ModelResponse(function (o) {
            o.onError(out);
        });
    }
    var args = Array.prototype.slice.call(arguments);
    var self = this;
    return new ModelResponse(function (obs) {
        return self.get.apply(self, args).subscribe(function () {}, function (err) {
            obs.onError(err);
        }, function () {
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
        var argType = typeof arg === "undefined" ? "undefined" : _typeof(arg);
        if (argsIdx > 1 && !Array.isArray(arg) || argsIdx === 0 && !Array.isArray(arg) && argType !== "string" || argsIdx === 1 && !Array.isArray(arg) && !isPrimitive(arg)) {
            /* eslint-disable no-loop-func */
            return new ModelResponse(function (o) {
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
        args[argsIdx] = arguments[argsIdx];
        if (!Array.isArray(args[argsIdx])) {
            throw new Error("Invalid argument");
        }
    }

    // creates the obs, subscribes and will throw the errors if encountered.
    new InvalidateResponse(this, args).subscribe(noOp, function (e) {
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
Model.prototype.deref = __webpack_require__(85);

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
Model.prototype._hasValidParentReference = __webpack_require__(84);

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
Model.prototype.getValue = __webpack_require__(90);

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
Model.prototype.setValue = __webpack_require__(118);

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
            get.getWithPathsAsPathMap(this, out, [], true);
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
    for (var _len = arguments.length, paths = Array(_len), _key = 0; _key < _len; _key++) {
        paths[_key] = arguments[_key];
    }

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
Model.prototype.getVersion = function getVersion() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

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
    if (opts) {
        for (var key in opts) {
            var value = opts[key];
            if (value === "delete") {
                delete clone[key];
            } else if (key === "_path") {
                clone[key] = value;
                if (false === opts.hasOwnProperty("_node")) {
                    delete clone["_node"];
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
    var abs_path = node && node["\u001eƒalcor_abs_path"] || [];
    return abs_path.slice(0);
};

Model.prototype._getVersion = __webpack_require__(91);
Model.prototype._getPathValuesAsPathMap = get.getWithPathsAsPathMap;
Model.prototype._getPathValuesAsJSONG = get.getWithPathsAsJSONGraph;

Model.prototype._setPathValues = __webpack_require__(35);
Model.prototype._setPathMaps = __webpack_require__(34);
Model.prototype._setJSONGs = __webpack_require__(19);
Model.prototype._setCache = __webpack_require__(34);

Model.prototype._invalidatePathValues = __webpack_require__(101);
Model.prototype._invalidatePathMaps = __webpack_require__(100);

/***/ },
/* 81 */
/***/ function(module, exports) {

"use strict";
"use strict";

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

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var hasOwn = __webpack_require__(15);
var isFunction = __webpack_require__(3);

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
        return cacheNode.value === messageNode.value && cacheNode.$type === messageNode.$type && cacheNode.$expires === messageNode.$expires;
    }
    return cacheNode === messageNode;
};

module.exports = ModelRoot;

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var objectTypes = {
    "boolean": false,
    "function": true,
    "object": true,
    "number": false,
    "string": false,
    "undefined": false
};

/*eslint-disable */
var _root = objectTypes[typeof self === "undefined" ? "undefined" : _typeof(self)] && self || objectTypes[typeof window === "undefined" ? "undefined" : _typeof(window)] && window;
var freeGlobal = objectTypes[typeof global === "undefined" ? "undefined" : _typeof(global)] && global;

if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    _root = freeGlobal;
}
/*eslint-enable */

var _id = 0;

function ensureSymbol(root) {
    if (!root.Symbol) {
        root.Symbol = function symbolFuncPolyfill(description) {
            return "@@Symbol(" + description + "):" + _id++ + "}";
        };
    }
    return root.Symbol;
}

function ensureObservable(_Symbol) {
    /* eslint-disable dot-notation */
    if (!_Symbol.observable) {
        if (typeof _Symbol.for === "function") {
            _Symbol["observable"] = _Symbol.for("observable");
        } else {
            _Symbol["observable"] = "@@observable";
        }
    }
    /* eslint-disable dot-notation */
}

function symbolForPolyfill(key) {
    return "@@" + key;
}

function ensureFor(_Symbol2) {
    /* eslint-disable dot-notation */
    if (!_Symbol2.for) {
        _Symbol2["for"] = symbolForPolyfill;
    }
    /* eslint-enable dot-notation */
}

function polyfillSymbol(root) {
    var _Symbol3 = ensureSymbol(root);
    ensureObservable(_Symbol3);
    ensureFor(_Symbol3);
    return _Symbol3;
}

module.exports = polyfillSymbol(_root);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(66)))

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

module.exports = hasValidParentReference;

function hasValidParentReference() {
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
    if (reference && reference["\u001eƒalcor_parent"] === undefined) {
        return false;
    }

    // The reference has expired but has not been collected from the graph.
    if (reference && reference["\u001eƒalcor_invalidated"]) {
        return false;
    }

    return true;
}

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var CONTAINER_DOES_NOT_EXIST = "e";
var $ref = __webpack_require__(0);
var getCachePosition = __webpack_require__(13);
var InvalidDerefInputError = __webpack_require__(87);

module.exports = function deref(boundJSONArg) {

    if (!boundJSONArg || (typeof boundJSONArg === "undefined" ? "undefined" : _typeof(boundJSONArg)) !== 'object') {
        throw new InvalidDerefInputError();
    }

    var referenceContainer, currentRefPath, i, len;
    var jsonMetadata = boundJSONArg && boundJSONArg["\u001eƒalcor_metadata"];

    if (!jsonMetadata || (typeof jsonMetadata === "undefined" ? "undefined" : _typeof(jsonMetadata)) !== 'object') {
        return this._clone({
            _node: undefined
        });
    }

    var recycleJSON = this._recycleJSON;
    var absolutePath = jsonMetadata["abs_path"];

    if (!absolutePath) {
        return this._clone({
            _node: undefined,
            _seed: recycleJSON && { json: boundJSONArg } || undefined
        });
    } else if (absolutePath.length === 0) {
        return this._clone({
            _path: absolutePath,
            _node: this._root.cache,
            _referenceContainer: true,
            _seed: recycleJSON && { json: boundJSONArg } || undefined
        });
    }

    var originalRefPath = jsonMetadata["deref_to"];
    var originalAbsPath = jsonMetadata["deref_from"];

    // We deref and then ensure that the reference container is attached to
    // the model.
    var cacheRoot = this._root.cache;
    var cacheNode = getCachePosition(cacheRoot, absolutePath);
    var validContainer = CONTAINER_DOES_NOT_EXIST;

    if (originalAbsPath) {

        validContainer = false;

        i = -1;
        len = originalAbsPath.length;
        referenceContainer = cacheRoot;
        while (++i < len) {
            referenceContainer = referenceContainer[originalAbsPath[i]];
            if (!referenceContainer || referenceContainer.$type) {
                break;
            }
        }

        // If the reference container is still a sentinel value then compare
        // the reference value with refPath.  If they are the same, then the
        // model is still valid.
        if (originalRefPath && referenceContainer && referenceContainer.$type === $ref) {
            i = 0;
            len = originalRefPath.length;
            currentRefPath = referenceContainer.value;

            validContainer = true;
            for (; validContainer && i < len; ++i) {
                if (currentRefPath[i] !== originalRefPath[i]) {
                    validContainer = false;
                }
            }
            if (validContainer === false) {
                cacheNode = undefined;
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
        _node: cacheNode,
        _path: absolutePath,
        _referenceContainer: referenceContainer,
        _seed: recycleJSON && { json: boundJSONArg } || undefined
    });
};

/***/ },
/* 86 */
/***/ function(module, exports) {

"use strict";
"use strict";

var NAME = "BoundJSONGraphModelError";
var MESSAGE = "It is not legal to use the JSON Graph " + "format from a bound Model. JSON Graph format" + " can only be used from a root model.";

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

/***/ },
/* 87 */
/***/ function(module, exports) {

"use strict";
"use strict";

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

/***/ },
/* 88 */
/***/ function(module, exports) {

"use strict";
"use strict";

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

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isInternalKey = __webpack_require__(124);

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

    // only copy objects
    if ((typeof node === "undefined" ? "undefined" : _typeof(node)) !== "object") {
        return;
    }

    Object.keys(node).filter(function (k) {
        // Its not an internal key and the node has a value.  In the cache
        // there are 3 possibilities for values.
        // 1: A branch node.
        // 2: A $type-value node.
        // 3: undefined
        // We will strip out 3
        return !isInternalKey(k) && node[k] !== undefined;
    }).forEach(function (key) {
        var cacheNext = node[key];
        var outNext = out[key];

        if (!outNext) {
            outNext = out[key] = {};
        }

        // Paste the node into the out cache.
        if (cacheNext.$type) {
            var isObject = cacheNext.value && _typeof(cacheNext.value) === "object";
            var isUserCreatedcacheNext = !cacheNext["\u001eƒalcor_wrapped_value"];
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

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var GetResponse = __webpack_require__(33);
var ModelResponse = __webpack_require__(5);

module.exports = function getValue(path) {
    var pathIdx = 0;
    var pathLen = path.length;
    while (++pathIdx < pathLen) {
        if (_typeof(path[pathIdx]) === "object") {
            /* eslint-disable no-loop-func */
            return new ModelResponse(function (o) {
                o.onError(new Error("Paths must be simple paths"));
            });
            /* eslint-enable no-loop-func */
        }
    }

    var self = this;
    return new ModelResponse(function (obs) {
        return new GetResponse(self, [path], false, false, false, undefined, false).subscribe(function (data) {
            var curr = data.json;
            var depth = -1;
            var length = path.length;

            while (curr && ++depth < length) {
                curr = curr[path[depth]];
            }
            obs.onNext(curr);
        }, function (err) {
            obs.onError(err);
        }, function () {
            obs.onCompleted();
        });
    });
};

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var getBoundCacheNode = __webpack_require__(18);

module.exports = function _getVersion(model, path) {
    var node = getBoundCacheNode(model, path);
    var version = node && node["\u001eƒalcor_version"];
    return version == null ? -1 : version;
};

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var isArray = Array.isArray;
var walkPathAndBuildOutput = __webpack_require__(95);
var walkFlatBufferAndBuildOutput = __webpack_require__(94);
var getBoundCacheNode = __webpack_require__(18);
var InvalidModelError = __webpack_require__(88);
var toFlatBuffer = __webpack_require__(4).toFlatBuffer;
var computeFlatBufferHash = __webpack_require__(4).computeFlatBufferHash;

module.exports = getJSON;

function getJSON(model, paths, values, forceUsePathWalk) {

    var node,
        referenceContainer,
        boundPath = model._path,
        modelRoot = model._root,
        cache = modelRoot.cache,
        requestedPath,
        requestedLength,
        optimizedPath,
        optimizedLength = boundPath.length;

    // If the model is bound, get the cache position.
    if (optimizedLength) {
        node = getBoundCacheNode(model);
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
        recycleJSON = model._recycleJSON,
        materialized = model._materialized,
        hasDataSource = Boolean(model._source),
        branchSelector = modelRoot.branchSelector,
        treatErrorsAsValues = model._treatErrorsAsValues,
        allowFromWhenceYouCame = model._allowFromWhenceYouCame,
        path,
        seed = values[0],
        json = seed && seed.json,
        results = { values: values };

    if (recycleJSON && forceUsePathWalk !== true) {
        if (isArray(path = paths)) {
            path = computeFlatBufferHash(toFlatBuffer(paths));
        }
        json = walkFlatBufferAndBuildOutput(cache, node, json, path, 0, seed, results, requestedPath, optimizedPath, optimizedLength,
        /* fromReference = */false, referenceContainer, modelRoot, expired, branchSelector, boxValues, materialized, hasDataSource, treatErrorsAsValues, allowFromWhenceYouCame);
    } else {
        var pathsIndex = -1,
            pathsCount = paths.length;
        while (++pathsIndex < pathsCount) {
            path = paths[pathsIndex];
            requestedLength = path.length;
            json = walkPathAndBuildOutput(cache, node, json, path,
            /* depth = */0, seed, results, requestedPath, requestedLength, optimizedPath, optimizedLength,
            /* fromReference = */false, referenceContainer, modelRoot, expired, branchSelector, boxValues, materialized, hasDataSource, treatErrorsAsValues, allowFromWhenceYouCame);
        }
    }

    if (results.hasValue) {
        seed.json = json;
    }

    return results;
}

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var clone = __webpack_require__(12);

module.exports = onError;

function onError(node, depth, results, requestedPath, fromReference, boxValues) {

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

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var onValue = __webpack_require__(52);
var $ref = __webpack_require__(0);
var FalcorJSON = __webpack_require__(28);
var onValueType = __webpack_require__(31);
var originalOnMissing = __webpack_require__(30);
var isExpired = __webpack_require__(2);
var getReferenceTarget = __webpack_require__(51);
var NullInPathError = __webpack_require__(10);
var InvalidKeySetError = __webpack_require__(26);
var getHashCode = __webpack_require__(4).getHashCode;
var flatBufferToPaths = __webpack_require__(4).flatBufferToPaths;

module.exports = walkPathAndBuildOutput;

/* eslint-disable camelcase */
/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function walkPathAndBuildOutput(cacheRoot, node, json, path, depth, seed, results, requestedPath, optimizedPath, optimizedLength, fromReference, referenceContainer, modelRoot, expired, branchSelector, boxValues, materialized, hasDataSource, treatErrorsAsValues, allowFromWhenceYouCame) {

    var type, refTarget;

    // ============ Check for base cases ================

    // If there's nowhere to go, we've reached a terminal node, or hit
    // the end of the path, stop now. Either build missing paths or report the value.
    if (undefined === node || undefined !== (type = node.$type) || undefined === path) {
        return onValueType(node, type, path, depth, seed, results, requestedPath, depth, optimizedPath, optimizedLength, fromReference, modelRoot, expired, boxValues, materialized, hasDataSource, treatErrorsAsValues, onValue, onMissing);
    }

    var f_meta,
        f_old_keys,
        f_new_keys,
        f_code = "";

    var next,
        nextKey,
        keyset,
        keyIsRange,
        keys = path["$keys"],
        nextDepth = depth + 1,
        rangeEnd,
        nextJSON,
        nextReferenceContainer,
        nextOptimizedLength,
        nextOptimizedPath,
        optimizedLengthNext = optimizedLength + 1,
        refContainerAbsPath,
        refContainerRefPath;

    if (allowFromWhenceYouCame && referenceContainer) {
        refContainerRefPath = referenceContainer.value;
        refContainerAbsPath = referenceContainer["\u001eƒalcor_abs_path"];
    }

    if (json && (f_meta = json["\u001eƒalcor_metadata"])) {
        if (!branchSelector && !(json instanceof FalcorJSON)) {
            delete json["\u001eƒalcor_metadata"];
            json.__proto__ = new FalcorJSON(f_meta);
        } else if (f_meta["version"] === node["\u001eƒalcor_version"] && f_meta["$code"] === path["$code"] && f_meta["abs_path"] === node["\u001eƒalcor_abs_path"]) {
            results.hasValue = true;
            return json;
        }
        f_old_keys = f_meta["keys"];
        f_meta["version"] = node["\u001eƒalcor_version"];
        f_meta["abs_path"] = node["\u001eƒalcor_abs_path"];
        f_meta["deref_to"] = refContainerRefPath;
        f_meta["deref_from"] = refContainerAbsPath;
    }

    f_new_keys = {};

    var keysIndex = -1;
    var keysLength = keys.length;
    var nextPath, nextPathKey, hasNextMissingPath, nextMeta, nextMetaPath;

    iteratingKeyset: while (++keysIndex < keysLength) {

        keyset = keys[keysIndex];
        nextPath = path[keysIndex];
        hasNextMissingPath = false;
        nextMeta = undefined;
        nextMetaPath = undefined;

        // If `null` appears before the end of the path, throw an error.
        // If `null` is at the end of the path, but the reference doesn't
        // point to a sentinel value, throw an error.
        //
        // Inserting `null` at the end of the path indicates the target of a ref
        // should be returned, rather than the ref itself. When `null` is the last
        // key, the path is lengthened by one, ensuring that if a ref is encountered
        // just before the `null` key, the reference is followed before terminating.
        if (null === keyset) {
            if (nextPath !== undefined) {
                throw new NullInPathError();
            }
            f_code = "" + getHashCode("" + f_code + "null");
            continue;
        }
        // If the keyset is a primitive value, we've found our `nextKey`.
        else if ("object" !== (typeof keyset === "undefined" ? "undefined" : _typeof(keyset))) {
                nextKey = keyset;
                rangeEnd = undefined;
                keyIsRange = false;
                nextPathKey = nextKey;
            }
            // If the Keyset isn't null or primitive, then it must be a Range.
            else {
                    rangeEnd = keyset.to;
                    nextKey = keyset.from || 0;
                    if ("number" !== typeof rangeEnd) {
                        rangeEnd = nextKey + (keyset.length || 0) - 1;
                    }
                    if (rangeEnd - nextKey < 0) {
                        break iteratingKeyset;
                    }
                    keyIsRange = true;
                    nextPathKey = "{from:" + nextKey + ",length:" + (rangeEnd - nextKey + 1) + "}";
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
            if (next && nextPath !== undefined &&
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

            nextJSON = walkPathAndBuildOutput(cacheRoot, next, nextJSON, nextPath, nextDepth, seed, results, requestedPath, nextOptimizedPath, nextOptimizedLength, fromReference, nextReferenceContainer, modelRoot, expired, branchSelector, boxValues, materialized, hasDataSource, treatErrorsAsValues, allowFromWhenceYouCame);

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
                if (f_meta === undefined) {
                    f_meta = {};
                    f_meta["version"] = node["\u001eƒalcor_version"];
                    f_meta["abs_path"] = node["\u001eƒalcor_abs_path"];
                    f_meta["deref_to"] = refContainerRefPath;
                    f_meta["deref_from"] = refContainerAbsPath;
                }

                if (undefined === json) {
                    // Enable developers to instrument branch node creation by
                    // providing a custom function. If they do, delegate branch
                    // node creation to them.
                    if (branchSelector) {
                        json = branchSelector(f_meta);
                        if (!json["\u001eƒalcor_metadata"]) {
                            json["\u001eƒalcor_metadata"] = f_meta;
                        }
                    } else {
                        json = Object.create(new FalcorJSON(f_meta));
                    }
                }

                f_new_keys[nextKey] = true;
                if (f_old_keys && f_old_keys.hasOwnProperty(nextKey)) {
                    f_old_keys[nextKey] = false;
                }
                // Set the reported branch or leaf into this branch.
                json[nextKey] = nextJSON;
            } else if (json && json.hasOwnProperty(nextKey)) {
                delete json[nextKey];
                hasNextMissingPath = true;
            } else {
                hasNextMissingPath = true;
            }
        }
        // Re-enter the inner loop and continue iterating the Range, or exit
        // here if we encountered a Key.
        while (keyIsRange && ++nextKey <= rangeEnd);

        if (hasNextMissingPath === true || undefined === nextPath) {
            f_code = "" + getHashCode("" + f_code + nextPathKey);
        } else {
            f_code = "" + getHashCode("" + f_code + nextPathKey + nextPath["$code"]);
        }
    }

    if (f_meta) {
        f_meta["$code"] = f_code;
        f_meta["keys"] = f_new_keys;
        if (f_old_keys) {
            for (nextKey in f_old_keys) {
                if (f_old_keys[nextKey]) {
                    delete json[nextKey];
                }
            }
        }
    }

    // `json` will either be a branch, or undefined if all paths were cache misses
    return json;
}

function onMissing(path, depth, results, requestedPath, requestedLength, optimizedPath, optimizedLength) {

    var paths = path ? flatBufferToPaths(path) : [[]];
    var rPath = requestedPath.slice(0, requestedLength);

    paths.forEach(function (restPath) {
        requestedLength = depth + restPath.length;
        originalOnMissing(rPath.concat(restPath), depth, results, requestedPath, requestedLength, optimizedPath, optimizedLength);
    });

    return undefined;
}

/* eslint-enable */

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isArray = Array.isArray;
var onValue = __webpack_require__(52);
var $ref = __webpack_require__(0);
var FalcorJSON = __webpack_require__(28);
var onMissing = __webpack_require__(30);
var onValueType = __webpack_require__(31);
var isExpired = __webpack_require__(2);
var getReferenceTarget = __webpack_require__(51);
var NullInPathError = __webpack_require__(10);
var InvalidKeySetError = __webpack_require__(26);

module.exports = walkPathAndBuildOutput;

/* eslint-disable camelcase */
/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function walkPathAndBuildOutput(cacheRoot, node, json, path, depth, seed, results, requestedPath, requestedLength, optimizedPath, optimizedLength, fromReference, referenceContainer, modelRoot, expired, branchSelector, boxValues, materialized, hasDataSource, treatErrorsAsValues, allowFromWhenceYouCame) {

    var type, refTarget;

    // ============ Check for base cases ================

    // If there's nowhere to go, we've reached a terminal node, or hit
    // the end of the path, stop now. Either build missing paths or report the value.
    if (node === undefined || (type = node.$type) || depth === requestedLength) {
        return onValueType(node, type, path, depth, seed, results, requestedPath, requestedLength, optimizedPath, optimizedLength, fromReference, modelRoot, expired, boxValues, materialized, hasDataSource, treatErrorsAsValues, onValue, onMissing);
    }

    var f_meta;

    var next,
        nextKey,
        keyset,
        keyIsRange,
        nextDepth = depth + 1,
        rangeEnd,
        keysOrRanges,
        nextJSON,
        nextReferenceContainer,
        keysetIndex = -1,
        keysetLength = 0,
        nextOptimizedLength,
        nextOptimizedPath,
        optimizedLengthNext = optimizedLength + 1,
        refContainerAbsPath,
        refContainerRefPath;

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

    if (allowFromWhenceYouCame && referenceContainer) {
        refContainerRefPath = referenceContainer.value;
        refContainerAbsPath = referenceContainer["\u001eƒalcor_abs_path"];
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
        if ("object" !== (typeof keyset === "undefined" ? "undefined" : _typeof(keyset))) {
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
                    if (rangeEnd - nextKey < 0) {
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
            if (next && nextDepth < requestedLength &&
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

            nextJSON = walkPathAndBuildOutput(cacheRoot, next, nextJSON, path, nextDepth, seed, results, requestedPath, requestedLength, nextOptimizedPath, nextOptimizedLength, fromReference, nextReferenceContainer, modelRoot, expired, branchSelector, boxValues, materialized, hasDataSource, treatErrorsAsValues, allowFromWhenceYouCame);

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
                    f_meta = {};
                    f_meta["version"] = node["\u001eƒalcor_version"];
                    f_meta["abs_path"] = node["\u001eƒalcor_abs_path"];
                    f_meta["deref_to"] = refContainerRefPath;
                    f_meta["deref_from"] = refContainerAbsPath;
                    // Enable developers to instrument branch node creation by
                    // providing a custom function. If they do, delegate branch
                    // node creation to them.
                    if (branchSelector) {
                        json = branchSelector(f_meta);
                        if (!json["\u001eƒalcor_metadata"]) {
                            json["\u001eƒalcor_metadata"] = f_meta;
                        }
                    } else {
                        json = new FalcorJSON(f_meta);
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

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var walkPathAndBuildOutput = __webpack_require__(99);
var BoundJSONGraphModelError = __webpack_require__(86);

module.exports = getJSONGraph;

function getJSONGraph(model, paths, values) {

    var node,
        cache,
        boundPath = model._path,
        modelRoot = model._root,
        requestedPath,
        requestedLength,
        optimizedPath,
        optimizedLength = boundPath.length;

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
        path,
        pathsIndex = -1,
        pathsCount = paths.length;

    while (++pathsIndex < pathsCount) {
        path = paths[pathsIndex];
        requestedLength = path.length;
        walkPathAndBuildOutput(cache, node, path,
        /* depth = */0, seed, results, requestedPath, requestedLength, optimizedPath, optimizedLength,
        /* fromReference = */false, modelRoot, expired, boxValues, materialized, hasDataSource, treatErrorsAsValues);
    }

    return results;
}

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var arr = new Array(2);
var clone = __webpack_require__(12);
var $ref = __webpack_require__(0);
var inlineValue = __webpack_require__(29);
var promote = __webpack_require__(14);
var isExpired = __webpack_require__(2);
var createHardlink = __webpack_require__(11);
var CircularReferenceError = __webpack_require__(49);

module.exports = getReferenceTarget;

/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function getReferenceTarget(root, ref, modelRoot, seed, boxValues, materialized) {

    promote(modelRoot, ref);

    var context,
        key,
        type,
        depth = 0,
        followedRefsCount = 0,
        node = root,
        path = ref.value,
        copy = path,
        length = path.length;

    do {
        if (depth === 0 && undefined !== (context = ref["\u001eƒalcor_context"])) {
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

                if (true) {
                    // If we follow too many references, we might have an indirect
                    // circular reference chain. Warn about this (but don't throw).
                    if (++followedRefsCount % 50 === 0) {
                        try {
                            throw new Error("Followed " + followedRefsCount + " references. " + "This might indicate the presence of an indirect " + "circular reference chain.");
                        } catch (e) {
                            if (console) {
                                var reportFn = typeof console.warn === "function" && console.warn || typeof console.log === "function" && console.log;
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

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var clone = __webpack_require__(12);
var $ref = __webpack_require__(0);
var $atom = __webpack_require__(23);
var $error = __webpack_require__(17);
var inlineValue = __webpack_require__(29);

module.exports = onJSONGraphValue;

function onJSONGraphValue(node, type, depth, seed, results, requestedPath, optimizedPath, optimizedLength, fromReference, boxValues, materialized) {

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
        $ref === type || $error === type || !node["\u001eƒalcor_wrapped_value"] || "object" === (typeof value === "undefined" ? "undefined" : _typeof(value))) {
            value = clone(node);
        }

    if (results && requestedPath) {
        results.hasValue = true;
        inlineValue(value, optimizedPath, optimizedLength, seed, boxValues, materialized);
        (seed.paths || (seed.paths = [])).push(requestedPath.slice(0, depth + !!fromReference) // depth + 1 if fromReference === true
        );
    }

    return value;
}

/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isArray = Array.isArray;
var clone = __webpack_require__(12);
var $ref = __webpack_require__(0);
var onValue = __webpack_require__(98);
var onMissing = __webpack_require__(30);
var inlineValue = __webpack_require__(29);
var onValueType = __webpack_require__(31);
var isExpired = __webpack_require__(2);
var getReferenceTarget = __webpack_require__(97);
var NullInPathError = __webpack_require__(10);
var InvalidKeySetError = __webpack_require__(26);

module.exports = walkPathAndBuildOutput;

/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function walkPathAndBuildOutput(cacheRoot, node, path, depth, seed, results, requestedPath, requestedLength, optimizedPath, optimizedLength, fromReference, modelRoot, expired, boxValues, materialized, hasDataSource, treatErrorsAsValues) {

    var type, refTarget;

    // ============ Check for base cases ================

    // If there's nowhere to go, we've reached a terminal node, or hit
    // the end of the path, stop now. Either build missing paths or report the value.
    if (node === undefined || (type = node.$type) || depth === requestedLength) {
        return onValueType(node, type, path, depth, seed, results, requestedPath, requestedLength, optimizedPath, optimizedLength, fromReference, modelRoot, expired, boxValues, materialized, hasDataSource, treatErrorsAsValues, onValue, onMissing);
    }

    var next,
        nextKey,
        keyset,
        keyIsRange,
        nextDepth = depth + 1,
        rangeEnd,
        keysOrRanges,
        keysetIndex = -1,
        keysetLength = 0,
        nextOptimizedLength,
        nextOptimizedPath,
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
        if ("object" !== (typeof keyset === "undefined" ? "undefined" : _typeof(keyset))) {
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
                    if (rangeEnd - nextKey < 0) {
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
            if (next && nextDepth < requestedLength &&
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

            walkPathAndBuildOutput(cacheRoot, next, path, nextDepth, seed, results, requestedPath, requestedLength, nextOptimizedPath, nextOptimizedLength, fromReference, modelRoot, expired, boxValues, materialized, hasDataSource, treatErrorsAsValues);
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

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var createHardlink = __webpack_require__(11);

var $ref = __webpack_require__(0);

var getBoundCacheNode = __webpack_require__(18);

var promote = __webpack_require__(14);
var getSize = __webpack_require__(7);
var hasOwn = __webpack_require__(15);
var isObject = __webpack_require__(1);
var isExpired = __webpack_require__(2);
var isFunction = __webpack_require__(3);
var isPrimitive = __webpack_require__(8);
var expireNode = __webpack_require__(6);
var updateNodeAncestors = __webpack_require__(16);
var removeNodeAndDescendants = __webpack_require__(39);

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
    var cache = modelRoot.cache;
    var node = getBoundCacheNode(model);
    var parent = node["\u001eƒalcor_parent"] || cache;
    var initialVersion = cache["\u001eƒalcor_version"];

    var pathMapIndex = -1;
    var pathMapCount = pathMapEnvelopes.length;

    while (++pathMapIndex < pathMapCount) {

        var pathMapEnvelope = pathMapEnvelopes[pathMapIndex];

        invalidatePathMap(pathMapEnvelope.json, 0, cache, parent, node, version, expired, lru, comparator, errorSelector);
    }

    var newVersion = cache["\u001eƒalcor_version"];
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
        if (key[0] !== "\u001e" && key[0] !== "$" && hasOwn(pathMap, key)) {
            var child = pathMap[key];
            var branch = isObject(child) && !child.$type;
            var results = invalidateNode(root, parent, node, key, child, branch, false, version, expired, lru, comparator, errorSelector);
            var nextNode = results[0];
            var nextParent = results[1];
            if (nextNode) {
                if (branch) {
                    invalidatePathMap(child, depth + 1, root, nextParent, nextNode, version, expired, lru, comparator, errorSelector);
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

    node = node["\u001eƒalcor_context"];

    if (node != null) {
        parent = node["\u001eƒalcor_parent"] || root;
    } else {

        var index = 0;
        var count = reference.length - 1;

        parent = node = root;

        do {
            var key = reference[index];
            var branch = index < count;
            var results = invalidateNode(root, parent, node, key, value, branch, true, version, expired, lru, comparator, errorSelector);
            node = results[0];
            if (isPrimitive(node)) {
                return results;
            }
            parent = results[1];
        } while (index++ < count);

        if (container["\u001eƒalcor_context"] !== node) {
            createHardlink(container, node);
        }
    }

    return [node, parent];
}

function invalidateNode(root, parent, node, key, value, branch, reference, version, expired, lru, comparator, errorSelector) {

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
            key = node["\u001eƒalcor_key"];
        }
    } else {
        parent = node;
        node = parent[key];
    }

    return [node, parent];
}

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var $ref = __webpack_require__(0);

var getBoundCacheNode = __webpack_require__(18);

var promote = __webpack_require__(14);
var getSize = __webpack_require__(7);
var isExpired = __webpack_require__(2);
var isFunction = __webpack_require__(3);
var isPrimitive = __webpack_require__(8);
var expireNode = __webpack_require__(6);
var iterateKeySet = __webpack_require__(4).iterateKeySet;
var updateNodeAncestors = __webpack_require__(16);
var removeNodeAndDescendants = __webpack_require__(39);

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
    var cache = modelRoot.cache;
    var node = getBoundCacheNode(model);
    var parent = node["\u001eƒalcor_parent"] || cache;
    var initialVersion = cache["\u001eƒalcor_version"];

    var pathIndex = -1;
    var pathCount = paths.length;

    while (++pathIndex < pathCount) {

        var path = paths[pathIndex];

        invalidatePathSet(path, 0, cache, parent, node, version, expired, lru);
    }

    var newVersion = cache["\u001eƒalcor_version"];
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }
};

function invalidatePathSet(path, depth, root, parent, node, version, expired, lru) {

    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet(keySet, note);

    do {
        var results = invalidateNode(root, parent, node, key, branch, false, version, expired, lru);
        var nextNode = results[0];
        var nextParent = results[1];
        if (nextNode) {
            if (branch) {
                invalidatePathSet(path, depth + 1, root, nextParent, nextNode, version, expired, lru);
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

    node = node["\u001eƒalcor_context"];

    if (node != null) {
        parent = node["\u001eƒalcor_parent"] || root;
    } else {

        var index = 0;
        var count = reference.length - 1;

        parent = node = root;

        do {
            var key = reference[index];
            var branch = index < count;
            var results = invalidateNode(root, parent, node, key, branch, true, version, expired, lru);
            node = results[0];
            if (isPrimitive(node)) {
                return results;
            }
            parent = results[1];
        } while (index++ < count);

        if (container["\u001eƒalcor_context"] !== node) {
            var backRefs = node["\u001eƒalcor_refs_length"] || 0;
            node["\u001eƒalcor_refs_length"] = backRefs + 1;
            node["\u001eƒalcor_ref" + backRefs] = container;
            container["\u001eƒalcor_context"] = node;
            container["\u001eƒalcor_ref_index"] = backRefs;
        }
    }

    return [node, parent];
}

function invalidateNode(root, parent, node, key, branch, reference, version, expired, lru) {

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
            key = node["\u001eƒalcor_key"];
        }
    } else {
        parent = node;
        node = parent[key];
    }

    return [node, parent];
}

/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var complement = __webpack_require__(104);
var flushGetRequest = __webpack_require__(105);
var REQUEST_ID = 0;
var GetRequestType = __webpack_require__(54).GetRequest;
var setJSONGraphs = __webpack_require__(19);
var setPathValues = __webpack_require__(35);
var noop = __webpack_require__(22);
var $error = __webpack_require__(17);
var emptyArray = [];
var InvalidSourceError = __webpack_require__(9);

/**
 * Creates a new GetRequest.  This GetRequest takes a scheduler and
 * the request queue.  Once the scheduler fires, all batched requests
 * will be sent to the server.  Upon request completion, the data is
 * merged back into the cache and all callbacks are notified.
 *
 * @param {Scheduler} scheduler -
 * @param {RequestQueue} requestQueue -
 */
var GetRequest = function GetRequest(scheduler, requestQueue) {
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

GetRequest.prototype = {
    /**
     * batches the paths that are passed in.  Once the request is complete,
     * all callbacks will be called and the request will be removed from
     * parent queue.
     * @param {Array} requestedPaths -
     * @param {Array} optimizedPaths -
     * @param {Function} callback -
     */
    batch: function batch(requestedPaths, optimizedPaths, callback) {
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
            var scheduleDisposable = self._scheduler.schedule(function () {
                self._disposable = flushedDisposable = interopDisposable(flushGetRequest(self, oPaths, function (err, data) {
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
    add: function add(requested, optimized, callback) {
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
    _merge: function _merge(requested, err, data) {
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
            else if (!error.$type) {
                    error = {
                        $type: $error,
                        value: error
                    };
                }

            var pathValues = nextPaths.map(function (x) {
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
    return function () {
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

module.exports = GetRequest;

/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var RequestTypes = __webpack_require__(54);
var sendSetRequest = __webpack_require__(106);
var GetRequest = __webpack_require__(102);
var collapse = __webpack_require__(4).collapse;

/**
 * The request queue is responsible for queuing the operations to
 * the model"s dataSource.
 *
 * @param {Model} model -
 * @param {Scheduler} scheduler -
 */
function RequestQueue(model, scheduler) {
    this.model = model;
    this.scheduler = scheduler;
    this.requests = this._requests = [];
}

RequestQueue.prototype = {
    /**
     * Sets the scheduler, but will not affect any current requests.
     */
    setScheduler: function setScheduler(scheduler) {
        this.scheduler = scheduler;
    },

    /**
     * performs a set against the dataSource.  Sets, though are not batched
     * currently could be batched potentially in the future.  Since no batching
     * is required the setRequest action is simplified significantly.
     *
     * @param {JSONGraphEnvelope) jsonGraph -
     */
    set: function set(jsonGraph, cb) {
        jsonGraph.paths = collapse(jsonGraph.paths);
        return sendSetRequest(jsonGraph, this.model, cb);
    },

    /**
     * Creates a get request to the dataSource.  Depending on the current
     * scheduler is how the getRequest will be flushed.
     * @param {Array} requestedPaths -
     * @param {Array} optimizedPaths -
     * @param {Function} cb -
     */
    get: function get(requestedPaths, optimizedPaths, cb) {
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
                var results = request.add(rRemainingPaths, oRemainingPaths, refCountCallback);

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
                    request.batch(rRemainingPaths, oRemainingPaths, refCountCallback);
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
            var disposable = request.batch(rRemainingPaths, oRemainingPaths, refCountCallback);
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
        return function () {
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
    removeRequest: function removeRequest(request) {
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

module.exports = RequestQueue;

/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var hasIntersection = __webpack_require__(4).hasIntersection;

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
    var intersectionLength = -1,
        complementLength = -1;
    var intersectionFound = false;

    for (var i = 0, len = optimized.length; i < len; ++i) {
        // If this does not intersect then add it to the output.
        var path = optimized[i];
        var pathLen = path.length;
        var subTree = tree[pathLen];

        // If there is no subtree to look into or there is no intersection.
        if (!subTree || !hasIntersection(subTree, path, 0, pathLen)) {

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
                requestedComplement = requested.slice(0, i);
                optimizedComplement = optimized.slice(0, i);
            }

            requestedIntersection[++intersectionLength] = requested[i];
            intersectionFound = true;
        }
    }

    if (!intersectionFound) {
        return null;
    }

    return [requestedIntersection, optimizedComplement, requestedComplement];
};

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var pathUtils = __webpack_require__(4);
var toTree = pathUtils.toTree;
var toPaths = pathUtils.toPaths;
var InvalidSourceError = __webpack_require__(9);

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
    var listIdx = 0,
        listLen = listKeys.length;
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
    var pathMapIdx = 0,
        pathMapLen = pathMapKeys.length;
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
        getRequest = request.requestQueue.model._source.get(collapsedPaths);
    } catch (e) {
        callback(new InvalidSourceError());
        return null;
    }

    // Ensures that the disposable is available for the outside to cancel.
    var disposable = getRequest.subscribe(function (data) {
        jsonGraphData = data;
    }, function (err) {
        callback(err, jsonGraphData);
    }, function () {
        callback(null, jsonGraphData);
    });

    return disposable;
};

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var setJSONGraphs = __webpack_require__(19);
var setPathValues = __webpack_require__(35);
var InvalidSourceError = __webpack_require__(9);

var emptyArray = [];
var emptyDisposable = { dispose: function dispose() {} };

/**
 * A set request is not an object like GetRequest.  It simply only needs to
 * close over a couple values and its never batched together (at least not now).
 *
 * @private
 * @param {JSONGraphEnvelope} jsonGraph -
 * @param {Model} model -
 * @param {Function} callback -
 */
var sendSetRequest = function sendSetRequest(originalJsonGraph, model, callback) {
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
        setObservable = model._source.set(originalJsonGraph);
    } catch (e) {
        callback(new InvalidSourceError());
        return emptyDisposable;
    }

    var disposable = setObservable.subscribe(function onNext(jsonGraphEnvelope) {
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

        setPathValues(model, paths.map(function (path) {
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

/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var SetResponse = __webpack_require__(58);
var ModelResponse = __webpack_require__(5);
var InvalidSourceError = __webpack_require__(9);

/**
 * @private
 * @augments ModelResponse
 */
function CallResponse(model, callPath, args, suffix, paths) {
    this.callPath = callPath;
    this.args = args;

    if (paths) {
        this.paths = paths;
    }
    if (suffix) {
        this.suffix = suffix;
    }
    this.model = model;

    var currentVersion = model._root.cache["\u001eƒalcor_version"];

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
        obs = model._source.call(boundCallPath, callArgs, suffixes, extraPaths);
    } catch (e) {
        observer.onError(new InvalidSourceError(e));
        return;
    }

    return obs.subscribe(function (res) {
        response = res;
    }, function (err) {
        observer.onError(err);
    }, function () {

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
        return new SetResponse(rootModel.withoutDataSource(), [response], false, false, initialCacheVersion).subscribe(function (x) {
            observer.onNext(x);
        }, function (err) {
            observer.onError(err);
        }, function () {
            observer.onCompleted();
        });
    });
    /* eslint-enable consistent-return */
};

module.exports = CallResponse;

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var isArray = Array.isArray;
var ModelResponse = __webpack_require__(5);
var isPathValue = __webpack_require__(21);
var isJSONEnvelope = __webpack_require__(20);
var noop = __webpack_require__(22);
var empty = { dispose: noop, unsubscribe: noop };
var isFunction = __webpack_require__(3);

function InvalidateResponse(model, args, initialCacheVersion) {
    // TODO: This should be removed.  There should only be 1 type of arguments
    // coming in, but we have strayed from documentation.
    this._model = model;

    var groups = [];
    var group, groupType;
    var argIndex = -1;
    var argCount = args.length;

    var currentVersion = model._root.cache["\u001eƒalcor_version"];

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
    this._groups.forEach(function (group) {
        var inputType = group.inputType;
        var methodArgs = group.arguments;
        var operationName = "_invalidate" + inputType;
        var operationFunc = model[operationName];
        operationFunc(model, methodArgs);
    });
    observer.onCompleted();

    var modelRoot = model._root;
    var modelCache = modelRoot.cache;
    var currentVersion = modelCache["\u001eƒalcor_version"];
    var initialCacheVersion = this.initialCacheVersion;
    var rootOnChangesCompletedHandler = modelRoot.onChangesCompleted;

    if (initialCacheVersion !== currentVersion && modelRoot.syncRefCount <= 0 && isFunction(rootOnChangesCompletedHandler)) {
        rootOnChangesCompletedHandler.call(modelRoot.topLevelModel);
    }

    return empty;
};

module.exports = InvalidateResponse;

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var checkCacheAndReport = __webpack_require__(56);
var MaxRetryExceededError = __webpack_require__(50);
var collectLru = __webpack_require__(32);
var getSize = __webpack_require__(7);
var AssignableDisposable = __webpack_require__(55);
var InvalidSourceError = __webpack_require__(9);
var isFunction = __webpack_require__(3);

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
module.exports = function getRequestCycle(getResponse, model, results, observer, errors, count, initialCacheVersion, originalRequestedPaths, recycleJSON) {
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
            boundRequestedMissingPaths[i] = fastCat(boundPath, requestedMissingPaths[i]);
        }
    }

    // No bound path, no array copy and concat.
    else {
            boundRequestedMissingPaths = requestedMissingPaths;
        }

    var followupGetPaths = getResponse.isProgressive || !recycleJSON ? requestedMissingPaths : originalRequestedPaths;

    var currentRequestDisposable = requestQueue.get(boundRequestedMissingPaths, optimizedMissingPaths, function (err) {

        if (err instanceof InvalidSourceError) {
            observer.onError(err);
            return;
        }

        // Once the request queue finishes, check the cache and bail if
        // we can.
        var nextResults = checkCacheAndReport(model, followupGetPaths, observer, getResponse.isProgressive, getResponse.isJSONGraph, results.values, errors, recycleJSON);

        // If there are missing paths coming back form checkCacheAndReport
        // the its reported from the core cache check method.
        if (nextResults) {

            // update the which disposable to use.
            disposable.currentDisposable = getRequestCycle(getResponse, model, nextResults, observer, errors, count + 1, initialCacheVersion, originalRequestedPaths, recycleJSON);
        }

        // We have finished.  Since we went to the dataSource, we must
        // collect on the cache.
        else {

                var modelRoot = model._root;
                var modelCache = modelRoot.cache;
                var currentVersion = modelCache["\u001eƒalcor_version"];

                collectLru(modelRoot, modelRoot.expired, getSize(modelCache), model._maxSize, model._collectRatio, currentVersion);

                var rootOnChangesCompletedHandler = modelRoot.onChangesCompleted;

                if (initialCacheVersion !== currentVersion && modelRoot.syncRefCount <= 0 && isFunction(rootOnChangesCompletedHandler)) {
                    rootOnChangesCompletedHandler.call(modelRoot.topLevelModel);
                }
            }
    });
    disposable.currentDisposable = currentRequestDisposable;
    return disposable;
};

function fastCat(arr1, arr2) {
    var a = [],
        i,
        len,
        j;
    for (i = 0, len = arr1.length; i < len; i++) {
        a[i] = arr1[i];
    }
    for (j = 0, len = arr2.length; j < len; j++) {
        a[i++] = arr2[j];
    }
    return a;
}

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var ModelResponse = __webpack_require__(5);
var GET_VALID_INPUT = __webpack_require__(57);
var validateInput = __webpack_require__(40);
var GetResponse = __webpack_require__(33);

/**
 * Performs a get on the cache and if there are missing paths
 * then the request will be forwarded to the get request cycle.
 * @private
 */
module.exports = function get() {
    for (var _len = arguments.length, paths = Array(_len), _key = 0; _key < _len; _key++) {
        paths[_key] = arguments[_key];
    }

    // Validates the input.  If the input is not pathSets or strings then we
    // will onError.
    var out = validateInput(paths, GET_VALID_INPUT, "get");
    if (out !== true) {
        return new ModelResponse(function (o) {
            o.onError(out);
        });
    }

    return new GetResponse(this, paths);
};

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = mergeInto;

/* eslint-disable camelcase */
function mergeInto(dest, node) {

    var destValue,
        nodeValue,
        key,
        keys = Object.keys(node),
        index = -1,
        length = keys.length;

    while (++index < length) {

        key = keys[index];

        if (key !== "\u001eƒalcor_metadata") {

            nodeValue = node[key];
            destValue = dest[key];

            if (destValue !== nodeValue) {
                if (destValue === undefined || "object" !== (typeof nodeValue === "undefined" ? "undefined" : _typeof(nodeValue))) {
                    dest[key] = nodeValue;
                } else {
                    mergeInto(destValue, nodeValue);
                }
            }
        }
    }

    dest["\u001eƒalcor_metadata"] = node["\u001eƒalcor_metadata"];

    return dest;
}
/* eslint-enable */

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var setValidInput = __webpack_require__(115);
var validateInput = __webpack_require__(40);
var SetResponse = __webpack_require__(58);
var ModelResponse = __webpack_require__(5);

module.exports = function set() {
    var out = validateInput(arguments, setValidInput, "set");
    if (out !== true) {
        return new ModelResponse(function (o) {
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

/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var arrayFlatMap = __webpack_require__(119);

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

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var emptyArray = [];
var AssignableDisposable = __webpack_require__(55);
var GetResponse = __webpack_require__(33);
var setGroupsIntoCache = __webpack_require__(113);
var getWithPathsAsPathMap = __webpack_require__(27).getWithPathsAsPathMap;
var InvalidSourceError = __webpack_require__(9);
var MaxRetryExceededError = __webpack_require__(50);

/**
 * The request cycle for set.  This is responsible for requesting to dataSource
 * and allowing disposing inflight requests.
 */
module.exports = function setRequestCycle(model, observer, groups, isJSONGraph, isProgressive, count, initialCacheVersion) {
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
        return subscribeToFollowupGet(model, observer, requestedPaths, isJSONGraph, isProgressive, initialCacheVersion);
    }

    // Progressively output the data from the first set.
    if (isProgressive) {
        var results = getWithPathsAsPathMap(model, requestedPaths, [{}], true);
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
    set(currentJSONGraph, function (error, jsonGraphEnv) {
        if ((typeof error === "undefined" ? "undefined" : _typeof(error)) === InvalidSourceError) {
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
            disposable.currentDisposable = subscribeToFollowupGet(model, observer, requestedPaths, isJSONGraph, isProgressive, initialCacheVersion);
        }

        // TODO: The unhappy case.  I am unsure how this can even be
        // achieved.
        else {
                // We need to restart the setRequestCycle.
                setRequestCycle(model, observer, groups, isJSONGraph, isProgressive, count + 1, initialCacheVersion);
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

function subscribeToFollowupGet(model, observer, requestedPaths, isJSONGraph, isProgressive, initialCacheVersion) {

    // Creates a new response and subscribes to it with the original observer.
    // Also sets forceCollect to true, in case the operation is synchronous and
    // exceeds the cache limit size
    var response = new GetResponse(model, requestedPaths, isJSONGraph, isProgressive, true, initialCacheVersion, false);
    return response.subscribe(observer);
}

/***/ },
/* 115 */
/***/ function(module, exports) {

"use strict";
"use strict";

module.exports = {
    pathValue: true,
    pathSyntax: true,
    json: true,
    jsonGraph: true
};

/***/ },
/* 116 */
/***/ function(module, exports) {

"use strict";
"use strict";

var empty = { dispose: function dispose() {} };

function ImmediateScheduler() {}

ImmediateScheduler.prototype.schedule = function schedule(action) {
    action();
    return empty;
};

module.exports = ImmediateScheduler;

/***/ },
/* 117 */
/***/ function(module, exports) {

"use strict";
"use strict";

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

TimerDisposable.prototype.dispose = function () {
    if (this.disposed) {
        return;
    }

    clearTimeout(this.id);
    this.disposed = true;
};

module.exports = TimeoutScheduler;

/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var ModelResponse = __webpack_require__(5);
var isPathValue = __webpack_require__(21);

module.exports = function setValue(pathArg, valueArg) {
    var value = isPathValue(pathArg) ? pathArg : { path: pathArg, value: valueArg };
    var pathIdx = 0;
    var path = value.path;
    var pathLen = path.length;
    while (++pathIdx < pathLen) {
        if (_typeof(path[pathIdx]) === "object") {
            /* eslint-disable no-loop-func */
            return new ModelResponse(function (o) {
                o.onError(new Error("Paths must be simple paths"));
            });
            /* eslint-enable no-loop-func */
        }
    }
    var self = this;
    return new ModelResponse(function (obs) {
        return self.set(value).subscribe(function (data) {
            var curr = data.json;
            var depth = -1;
            var length = path.length;

            while (curr && ++depth < length) {
                curr = curr[path[depth]];
            }
            obs.onNext(curr);
        }, function (err) {
            obs.onError(err);
        }, function () {
            obs.onCompleted();
        });
    });
};

/***/ },
/* 119 */
/***/ function(module, exports) {

"use strict";
"use strict";

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

/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var hasOwn = __webpack_require__(15);
var isArray = Array.isArray;
var isObject = __webpack_require__(1);

module.exports = function clone(value) {
    var dest = value;
    if (isObject(dest)) {
        dest = isArray(value) ? [] : {};
        var src = value;
        for (var key in src) {
            if (key.charAt(0) === "\u001e" || !hasOwn(src, key)) {
                continue;
            }
            dest[key] = src[key];
        }
    }
    return dest;
};

/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var isObject = __webpack_require__(1);
module.exports = function getSize(node) {
    return isObject(node) && node.$expires || undefined;
};

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var isObject = __webpack_require__(1);

module.exports = function getType(node, anyType) {
    var type = isObject(node) && node.$type || void 0;
    if (anyType && type) {
        return "branch";
    }
    return type;
};

/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var now = __webpack_require__(37);
var $now = __webpack_require__(42);
var $never = __webpack_require__(41);

module.exports = function isAlreadyExpired(node) {
    var exp = node.$expires;
    return exp != null && exp !== $never && exp !== $now && exp < now();
};

/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

/**
 * Determined if the key passed in is an internal key.
 *
 * @param {String} x The key
 * @private
 * @returns {Boolean}
 */
module.exports = function isInternalKey(x) {
  return x === "$size" || x === "\u001eƒalcor_wrapped_value" || x.charAt(0) === "\u001e";
};

/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

var $ref = __webpack_require__(0);
var $error = __webpack_require__(17);
var getSize = __webpack_require__(7);
var getTimestamp = __webpack_require__(59);
var isObject = __webpack_require__(1);
var isExpired = __webpack_require__(2);
var isFunction = __webpack_require__(3);

var wrapNode = __webpack_require__(65);
var insertNode = __webpack_require__(60);
var expireNode = __webpack_require__(6);
var replaceNode = __webpack_require__(63);
var updateNodeAncestors = __webpack_require__(16);
var reconstructPath = __webpack_require__(62);

module.exports = function mergeJSONGraphNode(parent, node, message, key, requestedPath, optimizedPath, version, expired, lru, comparator, errorSelector) {

    var sizeOffset;

    var cType, mType, cIsObject, mIsObject, cTimestamp, mTimestamp;

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
            } else {
                cIsObject = isObject(node);
                if (cIsObject) {
                    // Is the cache node a branch? If so, return the cache branch.
                    cType = node.$type;
                    if (cType == null) {
                        // Has the branch been introduced to the cache yet? If not,
                        // give it a parent, key, and absolute path.
                        if (node["\u001eƒalcor_parent"] == null) {
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
            if (message == null || mIsObject && !mType) {
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
                        if (node["\u001eƒalcor_parent"] != null) {
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
                if (node["\u001eƒalcor_parent"] == null) {
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
                    if (cType && !isExpired(node) || !cIsObject) {
                        // Compare the current cache value with the new value. If either of
                        // them don't have a timestamp, or the message's timestamp is newer,
                        // replace the cache value with the message value. If a comparator
                        // is specified, the comparator takes precedence over timestamps.
                        //
                        // Comparing either Number or undefined to undefined always results in false.
                        isDistinct = getTimestamp(message) < getTimestamp(node) === false;
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
        } else if (node == null) {
            node = insertNode(message, parent, key, undefined, optimizedPath);
        }

    return node;
};

/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

module.exports = function transferBackReferences(fromNode, destNode) {
    var fromNodeRefsLength = fromNode["\u001eƒalcor_refs_length"] || 0,
        destNodeRefsLength = destNode["\u001eƒalcor_refs_length"] || 0,
        i = -1;
    while (++i < fromNodeRefsLength) {
        var ref = fromNode["\u001eƒalcor_ref" + i];
        if (ref !== void 0) {
            ref["\u001eƒalcor_context"] = destNode;
            destNode["\u001eƒalcor_ref" + (destNodeRefsLength + i)] = ref;
            fromNode["\u001eƒalcor_ref" + i] = void 0;
        }
    }
    destNode["\u001eƒalcor_refs_length"] = fromNodeRefsLength + destNodeRefsLength;
    fromNode["\u001eƒalcor_refs_length"] = void 0;
    return destNode;
};

/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

module.exports = function unlinkBackReferences(node) {
    var i = -1,
        n = node["\u001eƒalcor_refs_length"] || 0;
    while (++i < n) {
        var ref = node["\u001eƒalcor_ref" + i];
        if (ref != null) {
            ref["\u001eƒalcor_context"] = ref["\u001eƒalcor_ref_index"] = node["\u001eƒalcor_ref" + i] = void 0;
        }
    }
    node["\u001eƒalcor_refs_length"] = void 0;
    return node;
};

/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

module.exports = function unlinkForwardReference(reference) {
    var destination = reference["\u001eƒalcor_context"];
    if (destination) {
        var i = (reference["\u001eƒalcor_ref_index"] || 0) - 1,
            n = (destination["\u001eƒalcor_refs_length"] || 0) - 1;
        while (++i <= n) {
            destination["\u001eƒalcor_ref" + i] = destination["\u001eƒalcor_ref" + (i + 1)];
        }
        destination["\u001eƒalcor_refs_length"] = n;
        reference["\u001eƒalcor_ref_index"] = reference["\u001eƒalcor_context"] = destination = void 0;
    }
    return reference;
};

/***/ },
/* 129 */
/***/ function(module, exports) {

"use strict";
"use strict";

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

/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(67);


/***/ }
/******/ ])
});
;
//# sourceMappingURL=falcor.js.map