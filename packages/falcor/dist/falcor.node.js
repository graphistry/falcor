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
module.exports =
/******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = 110);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

module.exports = 'ref';


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

var now = __webpack_require__(54);
var $now = __webpack_require__(31);
var $never = __webpack_require__(55);

module.exports = function isExpired(node, expireImmediate) {
    var exp = node.$expires;
    if (exp === undefined || exp === null || exp === $never) {
        return false;
    } else if (exp === $now) {
        return expireImmediate;
    }
    return exp < now();
};


/***/ },
/* 2 */
/***/ function(module, exports) {

var objTypeof = 'object';
module.exports = function isObject(value) {
    return value !== null && typeof value === objTypeof;
};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

var splice = __webpack_require__(48);

module.exports = function expireNode(node, expired, lru) {
    if (!node["ƒ_invalidated"]) {
        node["ƒ_invalidated"] = true;
        expired.push(node);
        splice(lru, node);
    }
    return node;
};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

module.exports = function createHardlink(from, to) {

    // create a back reference
    var backRefs = to["ƒ_refs_length"] || 0;
    to["ƒ_ref" + backRefs] = from;
    to["ƒ_refs_length"] = backRefs + 1;

    // create a hard reference
    from["ƒ_ref_index"] = backRefs;
    from["ƒ_context"] = to;
};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {function FalcorJSON(f_meta) {
    this["ƒ_meta"] = f_meta || {};
}

FalcorJSON.prototype = Object.create(Object.prototype, Object.assign({
        toJSON: { value: toJSON },
        toProps: { value: toProps },
        toString: { value: toString },
        $__hash: {
            enumerable: false,
            get() {
                var f_meta = this["ƒ_meta"];
                return f_meta && f_meta['$code'] || '';
            }
        },
        $__version: {
            enumerable: false,
            get() {
                var f_meta = this["ƒ_meta"];
                return f_meta && f_meta["version"] || 0;
            }
        }
    },
    arrayProtoMethods().reduce(function (falcorJSONProto, methodName) {
        var method = Array.prototype[methodName];
        falcorJSONProto[methodName] = {
            writable: true, enumerable: false, value() {
                return method.apply(this, arguments);
            }
        };
        return falcorJSONProto;
    }, {}))
);

function arrayProtoMethods() {
    return [
        'concat', 'copyWithin', 'entries', 'every', 'fill', 'filter', 'find',
        'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'keys',
        'lastIndexOf', 'map', 'pop', 'push', 'reduce', 'reduceRight',
        'reverse', 'shift', 'slice', 'some', 'sort', 'splice', 'unshift', 'values'
    ];
}

var isArray = Array.isArray;
var typeofObject = 'object';
var typeofString = 'string';

function getInst(inst) {
    var typeofInst = typeof inst;
    var argsLen = arguments.length;
    if (argsLen === 0) {
        inst = this;
    } else if (typeofInst !== typeofString) {
        if (!inst || typeofInst !== typeofObject) {
            return inst;
        }
    } else if (argsLen !== 1) {
        return inst;
    } else {
        inst = this;
    }
    return inst === global ? undefined : inst;
}

function toJSON() {
    return serialize(
        getInst.apply(this, arguments), toJSON, false
    );
}

function toString(includeMetadata) {
    return JSON.stringify(serialize(
        getInst.call(this, this), serialize, includeMetadata === true
    ));
}

function toProps(inst) {

    inst = getInst.apply(this, arguments);

    var f_meta_inst, f_meta_json, version = 0;
    var json = serialize(inst, toProps, true);

    if (inst && (f_meta_inst = inst["ƒ_meta"])) {
        version = f_meta_inst["version"];
    }

    if (!(!json || typeof json !== typeofObject)) {
        json.__proto__ = FalcorJSON.prototype;
        if (f_meta_json = json["ƒ_meta"]) {
            f_meta_json["version"] = version;
        }
    }

    return json;
}

function serialize(inst, serializer, includeMetadata) {

    if (!inst || typeof inst !== typeofObject) {
        return inst;
    }

    var count, total, f_meta, keys, key, xs;

    if (isArray(inst)) {
        xs = inst;
        // count = -1;
        // total = inst.length;
        // xs = new Array(total);
        // while (++count < total) {
        //     xs[count] = inst[count];
        // }
    } else {

        xs = {};
        count = -1;
        keys = Object.keys(inst);
        total = keys.length;

        if (includeMetadata && (f_meta = inst["ƒ_meta"])) {

            var $code = f_meta['$code'];
            var abs_path = f_meta["abs_path"];
            var deref_to = f_meta["deref_to"];
            var deref_from = f_meta["deref_from"];

            f_meta = xs["ƒ_meta"] = {};
            $code && (f_meta['$code'] = $code);
            abs_path && (f_meta["abs_path"] = abs_path);
            deref_to && (f_meta["deref_to"] = deref_to);
            deref_from && (f_meta["deref_from"] = deref_from);
        }

        while (++count < total) {
            if ((key = keys[count]) !== "ƒ_meta") {
                xs[key] = serializer(inst[key], serializer, includeMetadata);
            }
        }
    }

    return xs;
}

module.exports = FalcorJSON;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(32)))

/***/ },
/* 6 */
/***/ function(module, exports) {

var NAME = 'NullInPathError';
var MESSAGE = '`null` is not allowed in branch key positions.';

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
/* 7 */
/***/ function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(2);
module.exports = function getSize(node) {
    return isObject(node) && node.$size || 0;
};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

var isInternal = __webpack_require__(30);

module.exports = clone;

function clone(node) {

    var key, keys = Object.keys(node),
        json = {}, index = -1, length = keys.length;

    while (++index < length) {
        key = keys[index];
        if (isInternal(key)) {
            continue;
        }
        json[key] = node[key];
    }

    return json;
}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

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
    var type, depth = 0;
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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

var removeNode = __webpack_require__(26);
var updateBackReferenceVersions = __webpack_require__(43);

module.exports = function updateNodeAncestors(nodeArg, offset, lru, version) {
    var child = nodeArg;
    do {
        var node = child["ƒ_parent"];
        var size = child.$size = (child.$size || 0) - offset;
        if (size <= 0 && node != null) {
            removeNode(child, node, child["ƒ_key"], lru);
        } else if (child["ƒ_version"] !== version) {
            updateBackReferenceVersions(child, version);
        }
        child = node;
    } while (child);
    return nodeArg;
};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

var EXPIRES_NEVER = __webpack_require__(55);

// [H] -> Next -> ... -> [T]
// [T] -> Prev -> ... -> [H]
module.exports = function lruPromote(root, object) {
    // Never promote node.$expires === 1.  They cannot expire.
    if (object.$expires === EXPIRES_NEVER) {
        return;
    }

    var head = root["ƒ_head"];

    // Nothing is in the cache.
    if (!head) {
        root["ƒ_head"] = root["ƒ_tail"] = object;
        return;
    }

    if (head === object) {
        return;
    }

    // The item always exist in the cache since to get anything in the
    // cache it first must go through set.
    var prev = object["ƒ_prev"];
    var next = object["ƒ_next"];
    if (next) {
        next["ƒ_prev"] = prev;
    }
    if (prev) {
        prev["ƒ_next"] = next;
    }
    object["ƒ_prev"] = undefined;

    // Insert into head position
    root["ƒ_head"] = object;
    object["ƒ_next"] = head;
    head["ƒ_prev"] = object;

    // If the item we promoted was the tail, then set prev to tail.
    if (object === root["ƒ_tail"]) {
        root["ƒ_tail"] = prev;
    }
};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

var Subscription = __webpack_require__(13);

module.exports = Subscriber;

function Subscriber(destination, parent, onCompleted) {
    if (typeof destination === 'function' ||
             typeof parent === 'function' ||
        typeof onCompleted === 'function') {
        Subscription.call(this, []);
        this.destination = {
            error: parent,
            onError: parent,
            next: destination,
            onNext: destination,
            complete: onCompleted,
            onCompleted: onCompleted
        }
    } else {
        Subscription.call(this, [], parent);
        this.parent = parent;
        this.destination = destination;
    }
}

Subscriber.prototype = Object.create(Subscription.prototype);

Subscriber.prototype.next =
Subscriber.prototype.onNext = function onNext(value) {
    var dest = this.destination;
    if (dest) {
        if (dest.onNext) {
            dest.onNext(value);
        } else if (dest.next) {
            dest.next(value);
        }
    }
}

Subscriber.prototype.error =
Subscriber.prototype.onError = function onError(error) {
    var dest = this.destination;
    if (dest) {
        if (dest.onError) {
            dest.onError(error);
        } else if (dest.error) {
            dest.error(error);
        }
        this.dispose();
    } else {
        this.dispose();
        throw error;
    }
}

Subscriber.prototype.complete =
Subscriber.prototype.onCompleted = function onCompleted() {
    var dest = this.destination;
    if (dest) {
        if (dest.onCompleted) {
            dest.onCompleted();
        } else if (dest.complete) {
            dest.complete();
        }
        this.dispose();
    }
}

Subscriber.prototype.dispose =
Subscriber.prototype.unsubscribe = function () {
    this.destination = null;
    Subscription.prototype.dispose.call(this);
}


/***/ },
/* 13 */
/***/ function(module, exports) {

module.exports = Subscription;

function Subscription(subscriptions, parent) {
    this.parent = parent;
    this.subscriptions = subscriptions || [];
}

Subscription.prototype.add = function(subscription) {
    return this.subscriptions.push(subscription) && this || this;
}

Subscription.prototype.remove = function(subscription) {
    var index = this.subscriptions.indexOf(subscription);
    if (~index) {
        this.subscriptions.splice(index, 1);
    }
    return this;
}

Subscription.prototype.dispose =
Subscription.prototype.unsubscribe = function () {
    var subscription, subscriptions = this.subscriptions;
    while (subscriptions.length) {
        (subscription = subscriptions.pop()) &&
            subscription.dispose &&
            subscription.dispose();
    }
    var parent = this.parent;
    if (parent) {
        this.parent = null;
        parent.remove && parent.remove(this);
    }
}



/***/ },
/* 14 */
/***/ function(module, exports) {

module.exports = 'error';


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

var getCachePosition = __webpack_require__(9);

module.exports = getBoundCacheNode;

function getBoundCacheNode(model, path) {
    path = path || model._path;
    var node = model._node;
    if (!node || node["ƒ_parent"] === undefined || node["ƒ_invalidated"]) {
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
/* 16 */
/***/ function(module, exports, __webpack_require__) {

var arr = new Array(5);
var $ref = __webpack_require__(0);
var isExpired = __webpack_require__(1);
var expireNode = __webpack_require__(3);
var createHardlink = __webpack_require__(4);
var mergeJSONGraphNode = __webpack_require__(72);
var NullInPathError = __webpack_require__(6);
var iterateKeySet = __webpack_require__(33);

/**
 * Merges a list of {@link JSONGraphEnvelope}s into a {@link JSONGraph}.
 * @function
 * @param {Object} model - the Model for which to merge the {@link JSONGraphEnvelope}s.
 * @param {Array.<PathValue>} jsonGraphEnvelopes - the {@link JSONGraphEnvelope}s to merge.
 * @return {Array.<Array.<Path>>} - an Array of Arrays where each inner Array is a list of requested and optimized paths (respectively) for the successfully set values.
 */

module.exports = function setJSONGraphs(model, jsonGraphEnvelopes, errorSelector, comparator, expireImmediate) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = modelRoot.version++;
    var cache = modelRoot.cache;
    var initialVersion = cache["ƒ_version"];

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
                version, expired, lru, comparator, errorSelector, expireImmediate
            );
        }
    }

    arr[0] = undefined;
    arr[1] = undefined;
    arr[2] = undefined;
    arr[3] = undefined;
    arr[4] = undefined;

    var newVersion = cache["ƒ_version"];
    var rootChangeHandler = modelRoot.onChange;

    if (rootChangeHandler && initialVersion !== newVersion) {
        rootChangeHandler();
    }

    return [requestedPaths, optimizedPaths];
};

/* eslint-disable no-constant-condition */
function setJSONGraphPathSet(
    path, depth, root, parent, node,
    messageRoot, messageParent, message,
    requestedPaths, optimizedPaths, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, expireImmediate) {

    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet(keySet, note);
    var optimizedIndex = optimizedPath.index;

    do {

        requestedPath.depth = depth;

        var results = setNode(
            root, parent, node, messageRoot, messageParent, message,
            key, branch, false, requestedPath, optimizedPath, version,
            expired, lru, comparator, errorSelector, expireImmediate
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
                    version, expired, lru, comparator, errorSelector, expireImmediate
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
    version, expired, lru, comparator, errorSelector, expireImmediate) {

    var parent;
    var messageParent;
    var reference = node.value;
    optimizedPath = reference.slice(0);

    if (isExpired(node, expireImmediate)) {
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
                key, branch, true, requestedPath, optimizedPath, version,
                expired, lru, comparator, errorSelector, expireImmediate
            );
            node = results[0];
            optimizedPath = results[4];
            if (!node || typeof node !== 'object') {
                optimizedPath.index = index;
                return results;
            }
            parent = results[1];
            message = results[2];
            messageParent = results[3];
        } while (index++ < count);

        optimizedPath.index = index;

        if (container["ƒ_context"] !== node) {
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
    key, branch, reference, requestedPath, optimizedPath, version,
    expired, lru, comparator, errorSelector, expireImmediate) {

    var type = node.$type;

    while (type === $ref) {

        var results = setReference(
            root, node, messageRoot, message, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector, expireImmediate
        );

        node = results[0];

        if (!node || typeof node !== 'object') {
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
                key = node["ƒ_key"];
            }
        } else {
            parent = node;
            messageParent = message;
            node = parent[key];
            message = messageParent && messageParent[key];
        }

        node = mergeJSONGraphNode(
            parent, node, message, key, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector, expireImmediate
        );
    }

    arr[0] = node;
    arr[1] = parent;
    arr[2] = message;
    arr[3] = messageParent;
    arr[4] = optimizedPath;

    return arr;
}


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

var arr = new Array(3);
var isArray = Array.isArray;
var $ref = __webpack_require__(0);
var isExpired = __webpack_require__(1);
var expireNode = __webpack_require__(3);
var createHardlink = __webpack_require__(4);
var getCachePosition = __webpack_require__(9);
var isInternalKey = __webpack_require__(18);
var NullInPathError = __webpack_require__(6);
var mergeValueOrInsertBranch = __webpack_require__(40);

/**
 * Sets a list of {@link PathMapEnvelope}s into a {@link JSONGraph}.
 * @function
 * @param {Object} model - the Model for which to insert the PathMaps.
 * @param {Array.<PathMapEnvelope>} pathMapEnvelopes - the a list of {@link PathMapEnvelope}s to set.
 * @return {Array.<Array.<Path>>} - an Array of Arrays where each inner Array is a list of requested and optimized paths (respectively) for the successfully set values.
 */

module.exports = function setPathMaps(model, pathMapEnvelopes, errorSelector, comparator, expireImmediate) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = modelRoot.version++;
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = getCachePosition(cache, bound);
    var parent = node["ƒ_parent"] || cache;
    var initialVersion = cache["ƒ_version"];

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
            version, expired, lru, comparator, errorSelector, expireImmediate
        );
    }

    arr[0] = undefined;
    arr[1] = undefined;
    arr[2] = undefined;

    var newVersion = cache["ƒ_version"];
    var rootChangeHandler = modelRoot.onChange;

    if (rootChangeHandler && initialVersion !== newVersion) {
        rootChangeHandler();
    }

    return [requestedPaths, optimizedPaths];
};

/* eslint-disable no-constant-condition */
function setPathMap(
    pathMap, depth, root, parent, node,
    requestedPaths, optimizedPaths, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, expireImmediate) {

    var keys = getKeys(pathMap);

    if (keys && keys.length) {

        var keyIndex = 0;
        var keyCount = keys.length;
        var optimizedIndex = optimizedPath.index;

        do {
            var key = keys[keyIndex];
            var child = pathMap[key];
            var branch = !(!child || typeof child !== 'object') && !child.$type;

            requestedPath.depth = depth;

            var results = setNode(
                root, parent, node, key, child,
                branch, false, requestedPath, optimizedPath, version,
                expired, lru, comparator, errorSelector, expireImmediate
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
                        version, expired, lru, comparator, errorSelector, expireImmediate
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
    value, root, node, requestedPath, optimizedPath, version,
    expired, lru, comparator, errorSelector, expireImmediate) {

    var parent;
    var reference = node.value;
    optimizedPath = reference.slice(0);

    if (isExpired(node, expireImmediate)) {
        expireNode(node, expired, lru);
        node = undefined;
        parent = root;
        optimizedPath.index = reference.length;
    } else {
        var container = node;
        parent = root;

        node = node["ƒ_context"];

        if (node != null) {
            parent = node["ƒ_parent"] || root;
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
                    branch, true, requestedPath, optimizedPath, version,
                    expired, lru, comparator, errorSelector, expireImmediate
                );
                node = results[0];
                optimizedPath = results[2];
                if (!node || typeof node !== 'object') {
                    optimizedPath.index = index;
                    return results;
                }
                parent = results[1];
            } while (index++ < count);

            optimizedPath.index = index;

            if (container["ƒ_context"] !== node) {
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
    branch, reference, requestedPath, optimizedPath, version,
    expired, lru, comparator, errorSelector, expireImmediate) {

    var type = node.$type;

    while (type === $ref) {

        var results = setReference(
            value, root, node, requestedPath, optimizedPath, version,
            expired, lru, comparator, errorSelector, expireImmediate);

        node = results[0];

        if (!node || typeof node !== 'object') {
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
                key = node["ƒ_key"];
            }
        } else {
            parent = node;
            node = parent[key];
        }

        node = mergeValueOrInsertBranch(
            parent, node, key, value,
            branch, reference, requestedPath, optimizedPath, version,
            expired, lru, comparator, errorSelector, expireImmediate
        );
    }

    arr[0] = node;
    arr[1] = parent;
    arr[2] = optimizedPath;

    return arr;
}

function getKeys(pathMap) {

    if (!(!pathMap || typeof pathMap !== 'object') && !pathMap.$type) {
        var keys = [];
        var itr = 0;
        if (isArray(pathMap)) {
            keys[itr++] = 'length';
        }
        for (var key in pathMap) {
            if (isInternalKey(key)) {
                continue;
            }
            keys[itr++] = key;
        }
        return keys;
    }

    return void 0;
}


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

/**
 * Determined if the key passed in is an internal key.
 *
 * @param {String} x The key
 * @private
 * @returns {Boolean}
 */

module.exports = isInternalKey;

var isInternal = __webpack_require__(30);

function isInternalKey(key) {
    return key && key[0] === '$' || isInternal(key);
}


/***/ },
/* 19 */
/***/ function(module, exports) {

module.exports = require("@graphistry/falcor-path-utils/lib/support/materializedAtom");

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(34);


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(37);


/***/ },
/* 22 */
/***/ function(module, exports) {

module.exports = inlineJSONGraphValue;

/* eslint-disable no-constant-condition */
function inlineJSONGraphValue(node, path, length, seed, branch) {

    var key, depth = 0, prev,
        curr = seed.jsonGraph;

    if (!curr) {
        seed.jsonGraph = curr = {};
    }

    do {
        prev = curr;
        key = path[depth++];
        if (depth >= length) {
            curr = prev[key] = branch !== true ? node : prev[key] || {};
            break;
        }
        curr = prev[key] || (prev[key] = {});
    } while (true);

    return curr;
}
/* eslint-enable */


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

var isArray = Array.isArray;
var pathToTree = __webpack_require__(109).pathToTree;
var materializedAtom = __webpack_require__(19);

module.exports = onMissing;

/* eslint-disable no-constant-condition */
function onMissing(path, depth, results,
                   requestedPath, requestedLength, fromReference,
                   optimizedPath, optimizedLength, reportMissing,
                   json, reportMaterialized, createMaterializedBranch) {

    if (!reportMissing && !reportMaterialized) {
        return;
    }

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


    var index, count, mPath;
    var lastKeyIsNull = keyset === null;
    var isRequestedPath = reportMissing;
    var missDepth, missTotal, missingPath, missingPaths;

    if (!reportMissing) {
        missDepth = optimizedLength;
        missingPath = optimizedPath;
        missTotal = optimizedLength + restPathCount - Number(lastKeyIsNull);
    } else {
        missDepth = depth;
        missTotal = requestedLength;
        missingPath = requestedPath;
        missingPaths = results.requested || (results.requested = []);
    }

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
        }

        // break after inserting both requested and optimized missing paths
        if (isRequestedPath = !isRequestedPath) {
            if (reportMissing) {
                missingPaths[missingPaths.length] = mPath;
            }
            break;
        }

        missingPaths[missingPaths.length] = mPath || restPath;

        missDepth = optimizedLength;
        missingPath = optimizedPath;
        missingPaths = results.missing || (results.missing = []);
        missTotal = optimizedLength + restPathCount - Number(lastKeyIsNull);
    } while (true);

    if (reportMaterialized) {
        if (restPathCount === 0) {
            return materializedAtom;
        }
        return pathToTree(json, mPath, missDepth, missTotal,
                          materializedAtom, createMaterializedBranch);
    }
}
/* eslint-enable */

function isEmptyKeySet(keyset) {

    // false if the keyset is a primitive
    if ('object' !== typeof keyset) {
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
    if ('number' !== typeof rangeEnd) {
        rangeEnd = from + (keyset.length || 0);
    }

    // false if trying to request incorrect or empty ranges
    // e.g. { from: 10, to: 0 } or { from: 5, length: 0 }
    return from >= rangeEnd;
}


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

var isExpired = __webpack_require__(1);
var expireNode = __webpack_require__(3);
var lruPromote = __webpack_require__(11);

module.exports = onValueType;

function onValueType(node, type, json,
                     path, depth, seed, results,
                     requestedPath, requestedLength,
                     optimizedPath, optimizedLength,
                     fromReference, modelRoot, expired, expireImmediate,
                     branchSelector, boxValues, materialized, reportMissing,
                     treatErrorsAsValues, onValue, onMissing) {

    var reportMaterialized = materialized;

    if (!node || !type) {
        if (materialized) {
            reportMaterialized = true;
            seed && (results.hasValue = true);
        }
        return onMissing(path, depth, results,
                         requestedPath, requestedLength, fromReference,
                         optimizedPath, optimizedLength, reportMissing,
                         json, reportMaterialized, branchSelector);
    } else if (isExpired(node, expireImmediate)) {
        if (!node["ƒ_invalidated"]) {
            expireNode(node, expired, modelRoot);
        }
        return onMissing(path, depth, results,
                         requestedPath, requestedLength, fromReference,
                         optimizedPath, optimizedLength, reportMissing,
                         json, reportMaterialized, branchSelector);
    }

    lruPromote(modelRoot, node);

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


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

var arr = new Array(2);
var $ref = __webpack_require__(0);

var getBoundCacheNode = __webpack_require__(15);

var isExpired = __webpack_require__(1);
var expireNode = __webpack_require__(3);
var lruPromote = __webpack_require__(11);
var getSize = __webpack_require__(7);
var createHardlink = __webpack_require__(4);
var iterateKeySet = __webpack_require__(33);
var updateNodeAncestors = __webpack_require__(10);
var removeNodeAndDescendants = __webpack_require__(27);

/**
 * Invalidates a list of Paths in a JSON Graph.
 * @function
 * @param {Object} model - the Model for which to insert the PathValues.
 * @param {Array.<PathValue>} paths - the PathValues to set.
 */

module.exports = function invalidatePathSets(model, paths, expireImmediate) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = modelRoot.version++;
    var cache = modelRoot.cache;
    var node = getBoundCacheNode(model);
    var parent = node["ƒ_parent"] || cache;
    var initialVersion = cache["ƒ_version"];

    var pathIndex = -1;
    var pathCount = paths.length;

    while (++pathIndex < pathCount) {

        var path = paths[pathIndex];

        invalidatePathSet(
            path, 0, cache, parent, node,
            version, expired, lru, expireImmediate
        );
    }

    arr[0] = undefined;
    arr[1] = undefined;

    var newVersion = cache["ƒ_version"];
    var rootChangeHandler = modelRoot.onChange;

    if (rootChangeHandler && initialVersion !== newVersion) {
        rootChangeHandler();
    }
};

function invalidatePathSet(
    path, depth, root, parent, node,
    version, expired, lru, expireImmediate) {

    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet(keySet, note);

    do {
        arr = invalidateNode(
            root, parent, node,
            key, branch, false, version,
            expired, lru, expireImmediate
        );
        var nextNode = arr[0];
        var nextParent = arr[1];
        if (nextNode) {
            if (branch) {
                invalidatePathSet(
                    path, depth + 1,
                    root, nextParent, nextNode,
                    version, expired, lru, expireImmediate
                );
            } else if (removeNodeAndDescendants(nextNode, nextParent, key, lru)) {
                updateNodeAncestors(nextParent, getSize(nextNode), lru, version);
            }
        }
        key = iterateKeySet(keySet, note);
    } while (!note.done);
}

function invalidateReference(root, node, version, expired, lru, expireImmediate) {

    if (isExpired(node, expireImmediate)) {
        expireNode(node, expired, lru);
        arr[0] = undefined;
        arr[1] = root;
        return arr;
    }

    lruPromote(lru, node);

    var container = node;
    var reference = node.value;
    var parent = root;

    node = node["ƒ_context"];

    if (node != null) {
        parent = node["ƒ_parent"] || root;
    } else {

        var index = 0;
        var count = reference.length - 1;

        parent = node = root;

        do {
            var key = reference[index];
            var branch = index < count;
            arr = invalidateNode(
                root, parent, node,
                key, branch, true, version,
                expired, lru, expireImmediate
            );
            node = arr[0];
            if (!node && typeof node !== 'object') {
                return arr;
            }
            parent = arr[1];
        } while (index++ < count);

        if (container["ƒ_context"] !== node) {
            createHardlink(container, node);
        }
    }

    arr[0] = node;
    arr[1] = parent;

    return arr;
}

function invalidateNode(
    root, parent, node,
    key, branch, reference, version,
    expired, lru, expireImmediate) {

    var type = node.$type;

    while (type === $ref) {

        arr = invalidateReference(root, node, version, expired, lru, expireImmediate);

        node = arr[0];

        if (!node && typeof node !== 'object') {
            return arr;
        }

        parent = arr[1];
        type = node.$type;
    }

    if (type !== void 0) {
        return [node, parent];
    }

    if (key == null) {
        if (branch) {
            throw new Error('`null` is not allowed in branch key positions.');
        } else if (node) {
            key = node["ƒ_key"];
        }
    } else {
        parent = node;
        node = parent[key];
    }

    arr[0] = node;
    arr[1] = parent;

    return arr;
}


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

var $ref = __webpack_require__(0);
var lruSplice = __webpack_require__(48);
var unlinkBackReferences = __webpack_require__(75);
var unlinkForwardReference = __webpack_require__(76);

module.exports = function removeNode(node, parent, key, lru) {
    if (!(!node || typeof node !== 'object')) {
        var type = node.$type;
        if (type) {
            if (type === $ref) {
                unlinkForwardReference(node);
            }
            lruSplice(lru, node);
        }
        unlinkBackReferences(node);
        parent[key] = node["ƒ_parent"] = void 0;
        return true;
    }
    return false;
};


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

var removeNode = __webpack_require__(26);
var isInternalKey = __webpack_require__(18);

module.exports = function removeNodeAndDescendants(node, parent, key, lru) {
    if (removeNode(node, parent, key, lru)) {
        if (node.$type == null) {
            for (var key2 in node) {
                if (!isInternalKey(key2)) {
                    removeNodeAndDescendants(node[key2], node, key2, lru);
                }
            }
        }
        return true;
    }
    return false;
};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

var arr = new Array(3);
var $ref = __webpack_require__(0);
var isExpired = __webpack_require__(1);
var expireNode = __webpack_require__(3);
var createHardlink = __webpack_require__(4);
var getCachePosition = __webpack_require__(9);
var NullInPathError = __webpack_require__(6);
var iterateKeySet = __webpack_require__(33);
var mergeValueOrInsertBranch = __webpack_require__(40);

/**
 * Sets a list of {@link PathValue}s into a {@link JSONGraph}.
 * @function
 * @param {Object} model - the Model for which to insert the {@link PathValue}s.
 * @param {Array.<PathValue>} pathValues - the list of {@link PathValue}s to set.
 * @return {Array.<Array.<Path>>} - an Array of Arrays where each inner Array is a list of requested and optimized paths (respectively) for the successfully set values.
 */

module.exports = function setPathValues(model, pathValues, errorSelector, comparator, expireImmediate) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = modelRoot.version++;
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = getCachePosition(cache, bound);
    var parent = node["ƒ_parent"] || cache;
    var initialVersion = cache["ƒ_version"];

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
            version, expired, lru, comparator, errorSelector, expireImmediate
        );
    }

    arr[0] = undefined;
    arr[1] = undefined;
    arr[2] = undefined;

    var newVersion = cache["ƒ_version"];
    var rootChangeHandler = modelRoot.onChange;

    if (rootChangeHandler && initialVersion !== newVersion) {
        rootChangeHandler();
    }

    return [requestedPaths, optimizedPaths];
};

/* eslint-disable no-constant-condition */
function setPathSet(
    value, path, depth, root, parent, node,
    requestedPaths, optimizedPaths, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, expireImmediate) {

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
            branch, false, requestedPath, optimizedPath, version,
            expired, lru, comparator, errorSelector, expireImmediate
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
                    version, expired, lru, comparator, errorSelector, expireImmediate
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
    value, root, node, requestedPath, optimizedPath, version,
    expired, lru, comparator, errorSelector, expireImmediate) {

    var parent;
    var reference = node.value;
    optimizedPath = reference.slice(0);

    if (isExpired(node, expireImmediate)) {
        expireNode(node, expired, lru);
        node = undefined;
        parent = root;
        optimizedPath.index = reference.length;
    } else {

        var container = node;
        parent = root;

        node = node["ƒ_context"];

        if (node != null) {
            parent = node["ƒ_parent"] || root;
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
                    branch, true, requestedPath, optimizedPath, version,
                    expired, lru, comparator, errorSelector, expireImmediate
                );
                node = results[0];
                optimizedPath = results[2];
                if (!node || typeof node !== 'object') {
                    optimizedPath.index = index;
                    return results;
                }
                parent = results[1];
            } while (index++ < count);

            optimizedPath.index = index;

            if (container["ƒ_context"] !== node) {
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
    branch, reference, requestedPath, optimizedPath, version,
    expired, lru, comparator, errorSelector, expireImmediate) {

    var type = node.$type;

    while (type === $ref) {

        var results = setReference(
            value, root, node, requestedPath, optimizedPath, version,
            expired, lru, comparator, errorSelector, expireImmediate
        );

        node = results[0];

        if (!node || typeof node !== 'object') {
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
                key = node["ƒ_key"];
            }
        } else {
            parent = node;
            node = parent[key];
        }

        node = mergeValueOrInsertBranch(
            parent, node, key, value,
            branch, reference, requestedPath, optimizedPath, version,
            expired, lru, comparator, errorSelector, expireImmediate
        );
    }

    arr[0] = node;
    arr[1] = parent;
    arr[2] = optimizedPath;

    return arr;
}


/***/ },
/* 29 */
/***/ function(module, exports) {

var NAME = 'InvalidKeySetError';
var MESSAGE = 'Keysets can only contain Keys or Ranges';

/**
 * InvalidKeySetError happens when a dataSource syncronously throws
 * an exception during a get/set/call operation.
 *
 * @param {Error} error - The error that was thrown.
 * @private
 */
function InvalidKeySetError(path, keysOrRanges) {
    var err = Error.call(this,
        'The KeySet ' + JSON.stringify(keysOrRanges) +
        ' in path ' + JSON.stringify(path) + ' contains a KeySet. ' + MESSAGE);
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


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

/**
 * Determined if the key passed in is an f_ internal key.
 *
 * @param {String} x The key
 * @private
 * @returns {Boolean}
 */

var f_ = __webpack_require__(83);
var regexp = new RegExp('^' + f_, 'i', 'g');

module.exports = regexp.test.bind(regexp);


/***/ },
/* 31 */
/***/ function(module, exports) {

module.exports = 0;


/***/ },
/* 32 */
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
/* 33 */
/***/ function(module, exports) {

module.exports = require("@graphistry/falcor-path-utils/lib/iterateKeySet");

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

var isArray = Array.isArray;
var walkPathAndBuildOutput = __webpack_require__(64);
var walkFlatBufferAndBuildOutput = __webpack_require__(63);
var getBoundCacheNode = __webpack_require__(15);
var InvalidModelError = __webpack_require__(81);
var toFlatBuffer = __webpack_require__(107);
var computeFlatBufferHash = __webpack_require__(101);

module.exports = getJSON;

function getJSON(model, paths, seed, progressive, expireImmediate) {

    var node,
        referenceContainer,
        boundPath = model._path,
        modelRoot = model._root,
        cache = modelRoot.cache,
        requestedPath, requestedLength,
        optimizedPath, optimizedLength =
            boundPath && boundPath.length || 0;

    // If the model is bound, get the cache position.
    if (optimizedLength) {
        node = getBoundCacheNode(model);
        // If there was a short, then we 'throw an error' to the outside
        // calling function which will onError the observer.
        if (node && node.$type) {
            return { error: new InvalidModelError(boundPath, boundPath) };
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

    var isFlatBuffer = false,
        json = seed && seed.json,
        results = { data: seed },
        boxValues = model._boxed,
        expired = modelRoot.expired,
        recycleJSON = model._recycleJSON,
        materialized = model._materialized,
        hasDataSource = Boolean(model._source),
        branchSelector = modelRoot.branchSelector,
        treatErrorsAsValues = model._treatErrorsAsValues,
        allowFromWhenceYouCame = model._allowFromWhenceYouCame;

    var arr, path, pathsIndex = 0, pathsCount = paths.length;

    if (pathsCount > 0) {
        if (recycleJSON) {
            pathsCount = 1;
            isFlatBuffer = true;
            if (!paths[0].$keys || paths.length > 1) {
                paths = [computeFlatBufferHash(toFlatBuffer(paths, {}))];
            }
            do {
                path = paths[pathsIndex];
                arr = walkFlatBufferAndBuildOutput(cache, node, json, path, 0, seed, results,
                                                   requestedPath, optimizedPath, optimizedLength,
                                                   /* fromReference = */ false, referenceContainer,
                                                   modelRoot, expired, expireImmediate, branchSelector,
                                                   boxValues, materialized, hasDataSource,
                                                   treatErrorsAsValues, allowFromWhenceYouCame);
                json = arr[0];
                arr[0] = undefined;
                arr[1] = undefined;
            } while (++pathsIndex < pathsCount)
        } else {
            do {
                path = paths[pathsIndex];
                requestedLength = path.length;
                json = walkPathAndBuildOutput(cache, node, json, path,
                                           /* depth = */ 0, seed, results,
                                              requestedPath, requestedLength,
                                              optimizedPath, optimizedLength,
                                              /* fromReference = */ false, referenceContainer,
                                              modelRoot, expired, expireImmediate, branchSelector,
                                              boxValues, materialized, hasDataSource,
                                              treatErrorsAsValues, allowFromWhenceYouCame);
            } while (++pathsIndex < pathsCount)
        }
    }

    var requested = results.requested;

    results.args = isFlatBuffer && paths || requested;

    if (requested && requested.length) {
        results.relative = results.args;//requested;
        if (optimizedLength) {
            var boundRequested = [];
            for (var i = 0, len = requested.length; i < len; ++i) {
                boundRequested[i] = boundPath.concat(requested[i]);
            }
            results.requested = boundRequested;
        }
    }

    if (results.hasValue) {
        seed.json = json;
    }

    return results;
}


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

var arr = new Array(3);
var $ref = __webpack_require__(0);
var promote = __webpack_require__(11);
var isExpired = __webpack_require__(1);
var createHardlink = __webpack_require__(4);
var CircularReferenceError = __webpack_require__(45);

module.exports = getReferenceTarget;

/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function getReferenceTarget(root, ref, modelRoot, expireImmediate) {

    promote(modelRoot, ref);

    var context,
        key, type, depth = 0,
        followedRefsCount = 0,
        node = root, path = ref.value,
        copy = path, length = path.length;

    do {
        if (depth === 0 && undefined !== (context = ref["ƒ_context"])) {
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
            if (undefined !== type && isExpired(node, expireImmediate)) {
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

                // if (DEBUG) {
                //     // If we follow too many references, we might have an indirect
                //     // circular reference chain. Warn about this (but don't throw).
                //     if (++followedRefsCount % 50 === 0) {
                //         try {
                //             throw new Error(
                //                 'Followed ' + followedRefsCount + ' references. ' +
                //                 'This might indicate the presence of an indirect ' +
                //                 'circular reference chain.'
                //             );
                //         } catch (e) {
                //             if (console) {
                //                 var reportFn = typeof console.log === 'function' && console.log;
                //                 if (reportFn) {
                //                     reportFn.call(console, e.toString());
                //                 }
                //             }
                //         }
                //     }
                // }

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
/* 36 */
/***/ function(module, exports, __webpack_require__) {

var clone = __webpack_require__(8);
var onError = __webpack_require__(62);
var $error = __webpack_require__(14);
var materializedAtom = __webpack_require__(19);

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
            debugger
            results.hasValue = true;
            return materializedAtom;
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
/* 37 */
/***/ function(module, exports, __webpack_require__) {

var walkPathAndBuildOutput = __webpack_require__(67);
var BoundJSONGraphModelError = __webpack_require__(79);

module.exports = getJSONGraph;

function getJSONGraph(model, paths, seed, progressive, expireImmediate) {

    var node, cache,
        boundPath = model._path,
        modelRoot = model._root,
        requestedPath, requestedLength,
        optimizedPath, optimizedLength =
            boundPath && boundPath.length || 0;

    // If the model is bound, then get that cache position.
    if (optimizedLength) {
        // JSONGraph output cannot ever be bound or else it will
        // throw an error.
        return { error: new BoundJSONGraphModelError() };
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

        results = { data: seed },
        pathsIndex = -1, pathsCount = paths.length;

    while (++pathsIndex < pathsCount) {
        var path = paths[pathsIndex];
        requestedLength = path.length;
        walkPathAndBuildOutput(cache, node, path,
                            /* depth = */ 0, seed, results,
                               requestedPath, requestedLength,
                               optimizedPath, optimizedLength,
              /* fromReference = */ false, modelRoot, expired, expireImmediate,
                               boxValues, materialized, hasDataSource, treatErrorsAsValues);
    }

    results.args =
    results.relative = results.requested;

    return results;
}


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

module.exports = function insertNode(node, parent, key, version, optimizedPath) {
    node["ƒ_key"] = key;
    node["ƒ_parent"] = parent;

    if (version !== undefined) {
        node["ƒ_version"] = version;
    }
    if (!node["ƒ_abs_path"]) {
        node["ƒ_abs_path"] = optimizedPath.slice(0, optimizedPath.index).concat(key);
    }

    parent[key] = node;

    return node;
};


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

var $ref = __webpack_require__(0);
var isExpired = __webpack_require__(1);
var expireNode = __webpack_require__(3);
var lruPromote = __webpack_require__(11);
var getSize = __webpack_require__(7);
var createHardlink = __webpack_require__(4);
var getBoundCacheNode = __webpack_require__(15);
var isInternalKey = __webpack_require__(18);
var updateNodeAncestors = __webpack_require__(10);
var removeNodeAndDescendants = __webpack_require__(27);

/**
 * Sets a list of PathMaps into a JSON Graph.
 * @function
 * @param {Object} model - the Model for which to insert the PathMaps.
 * @param {Array.<PathMapEnvelope>} pathMapEnvelopes - the a list of @PathMapEnvelopes to set.
 */

module.exports = function invalidatePathMaps(model, pathMapEnvelopes, expireImmediate) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = modelRoot.version++;
    var comparator = modelRoot._comparator;
    var cache = modelRoot.cache;
    var node = getBoundCacheNode(model);
    var parent = node["ƒ_parent"] || cache;
    var initialVersion = cache["ƒ_version"];

    var pathMapIndex = -1;
    var pathMapCount = pathMapEnvelopes.length;

    while (++pathMapIndex < pathMapCount) {

        var pathMapEnvelope = pathMapEnvelopes[pathMapIndex];

        invalidatePathMap(
            pathMapEnvelope.json, 0, cache, parent, node,
            version, expired, lru, comparator, expireImmediate
        );
    }

    var newVersion = cache["ƒ_version"];
    var rootChangeHandler = modelRoot.onChange;

    if (rootChangeHandler && initialVersion !== newVersion) {
        rootChangeHandler();
    }
};

function invalidatePathMap(
    pathMap, depth, root, parent, node, version,
    expired, lru, comparator, expireImmediate) {

    if (!pathMap || typeof pathMap !== 'object' || pathMap.$type) {
        return;
    }

    for (var key in pathMap) {
        if (!isInternalKey(key)) {
            var child = pathMap[key];
            var branch = !(!child || typeof child !== 'object') && !child.$type;
            var results = invalidateNode(
                root, parent, node,
                key, child, branch, false, version, expired,
                lru, comparator, expireImmediate
            );
            var nextNode = results[0];
            var nextParent = results[1];
            if (nextNode) {
                if (branch) {
                    invalidatePathMap(
                        child, depth + 1,
                        root, nextParent, nextNode,
                        version, expired, lru, comparator, expireImmediate
                    );
                } else if (removeNodeAndDescendants(nextNode, nextParent, key, lru)) {
                    updateNodeAncestors(nextParent, getSize(nextNode), lru, version);
                }
            }
        }
    }
}

function invalidateReference(
    value, root, node, version,
    expired, lru, comparator, expireImmediate) {

    if (isExpired(node, expireImmediate)) {
        expireNode(node, expired, lru);
        return [undefined, root];
    }

    lruPromote(lru, node);

    var container = node;
    var reference = node.value;
    var parent = root;

    node = node["ƒ_context"];

    if (node != null) {
        parent = node["ƒ_parent"] || root;
    } else {

        var index = 0;
        var count = reference.length - 1;

        parent = node = root;

        do {
            var key = reference[index];
            var branch = index < count;
            var results = invalidateNode(
                root, parent, node,
                key, value, branch, true, version,
                expired, lru, comparator, expireImmediate
            );
            node = results[0];
            if (!node || typeof node !== 'object') {
                return results;
            }
            parent = results[1];
        } while (index++ < count);

        if (container["ƒ_context"] !== node) {
            createHardlink(container, node);
        }
    }

    return [node, parent];
}

function invalidateNode(
    root, parent, node,
    key, value, branch, reference, version,
    expired, lru, comparator, expireImmediate) {

    var type = node.$type;

    while (type === $ref) {

        var results = invalidateReference(
            value, root, node, version, expired,
            lru, comparator, expireImmediate
        );

        node = results[0];

        if (!node && typeof node !== 'object') {
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
            throw new Error('`null` is not allowed in branch key positions.');
        } else if (node) {
            key = node["ƒ_key"];
        }
    } else {
        parent = node;
        node = parent[key];
    }

    return [node, parent];
}


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

var $ref = __webpack_require__(0);
var $error = __webpack_require__(14);
var $now = __webpack_require__(31);
var getType = __webpack_require__(92);
var getSize = __webpack_require__(7);
var getTimestamp = __webpack_require__(51);

var wrapNode = __webpack_require__(44);
var isExpired = __webpack_require__(1);
var expireNode = __webpack_require__(3);
var insertNode = __webpack_require__(38);
var replaceNode = __webpack_require__(42);
var reconstructPath = __webpack_require__(41);
var updateNodeAncestors = __webpack_require__(10);

module.exports = function mergeValueOrInsertBranch(
    parent, node, key, value,
    branch, reference, requestedPath, optimizedPath, version,
    expired, lru, comparator, errorSelector, expireImmediate) {

    var type = getType(node, reference);

    if (branch || reference) {
        if (type && isExpired(node,
            /* expireImmediate:
             * force true so the node is marked as
             * expired but keep using it for the merge if it expires immediately
             */
            true)) {
            expireNode(node, expired, lru);
            type = node.$expires === $now ? type : 'expired';
        }
        if ((type && type !== $ref) || (!node || typeof node !== 'object')) {
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
        if ((type || mType) && comparator) {
            isDistinct = !comparator(node, message, optimizedPath.slice(0, optimizedPath.index));
        }
        if (isDistinct) {

            if (errorSelector && mType === $error) {
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
/* 41 */
/***/ function(module, exports) {

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
/* 42 */
/***/ function(module, exports, __webpack_require__) {

var transferBackReferences = __webpack_require__(74);
var removeNodeAndDescendants = __webpack_require__(27);
var updateBackReferenceVersions = __webpack_require__(43);

module.exports = function replaceNode(node, replacement, parent, key, lru, version) {
    if (node === replacement) {
        return node;
    } else if (!(!node || typeof node !== 'object')) {
        transferBackReferences(node, replacement);
        removeNodeAndDescendants(node, parent, key, lru);
        updateBackReferenceVersions(replacement, version);
    }

    parent[key] = replacement;
    return replacement;
};


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

module.exports = function updateBackReferenceVersions(nodeArg, version) {
    var stack = [nodeArg];
    var count = 0;
    do {
        var node = stack[count];
        if (node && node["ƒ_version"] !== version) {
            node["ƒ_version"] = version;
            stack[count++] = node["ƒ_parent"];
            var i = -1;
            var n = node["ƒ_refs_length"] || 0;
            while (++i < n) {
                stack[count++] = node["ƒ_ref" + i];
            }
        }
    } while (--count > -1);
    return nodeArg;
};


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

var isArray = Array.isArray;
var now = __webpack_require__(54);
var expiresNow = __webpack_require__(31);

var $atom = __webpack_require__(95);
var clone = __webpack_require__(90);
var getSize = __webpack_require__(7);
var getExpires = __webpack_require__(91);

var atomSize = 50;

module.exports = function wrapNode(nodeArg, typeArg, value) {

    var size = 0;
    var node = nodeArg;
    var type = typeArg;

    if (type) {
        var modelCreated = node["ƒ_wrapped_value"];
        node = clone(node);
        size = getSize(node);
        node.$type = type;
        node["ƒ_prev"] = undefined;
        node["ƒ_next"] = undefined;
        node["ƒ_wrapped_value"] = modelCreated || false;
    } else {
        node = { $type: $atom, value: value };
        node["ƒ_prev"] = undefined;
        node["ƒ_next"] = undefined;
        node["ƒ_wrapped_value"] = true;
    }

    if (value == null) {
        size = atomSize + 1;
    } else if (size == null || size <= 0) {
        switch (typeof value) {
            case 'object':
                if (isArray(value)) {
                    size = atomSize + value.length;
                } else {
                    size = atomSize + 1;
                }
                break;
            case 'string':
                size = atomSize + value.length;
                break;
            default:
                size = atomSize + 1;
                break;
        }
    }

    var expires = getExpires(node);

    if (typeof expires === 'number' && expires < expiresNow) {
        node.$expires = now() + (expires * -1);
    }

    node.$size = size;

    return node;
};


/***/ },
/* 45 */
/***/ function(module, exports) {

var NAME = 'CircularReferenceError';

/**
 * Does not allow null in path
 */
function CircularReferenceError(referencePath) {
    var err = Error.call(this, 'Encountered circular reference ' +
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


/***/ },
/* 46 */
/***/ function(module, exports) {

var NAME = 'InvalidSourceError';
var MESSAGE = 'An exception was thrown when making a request';

/**
 * InvalidSourceError happens when a dataSource syncronously throws
 * an exception during a get/set/call operation.
 *
 * @param {Error} error - The error that was thrown.
 * @private
 */
function InvalidSourceError(error) {
    var err = Error.call(this, MESSAGE + ':\n\t' + error);
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


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

var removeNode = __webpack_require__(26);
var updateNodeAncestors = __webpack_require__(10);

module.exports = function collect(lru, expired, totalArg, max, ratioArg, version) {

    var total = totalArg;
    var ratio = ratioArg;

    if (typeof ratio !== 'number') {
        ratio = 0.75;
    }

    var shouldUpdate = typeof version === 'number';
    var targetSize = max * ratio;
    var parent, node, size;

    node = expired.pop();

    while (node) {
        size = node.$size || 0;
        total -= size;
        if (shouldUpdate === true) {
            updateNodeAncestors(node, size, lru, version);
        } else if (parent = node["ƒ_parent"]) {  // eslint-disable-line no-cond-assign
            removeNode(node, parent, node["ƒ_key"], lru);
        }
        node = expired.pop();
    }

    if (total >= max) {
        var prev = lru["ƒ_tail"];
        node = prev;
        while ((total >= targetSize) && node) {
            prev = prev["ƒ_prev"];
            size = node.$size || 0;
            total -= size;
            if (shouldUpdate === true) {
                updateNodeAncestors(node, size, lru, version);
            }
            node = prev;
        }

        lru["ƒ_tail"] = lru["ƒ_prev"] = node;
        if (node == null) {
            lru["ƒ_head"] = lru["ƒ_next"] = undefined;
        } else {
            node["ƒ_next"] = undefined;
        }
    }
};


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

module.exports = function lruSplice(root, object) {

    // Its in the cache.  Splice out.
    var prev = object["ƒ_prev"];
    var next = object["ƒ_next"];
    if (next) {
        next["ƒ_prev"] = prev;
    }
    if (prev) {
        prev["ƒ_next"] = next;
    }
    object["ƒ_prev"] = object["ƒ_next"] = undefined;

    if (object === root["ƒ_head"]) {
        root["ƒ_head"] = next;
    }
    if (object === root["ƒ_tail"]) {
        root["ƒ_tail"] = prev;
    }
};


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var Subscriber = __webpack_require__(12);
var Subscription = __webpack_require__(13);
var $$observable = __webpack_require__(96).default;

module.exports = Source;

function Source(subscribe) {
    if (!subscribe) {
        return;
    }
    switch (typeof subscribe) {
        case 'object':
            this.source = subscribe;
            break;
        case 'function':
            this.source = { subscribe: subscribe };
            break;
    }
}

Source.prototype[$$observable] = function() {
    return this;
}

Source.prototype.operator = function(destination) {
    return this.subscribe(destination);
}

// Unused
// Source.prototype.lift = function(operator, source) {
//     source = new Source(source || this);
//     source.operator = operator;
//     source._promise = this._promise;
//     return source;
// }

Source.prototype.subscribe = function(destination, x, y) {
    return new Subscription([
        this.operator.call(
            this.source, !(destination instanceof Subscriber) ?
                new Subscriber(destination, x, y) : destination)
    ]);
}

Source.prototype.then = function then(onNext, onError) {
    /* global Promise */
    var source = this;
    if (!this._promise) {
        this._promise = new global['Promise'](function(resolve, reject) {
            var values = [], rejected = false;
            source.subscribe({
                next: function(value) { values[values.length] = value; },
                error: function(errors) { (rejected = true) && reject(errors); },
                complete: function() {
                    !rejected &&
                    resolve(values.length <= 1 ? values[0] : values);
                }
            });
        });
    }
    return this._promise.then(onNext, onError);
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(32)))

/***/ },
/* 50 */
/***/ function(module, exports) {

var empty = {
    dispose: function() {},
    unsubscribe: function() {}
};

function ImmediateScheduler() {}

ImmediateScheduler.prototype.schedule = function schedule(action) {
    action();
    return empty;
};

module.exports = ImmediateScheduler;


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(2);
module.exports = function getTimestamp(node) {
    return isObject(node) && node.$timestamp || undefined;
};


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(2);

module.exports = function isJSONEnvelope(envelope) {
    return isObject(envelope) && ('json' in envelope);
};


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

var isArray = Array.isArray;
var isObject = __webpack_require__(2);

module.exports = function isJSONGraphEnvelope(envelope) {
    return isObject(envelope) && isArray(envelope.paths) && (
        isObject(envelope.jsonGraph) ||
        isObject(envelope.jsong) ||
        isObject(envelope.json) ||
        isObject(envelope.values) ||
        isObject(envelope.value)
    );
};


/***/ },
/* 54 */
/***/ function(module, exports) {

module.exports = Date.now;


/***/ },
/* 55 */
/***/ function(module, exports) {

module.exports = 1;


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

var Model = __webpack_require__(57);
var FalcorJSON = __webpack_require__(5);

function falcor(opts) {
    if (!(this instanceof Model)) {
        return new Model(opts);
    }
    Model.call(this, opts);
}

falcor.prototype = Object.create(Model.prototype);

falcor['Model'] = Model;
falcor['FalcorJSON'] = FalcorJSON;
falcor['toProps'] = FalcorJSON.prototype.toProps;

module.exports = falcor;


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

var Call = __webpack_require__(84);
var ModelRoot = __webpack_require__(59);
var FalcorJSON = __webpack_require__(5);
var ModelDataSourceAdapter = __webpack_require__(58);
var TimeoutScheduler = __webpack_require__(88);
var ImmediateScheduler = __webpack_require__(50);

var lruCollect = __webpack_require__(47);
var getSize = __webpack_require__(7);
var isObject = __webpack_require__(2);
var isJSONEnvelope = __webpack_require__(52);
var getCachePosition = __webpack_require__(9);
var isJSONGraphEnvelope = __webpack_require__(53);

var setCache = __webpack_require__(17);
var setJSONGraphs = __webpack_require__(16);

var getJSON = __webpack_require__(20);
var getCache = __webpack_require__(68);
var getJSONGraph = __webpack_require__(21);

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
        this._seed = { __proto__: FalcorJSON.prototype };
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
Model.prototype.get = function get() {
    return new Call(
        'get', this, Array.prototype.slice.call(arguments, 0)
    )._toJSON(this._seed || { __proto__: FalcorJSON.prototype }, []);
}

/**
 * Sets the value at one or more places in the JSONGraph model. The set method accepts one or more {@link PathValue}s, each of which is a combination of a location in the document and the value to place there.  In addition to accepting  {@link PathValue}s, the set method also returns the values after the set operation is complete.
 * @function
 * @return {ModelResponse.<JSONEnvelope>} - an {@link Observable} stream containing the values in the JSONGraph model after the set was attempted
 */
Model.prototype.set = function set() {
    return new Call(
        'set', this, Array.prototype.slice.call(arguments, 0)
    )._toJSON({ __proto__: FalcorJSON.prototype }, []);
}

/**
 * The preload method retrieves several {@link Path}s or {@link PathSet}s from a {@link Model} and loads them into the Model cache.
 * @function
 * @param {...PathSet} path - the path(s) to retrieve
 * @return {ModelResponse.<JSONEnvelope>} - a ModelResponse that completes when the data has been loaded into the cache.
 */
Model.prototype.preload = function preload() {
    return new Call(
        'get', this, Array.prototype.slice.call(arguments, 0)
    )._toJSON(null, []);
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

Model.prototype.call = function call() {
    return new Call(
        'call', this, Array.prototype.slice.call(arguments, 0)
    )._toJSON({ __proto__: FalcorJSON.prototype }, []);
}

/**
 * The invalidate method synchronously removes several {@link Path}s or {@link PathSet}s from a {@link Model} cache.
 * @function
 * @param {...PathSet} path - the  paths to remove from the {@link Model}'s cache.
 */
Model.prototype.invalidate = function invalidate() {
    return new Call(
        'invalidate', this, Array.prototype.slice.call(arguments, 0)
    )._toJSON(null, null).then();
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
Model.prototype.deref = __webpack_require__(78);

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
Model.prototype._hasValidParentReference = __webpack_require__(77);

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
    return this.get(path).lift(function(subscriber) {
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
    return this.set(value).lift(function(subscriber) {
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
    var cache = this._root.cache;
    if (cacheOrJSONGraphEnvelope !== cache) {
        var modelRoot = this._root;
        var boundPath = this._path;
        this._path = [];
        this._node = this._root.cache = {};
        if (typeof cache !== 'undefined') {
            lruCollect(modelRoot, modelRoot.expired, getSize(cache), 0);
            if (this._recycleJSON) {
                this._seed = { __proto__: FalcorJSON.prototype };
            }
        }
        var paths;
        if (isJSONGraphEnvelope(cacheOrJSONGraphEnvelope)) {
            paths = setJSONGraphs(this, [cacheOrJSONGraphEnvelope])[0];
        } else if (isJSONEnvelope(cacheOrJSONGraphEnvelope)) {
            paths = setCache(this, [cacheOrJSONGraphEnvelope])[0];
        } else if (isObject(cacheOrJSONGraphEnvelope)) {
            paths = setCache(this, [{ json: cacheOrJSONGraphEnvelope }])[0];
        }
        // performs promotion without producing output.
        if (paths) {
            getJSON(this, paths, null, false, true);
        }
        this._path = boundPath;
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
    var result = {};
    var path = this._path;
    this._path = [];
    getJSONGraph(this, paths, result);
    this._path = path;
    return result.jsonGraph;
};

/**
 * Retrieves a number which is incremented every single time a value is changed underneath the Model or the object at an optionally-provided Path beneath the Model.
 * @param {Path?} path - a path at which to retrieve the version number
 * @return {Number} a version number which changes whenever a value is changed underneath the Model or provided Path
 */
Model.prototype.getVersion = function getVersion(path = []) {
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
    var abs_path = node && node["ƒ_abs_path"] || [];
    return abs_path.slice(0);
};

Model.prototype._getVersion = __webpack_require__(69);
Model.prototype._getPathValuesAsPathMap = getJSON;
Model.prototype._getPathValuesAsJSONG = getJSONGraph;

Model.prototype._setPathValues = __webpack_require__(28);
Model.prototype._setPathMaps = __webpack_require__(17);
Model.prototype._setJSONGs = __webpack_require__(16);
Model.prototype._setCache = __webpack_require__(17);

Model.prototype._invalidatePathValues = __webpack_require__(25);
Model.prototype._invalidatePathMaps = __webpack_require__(39);


/***/ },
/* 58 */
/***/ function(module, exports) {

function ModelDataSourceAdapter(model) {
    this._model = model._materialize().treatErrorsAsValues();
}

ModelDataSourceAdapter.prototype.get = function get(pathSets) {
    return this._model.get.apply(this._model, pathSets)._toJSONG();
};

ModelDataSourceAdapter.prototype.set = function set(jsongResponse) {
    return this._model.set(jsongResponse)._toJSONG();
};

ModelDataSourceAdapter.prototype.call = function call(path, args, suffixes, paths) {
    return this._model.call.apply(this._model, [
        path, args, suffixes
    ].concat(paths))._toJSONG();
};

module.exports = ModelDataSourceAdapter;


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

var functionTypeof = 'function';
var hasOwn = __webpack_require__(93);
var Requests = __webpack_require__(85);

function ModelRoot(o, model) {

    var options = o || {};

    this.cache = {};
    this.version = 0;
    this.syncRefCount = 0;
    this.maxRetryCount = 10;
    this.topLevelModel = model;
    this.requests = new Requests(this);
    this.expired = options.expired || [];

    this.collectRatio = 0.75;
    this.maxSize = Math.pow(2, 53) - 1;

    if (typeof options.collectRatio === 'number') {
        this.collectRatio = options.collectRatio;
    }

    if (typeof options.maxSize === 'number') {
        this.maxSize = options.maxSize;
    }

    if (typeof options.comparator === functionTypeof) {
        this.comparator = options.comparator;
    }

    if (typeof options.branchSelector === functionTypeof) {
        this.branchSelector = options.branchSelector;
    }

    if (typeof options.errorSelector === functionTypeof) {
        this.errorSelector = options.errorSelector;
    }

    if (typeof options.branchSelector === functionTypeof) {
        this.branchSelector = options.branchSelector;
    }

    if (typeof options.onChange === functionTypeof) {
        this.onChange = options.onChange;
    }

    if (typeof options.onChangesCompleted === functionTypeof) {
        this.onChangesCompleted = options.onChangesCompleted;
    }
}

ModelRoot.prototype.errorSelector = function errorSelector(x, y) {
    return y;
};

ModelRoot.prototype.comparator = function comparator(cacheNode, messageNode) {
    if (hasOwn(cacheNode, 'value') && hasOwn(messageNode, 'value')) {
        // They are the same only if the following fields are the same.
        return cacheNode.value === messageNode.value &&
            cacheNode.$type === messageNode.$type &&
            cacheNode.$expires === messageNode.$expires;
    }
    return cacheNode === messageNode;
};

module.exports = ModelRoot;


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

var getJSON = __webpack_require__(20);
var getJSONGraph = __webpack_require__(21);

module.exports = { json: json, jsonGraph: jsonGraph };

function json(model, _args, data, progressive) {
    var hasValue = false;
    if (!_args) {
        return { missing: false, hasValue: false };
    }
    var args = [].concat(_args[1] || []);
    var suffixes = [].concat(_args[2] || []);
    var thisPaths = [].concat(_args[3] || []);
    var path = (model._path || []).concat(_args[0] || []);
    if (progressive && thisPaths && thisPaths.length) {
        hasValue =  getJSON(model, thisPaths, data, progressive, true).hasValue;
    }
    return {
        data: data,
        missing: true,
        hasValue: hasValue,
        fragments: [
            path, args, suffixes, thisPaths
        ]
    };
}

function jsonGraph(model, _args, data, progressive) {
    var hasValue = false;
    if (!_args) {
        return { missing: false, hasValue: false };
    }
    var args = [].concat(_args[1] || []);
    var suffixes = [].concat(_args[2] || []);
    var thisPaths = [].concat(_args[3] || []);
    var path = (model._path || []).concat(_args[0] || []);
    if (progressive && thisPaths && thisPaths.length) {
        hasValue = getJSONGraph({
            _root: model._root,
            _boxed: model._boxed,
            _materialized: model._materialized,
            _treatErrorsAsValues: model._treatErrorsAsValues
        }, thisPaths, data, true, true).hasValue;
    }
    return {
        data: data,
        missing: true,
        hasValue: hasValue,
        fragments: [
            path, args, suffixes, thisPaths
        ]
    };
}


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

module.exports = {
    json: __webpack_require__(34),
    jsonGraph: __webpack_require__(37)
};


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

var clone = __webpack_require__(8);

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



/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

var arr = new Array(2);
var onValue = __webpack_require__(36);
var $ref = __webpack_require__(0);
var FalcorJSON = __webpack_require__(5);
var onValueType = __webpack_require__(24);
var isExpired = __webpack_require__(1);
var originalOnMissing = __webpack_require__(23);
var getReferenceTarget = __webpack_require__(35);
var NullInPathError = __webpack_require__(6);
var InvalidKeySetError = __webpack_require__(29);
var getHashCode = __webpack_require__(103);
var flatBufferToPaths = __webpack_require__(102);

module.exports = walkPathAndBuildOutput;

/* eslint-disable camelcase */
/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function walkPathAndBuildOutput(cacheRoot, node, json, path, depth, seed, results,
                                requestedPath, optimizedPath, optimizedLength,
                                fromReference, referenceContainer,
                                modelRoot, expired, expireImmediate, branchSelector,
                                boxValues, materialized, hasDataSource,
                                treatErrorsAsValues, allowFromWhenceYouCame) {

    var type, refTarget;

    // ============ Check for base cases ================

    // If there's nowhere to go, we've reached a terminal node, or hit
    // the end of the path, stop now. Either build missing paths or report the value.
    if (undefined === node ||
        undefined !== (type = node.$type) ||
        undefined === path) {
        arr[1] = false;
        arr[0] = onValueType(node, type, json,
                             path, depth, seed, results,
                             requestedPath, depth,
                             optimizedPath, optimizedLength,
                             fromReference, modelRoot, expired, expireImmediate,
                             branchSelector, boxValues, materialized, hasDataSource,
                             treatErrorsAsValues, onValue, onMissing);
        return arr;
    }

    var f_meta, f_old_keys, f_new_keys, f_code = '';

    var next, nextKey,
        keyset, keyIsRange,
        keys = path['$keys'],
        nextDepth = depth + 1, rangeEnd,
        nextJSON, nextReferenceContainer,
        nextOptimizedLength, nextOptimizedPath,
        optimizedLengthNext = optimizedLength + 1,
        refContainerAbsPath, refContainerRefPath;

    if (allowFromWhenceYouCame && referenceContainer) {
        refContainerRefPath = referenceContainer.value;
        refContainerAbsPath = referenceContainer["ƒ_abs_path"];
    }

    if (json) {
        if (typeof json !== 'object') {
            json = undefined;
        } else if (f_meta = json["ƒ_meta"]) {
            if (!branchSelector && !(json instanceof FalcorJSON)) {
                json = { ["ƒ_meta"]: f_meta, __proto__: FalcorJSON.prototype };
            } else if (
                f_meta["version"]  === node["ƒ_version"] &&
                f_meta['$code']         === path['$code'] &&
                f_meta["abs_path"] === node["ƒ_abs_path"]) {
                results.hasValue = true;
                arr[0] = json;
                arr[1] = false;
                return arr;
            }
            f_old_keys = f_meta["keys"];
            f_meta["version"] = node["ƒ_version"];
            f_meta["abs_path"] = node["ƒ_abs_path"];
            f_meta["deref_to"] = refContainerRefPath;
            f_meta["deref_from"] = refContainerAbsPath;
        }
    }

    f_new_keys = {};

    var keysIndex = -1;
    var keysLength = keys.length;
    var nextPath, nextPathKey,
        hasMissingPath = false,
        nextMeta, nextMetaPath;

    iteratingKeyset:
    while (++keysIndex < keysLength) {

        keyset = keys[keysIndex];
        nextPath = path[keysIndex];
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
            f_code = '' + getHashCode('' + f_code + 'null');
            continue;
        }
        // If the keyset is a primitive value, we've found our `nextKey`.
        else if ('object' !== typeof keyset) {
            nextKey = keyset;
            rangeEnd = undefined;
            keyIsRange = false;
            nextPathKey = nextKey;
        }
        // If the Keyset isn't null or primitive, then it must be a Range.
        else {
            rangeEnd = keyset.to;
            nextKey = keyset.from || 0;
            if ('number' !== typeof rangeEnd) {
                rangeEnd = nextKey + (keyset.length || 0) - 1;
            }
            if ((rangeEnd - nextKey) < 0) {
                break iteratingKeyset;
            }
            keyIsRange = true;
            nextPathKey = '{from:' + nextKey + ',length:' + (rangeEnd - nextKey + 1) + '}';
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
                nextPath !== undefined &&
                // If the reference is expired, it will be invalidated and
                // reported as missing in the next call to walkPath below.
                next.$type === $ref && !isExpired(next, expireImmediate)) {

                // Retrieve the reference target and next referenceContainer (if
                // this reference points to other references) and continue
                // following the path. If the reference resolves to a missing
                // path or leaf node, it will be handled in the next call to
                // walkPath.
                refTarget = getReferenceTarget(cacheRoot, next, modelRoot, expireImmediate);

                next = refTarget[0];
                fromReference = true;
                nextOptimizedPath = refTarget[1];
                nextReferenceContainer = refTarget[2];
                nextOptimizedLength = nextOptimizedPath.length;
                refTarget[0] = refTarget[1] = refTarget[2] = undefined;
            }

            // Continue following the path

            arr = walkPathAndBuildOutput(
                cacheRoot, next, nextJSON, nextPath, nextDepth, seed,
                results, requestedPath, nextOptimizedPath,
                nextOptimizedLength, fromReference, nextReferenceContainer,
                modelRoot, expired, expireImmediate, branchSelector, boxValues,
                materialized, hasDataSource, treatErrorsAsValues, allowFromWhenceYouCame
            );

            nextJSON = arr[0];
            hasMissingPath = hasMissingPath || arr[1];

            if (!seed) {
                continue;
            }

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
                    f_meta["version"] = node["ƒ_version"];
                    f_meta["abs_path"] = node["ƒ_abs_path"];
                    f_meta["deref_to"] = refContainerRefPath;
                    f_meta["deref_from"] = refContainerAbsPath;
                    // Empower developers to instrument branch node creation by
                    // providing a custom function. If they do, delegate branch
                    // node creation to them.
                    json = branchSelector && branchSelector({
                        ["ƒ_meta"]: f_meta, __proto__: FalcorJSON.prototype }) || {
                        ["ƒ_meta"]: f_meta, __proto__: FalcorJSON.prototype };
                }

                f_new_keys[nextKey] = true;
                if (f_old_keys && f_old_keys.hasOwnProperty(nextKey)) {
                    f_old_keys[nextKey] = false;
                }
                // Set the reported branch or leaf into this branch.
                json[nextKey] = nextJSON;
            } else {
                hasMissingPath = true;
                if (json && json.hasOwnProperty(nextKey)) {
                    delete json[nextKey];
                }
            }
        }
        // Re-enter the inner loop and continue iterating the Range, or exit
        // here if we encountered a Key.
        while (keyIsRange && ++nextKey <= rangeEnd);

        if (!hasMissingPath) {
            if (undefined === nextPath) {
                f_code = '' + getHashCode('' + f_code + nextPathKey);
            } else {
                f_code = '' + getHashCode('' + f_code + nextPathKey + nextPath['$code']);
            }
        }
    }

    if (hasMissingPath) {
        f_code = '__incomplete__';
    }

    if (f_meta) {
        f_meta['$code'] = f_code;
        f_meta["keys"] = f_new_keys;
        if (f_old_keys) {
            for (nextKey in f_old_keys) {
                if (f_old_keys[nextKey]) {
                    delete json[nextKey];
                }
            }
        }
    }

    // `json` will be a branch if any cache hits, or undefined if all cache misses

    arr[0] = json;
    arr[1] = hasMissingPath;

    return arr;
}
/* eslint-enable */

function onMissing(path, depth, results,
                   requestedPath, requestedLength, fromReference,
                   optimizedPath, optimizedLength, reportMissing,
                   json, reportMaterialized, branchSelector) {

    var suffix;
    var paths = path ? flatBufferToPaths(path) : [[]];
    var rPath = requestedPath.slice(0, requestedLength);
    var createMaterializedBranch = !branchSelector ?
        createDefaultMaterializedBranch :
        wrapMaterializedBranchSelector(branchSelector);

    return paths.reduce(function(json, restPath) {
        requestedLength = depth + restPath.length;
        return originalOnMissing(rPath.concat(restPath), depth,
                                 results, requestedPath, requestedLength, fromReference,
                                 optimizedPath, optimizedLength, reportMissing, json,
                                 reportMaterialized, createMaterializedBranch);
    }, json);
}

function wrapMaterializedBranchSelector(branchSelector) {
    return function(path, _depth, node) {
        return branchSelector(
            node = createDefaultMaterializedBranch(path, _depth, node)
        ) || node;
    }
}

function createDefaultMaterializedBranch(path, _depth, node) {
    var f_meta = {};
    f_meta["version"] = 0;
    f_meta["abs_path"] = path.slice(0, _depth);
    return { ["ƒ_meta"]: f_meta, __proto__: FalcorJSON.prototype };
 }


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

var isArray = Array.isArray;
var onValue = __webpack_require__(36);
var $ref = __webpack_require__(0);
var FalcorJSON = __webpack_require__(5);
var onValueType = __webpack_require__(24);
var isExpired = __webpack_require__(1);
var originalOnMissing = __webpack_require__(23);
var getReferenceTarget = __webpack_require__(35);
var NullInPathError = __webpack_require__(6);
var InvalidKeySetError = __webpack_require__(29);

module.exports = walkPathAndBuildOutput;

/* eslint-disable camelcase */
/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function walkPathAndBuildOutput(cacheRoot, node, json, path,
                                depth, seed, results,
                                requestedPath, requestedLength,
                                optimizedPath, optimizedLength,
                                fromReference, referenceContainer,
                                modelRoot, expired, expireImmediate,
                                branchSelector, boxValues, materialized,
                                hasDataSource, treatErrorsAsValues,
                                allowFromWhenceYouCame) {

    var type, refTarget;

    // ============ Check for base cases ================

    // If there's nowhere to go, we've reached a terminal node, or hit
    // the end of the path, stop now. Either build missing paths or report the value.
    if (node === undefined || (
        type = node.$type) || (
        depth === requestedLength)) {
        return onValueType(node, type, json,
                           path, depth, seed, results,
                           requestedPath, requestedLength,
                           optimizedPath, optimizedLength,
                           fromReference, modelRoot, expired, expireImmediate,
                           branchSelector, boxValues, materialized, hasDataSource,
                           treatErrorsAsValues, onValue, onMissing);
    }

    var f_meta;

    var next, nextKey,
        keyset, keyIsRange,
        nextDepth = depth + 1,
        rangeEnd, keysOrRanges,
        nextJSON, nextReferenceContainer,
        keysetIndex = -1, keysetLength = 0,
        nextOptimizedLength, nextOptimizedPath,
        optimizedLengthNext = optimizedLength + 1,
        refContainerAbsPath, refContainerRefPath;

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
        refContainerAbsPath = referenceContainer["ƒ_abs_path"];
    }

    if (json) {
        if (typeof json !== 'object') {
            json = undefined;
        } else if (f_meta = json["ƒ_meta"]) {
            f_meta["version"] = node["ƒ_version"];
            f_meta["abs_path"] = node["ƒ_abs_path"];
            f_meta["deref_to"] = refContainerRefPath;
            f_meta["deref_from"] = refContainerAbsPath;
        }
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
            if ('number' !== typeof rangeEnd) {
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
                next.$type === $ref && !isExpired(next, expireImmediate)) {

                // Retrieve the reference target and next referenceContainer (if
                // this reference points to other references) and continue
                // following the path. If the reference resolves to a missing
                // path or leaf node, it will be handled in the next call to
                // walkPath.
                refTarget = getReferenceTarget(cacheRoot, next, modelRoot, expireImmediate);

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
                modelRoot, expired, expireImmediate, branchSelector, boxValues,
                materialized, hasDataSource, treatErrorsAsValues, allowFromWhenceYouCame
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
                if (f_meta === undefined) {
                    f_meta = {};
                    f_meta["version"] = node["ƒ_version"];
                    f_meta["abs_path"] = node["ƒ_abs_path"];
                    f_meta["deref_to"] = refContainerRefPath;
                    f_meta["deref_from"] = refContainerAbsPath;
                    // Empower developers to instrument branch node creation by
                    // providing a custom function. If they do, delegate branch
                    // node creation to them.
                    json = branchSelector && branchSelector({
                        ["ƒ_meta"]: f_meta, __proto__: FalcorJSON.prototype }) || {
                        ["ƒ_meta"]: f_meta, __proto__: FalcorJSON.prototype };
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

    // `json` will be a branch if any cache hits, or undefined if all cache misses
    return json;
}
/* eslint-enable */

function onMissing(path, depth, results,
                   requestedPath, requestedLength, fromReference,
                   optimizedPath, optimizedLength, reportMissing,
                   json, reportMaterialized, branchSelector) {

    var createMaterializedBranch = !branchSelector ?
        createDefaultMaterializedBranch :
        wrapMaterializedBranchSelector(branchSelector);

    return originalOnMissing(path, depth, results,
                             requestedPath, requestedLength, fromReference,
                             optimizedPath, optimizedLength, reportMissing,
                             json, reportMaterialized, createMaterializedBranch);
}

function wrapMaterializedBranchSelector(branchSelector) {
    return function(path, _depth, node) {
        return branchSelector(
            node = createDefaultMaterializedBranch(path, _depth, node)
        ) || node;
    }
}

function createDefaultMaterializedBranch(path, _depth, node) {
    var f_meta = {};
    f_meta["version"] = 0;
    f_meta["abs_path"] = path.slice(0, _depth);
    return { ["ƒ_meta"]: f_meta, __proto__: FalcorJSON.prototype };
 }


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

var arr = new Array(2);
var clone = __webpack_require__(8);
var $ref = __webpack_require__(0);
var inlineValue = __webpack_require__(22);
var promote = __webpack_require__(11);
var isExpired = __webpack_require__(1);
var createHardlink = __webpack_require__(4);
var CircularReferenceError = __webpack_require__(45);

module.exports = getReferenceTarget;

/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function getReferenceTarget(root, ref, modelRoot, seed, boxValues, materialized, expireImmediate) {

    promote(modelRoot, ref);

    var context,
        key, type, depth = 0,
        followedRefsCount = 0,
        node = root, path = ref.value,
        copy = path, length = path.length;

    do {
        if (depth === 0 && undefined !== (context = ref["ƒ_context"])) {
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
            if (undefined !== type && isExpired(node, expireImmediate)) {
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

                seed && inlineValue(clone(node), path, length, seed);

                depth = 0;
                ref = node;
                node = root;
                path = copy = ref.value;
                length = path.length;

                // if (DEBUG) {
                //     // If we follow too many references, we might have an indirect
                //     // circular reference chain. Warn about this (but don't throw).
                //     if (++followedRefsCount % 50 === 0) {
                //         try {
                //             throw new Error(
                //                 'Followed ' + followedRefsCount + ' references. ' +
                //                 'This might indicate the presence of an indirect ' +
                //                 'circular reference chain.'
                //             );
                //         } catch (e) {
                //             if (console) {
                //                 var reportFn = typeof console.log === 'function' && console.log;
                //                 if (reportFn) {
                //                     reportFn.call(console, e.toString());
                //                 }
                //             }
                //         }
                //     }
                // }

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
/* 66 */
/***/ function(module, exports, __webpack_require__) {

var clone = __webpack_require__(8);
var $ref = __webpack_require__(0);
var $error = __webpack_require__(14);
var inlineValue = __webpack_require__(22);
var materializedAtom = __webpack_require__(19);

module.exports = onJSONGraphValue;

function onJSONGraphValue(node, type, depth, seed, results,
                          requestedPath, optimizedPath, optimizedLength,
                          fromReference, boxValues, materialized) {

    var value = node && node.value;
    var requiresMaterializedToReport = type && value === undefined;

    if (requiresMaterializedToReport) {
        if (materialized) {
            value = materializedAtom;
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
             !node["ƒ_wrapped_value"] ||
             'object' === typeof value) {
        value = clone(node);
    }

    if (seed) {
        results.hasValue = true;
        inlineValue(value, optimizedPath, optimizedLength, seed);
        (seed.paths || (seed.paths = [])).push(
            requestedPath.slice(0, depth + !!fromReference) // depth + 1 if fromReference === true
        );
    }

    return value;
}


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

var isArray = Array.isArray;
var clone = __webpack_require__(8);
var $ref = __webpack_require__(0);
var onValue = __webpack_require__(66);
var inlineValue = __webpack_require__(22);
var onValueType = __webpack_require__(24);
var isExpired = __webpack_require__(1);
var originalOnMissing = __webpack_require__(23);
var getReferenceTarget = __webpack_require__(65);
var NullInPathError = __webpack_require__(6);
var InvalidKeySetError = __webpack_require__(29);
var materializedAtom = __webpack_require__(19);

module.exports = walkPathAndBuildOutput;

/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function walkPathAndBuildOutput(cacheRoot, node, path,
                                depth, seed, results,
                                requestedPath, requestedLength,
                                optimizedPath, optimizedLength,
                                fromReference, modelRoot, expired, expireImmediate,
                                boxValues, materialized, hasDataSource, treatErrorsAsValues) {

    var type, refTarget;

    // ============ Check for base cases ================

    // If there's nowhere to go, we've reached a terminal node, or hit
    // the end of the path, stop now. Either build missing paths or report the value.
    if (node === undefined || (
        type = node.$type) || (
        depth === requestedLength)) {
        return onValueType(node, type, seed,
                           path, depth, seed, results,
                           requestedPath, requestedLength,
                           optimizedPath, optimizedLength,
                           fromReference, modelRoot, expired, expireImmediate,
                           undefined, boxValues, materialized, hasDataSource,
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
            if ('number' !== typeof rangeEnd) {
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
                next.$type === $ref && !isExpired(next, expireImmediate)) {

                // Write the cloned ref value into the jsonGraph at the
                // optimized path. JSONGraph must always clone references.
                seed && inlineValue(clone(next), optimizedPath, nextOptimizedLength, seed);

                // Retrieve the reference target and next referenceContainer (if
                // this reference points to other references) and continue
                // following the path. If the reference resolves to a missing
                // path or leaf node, it will be handled in the next call to
                // walkPath.
                refTarget = getReferenceTarget(cacheRoot, next, modelRoot, seed,
                                               boxValues, materialized, expireImmediate);

                next = refTarget[0];
                fromReference = true;
                nextOptimizedPath = refTarget[1];
                nextOptimizedLength = nextOptimizedPath.length;
                refTarget[0] = refTarget[1] = undefined;
            }

            walkPathAndBuildOutput(
                cacheRoot, next, path, nextDepth, seed,
                results, requestedPath, requestedLength, nextOptimizedPath,
                nextOptimizedLength, fromReference, modelRoot, expired, expireImmediate,
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

function onMissing(path, depth, results,
                   requestedPath, requestedLength, fromReference,
                   optimizedPath, optimizedLength, reportMissing,
                   seed, reportMaterialized, branchSelector) {

    var json, isLeaf;

    if (seed && reportMaterialized) {

        (seed.paths || (seed.paths = [])).push(
            (isLeaf = 0 === requestedLength - depth) &&
                                 // depth + 1 if fromReference === true
                requestedPath.slice(0, depth + !!fromReference) ||
                requestedPath.slice(0, depth).concat(path
                    .slice(depth, requestedLength + !!fromReference))
        );

        json = inlineValue(isLeaf && materializedAtom || undefined,
                           optimizedPath, optimizedLength, seed, !isLeaf);
    }

    return originalOnMissing(path, depth, results,
                             requestedPath, requestedLength, fromReference,
                             optimizedPath, optimizedLength, reportMissing,
                             json, reportMaterialized);
}


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

var isInternalKey = __webpack_require__(18);

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

        if (key === '$type' || !isInternalKey(key)) {
            clonedValue[key] = boxedValue[key];
        }
    }

    return clonedValue;
}

function _copyCache(node, out, fromKey) {
    // copy and return

    // only copy objects
    if (!node || typeof node !== 'object') {
        return;
    }

    Object.
        keys(node).
        filter(function(key) {
            // Its not an internal key and the node has a value.  In the cache
            // there are 3 possibilities for values.
            // 1: A branch node.
            // 2: A $type-value node.
            // 3: undefined
            // We will strip out 3
            return (key === '$type' || !isInternalKey(key)) && node[key] !== undefined;
        }).
        forEach(function(key) {
            var cacheNext = node[key];
            var outNext = out[key];

            if (!outNext) {
                outNext = out[key] = {};
            }

            // Paste the node into the out cache.
            if (cacheNext.$type) {
                var isObject = cacheNext.value && typeof cacheNext.value === 'object';
                var isUserCreatedcacheNext = !cacheNext["ƒ_wrapped_value"];
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
/* 69 */
/***/ function(module, exports, __webpack_require__) {

var getBoundCacheNode = __webpack_require__(15);

module.exports = function _getVersion(model, path) {
    var node = getBoundCacheNode(model, path);
    var version = node && node["ƒ_version"];
    return (version == null) ? -1 : version;
};


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

var isArray = Array.isArray;
var isPathValue = __webpack_require__(94);
var isJSONEnvelope = __webpack_require__(52);
var isJSONGraphEnvelope = __webpack_require__(53);

module.exports = groupCacheArguments;

function groupCacheArguments(args) {

    var groups = [];
    var argIndex = -1;
    var argCount = args.length;
    var group, groupType, arg, argType;

    while (++argIndex < argCount) {
        arg = args[argIndex];
        if (isArray(arg)) {
            arg = { path: arg };
            argType = 'PathValues';
        } else if (isPathValue(arg)) {
            argType = 'PathValues';
        } else if (isJSONGraphEnvelope(arg)) {
            argType = 'JSONGraphs';
        } else if (isJSONEnvelope(arg)) {
            argType = 'PathMaps';
        }

        if (groupType !== argType) {
            groupType = argType;
            groups.push(group = {
                arguments: [],
                inputType: argType
            });
        }

        group.arguments.push(arg);
    }

    return groups;
}


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

var invalidatePathSets = __webpack_require__(25);
var invalidatePathMaps = __webpack_require__(39);

module.exports = {
    json: invalidate,
    jsonGraph: invalidate,
}

function invalidate(model, args, seed, progressive, expireImmediate) {
    invalidatePathSets(model, args, expireImmediate);
    return {};
}


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

var $ref = __webpack_require__(0);
var $error = __webpack_require__(14);
var getSize = __webpack_require__(7);
var getTimestamp = __webpack_require__(51);

var wrapNode = __webpack_require__(44);
var isExpired = __webpack_require__(1);
var insertNode = __webpack_require__(38);
var expireNode = __webpack_require__(3);
var replaceNode = __webpack_require__(42);
var reconstructPath = __webpack_require__(41);
var updateNodeAncestors = __webpack_require__(10);

module.exports = function mergeJSONGraphNode(
    parent, node, message, key, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, expireImmediate) {

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

        // The message and cache are both undefined, return undefined.
        else if (message === undefined) {
            return message;
        }

        else {
            cIsObject = !(!node || typeof node !== 'object');
            if (cIsObject) {
                // Is the cache node a branch? If so, return the cache branch.
                cType = node.$type;
                if (cType == null) {
                    // Has the branch been introduced to the cache yet? If not,
                    // give it a parent, key, and absolute path.
                    if (node["ƒ_parent"] == null) {
                        insertNode(node, parent, key, version, optimizedPath);
                    }
                    return node;
                }
            }
        }
    } else {
        cIsObject = !(!node || typeof node !== 'object');
        if (cIsObject) {
            cType = node.$type;
        }
    }

    // If the cache isn't a reference, we might be able to return early.
    if (cType !== $ref) {
        mIsObject = !(!message || typeof message !== 'object');
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
            if (isExpired(node, expireImmediate)) {
                expireNode(node, expired, lru);
                return void 0;
            }
            return node;
        }
        mIsObject = !(!message || typeof message !== 'object');
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
                    if (node["ƒ_parent"] != null) {
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
                    if (!isExpired(node, expireImmediate) &&
                        !isExpired(message, expireImmediate) &&
                        mTimestamp < cTimestamp) {
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

        if (mType === $error && errorSelector) {
            message = errorSelector(reconstructPath(requestedPath, key), message);
        }

        if (mType && node === message) {
            if (node["ƒ_parent"] == null) {
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
            if ((cType && !isExpired(node, expireImmediate)) || !cIsObject) {
                // Compare the current cache value with the new value. If either of
                // them don't have a timestamp, or the message's timestamp is newer,
                // replace the cache value with the message value. If a comparator
                // is specified, the comparator takes precedence over timestamps.
                //
                // Comparing either Number or undefined to undefined always results in false.
                isDistinct = (getTimestamp(message) < getTimestamp(node)) === false;
                // If at least one of the cache/message are sentinels, compare them.
                if (isDistinct && (cType || mType) && comparator) {
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
        if (isExpired(node,
            /* expireImmediate:
             * force true so the node is marked as
             * expired but keep using it for the merge.
             */
            true)) {
            expireNode(node, expired, lru);
        }
    }
    else if (node == null) {
        node = insertNode(message, parent, key, undefined, optimizedPath);
    }

    return node;
};


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

var getJSON = __webpack_require__(20);
var getJSONGraph = __webpack_require__(21);
var arrayFlatMap = __webpack_require__(89);
var groupCacheArguments = __webpack_require__(70);

module.exports = {
    json: json,
    jsonGraph: jsonGraph,
    setPathMaps: __webpack_require__(17),
    setPathValues: __webpack_require__(28),
    setJSONGraphs: __webpack_require__(16)
};

function json(model, args, data, progressive, expireImmediate) {
    args = groupCacheArguments(args);
    var set = setGroupsIntoCache(model, args /*, expireImmediate */);
    var get = progressive && getJSON(model, set.relative, data, progressive, expireImmediate);
    var jsong = getJSONGraph({
        _root: model._root, _boxed: model._boxed, _materialized: true,
        _treatErrorsAsValues: model._treatErrorsAsValues
    }, set.optimized, {}, progressive, expireImmediate);
    return {
        args: args,
        data: data,
        fragments: jsong.data,
        missing: set.optimized,
        relative: set.relative,
        error: get && get.error,
        errors: get && get.errors,
        requested: jsong.requested,
        hasValue: get && get.hasValue
    };
}

function jsonGraph(model, args, data, progressive, expireImmediate) {
    args = groupCacheArguments(args);
    var set = setGroupsIntoCache(model, args /*, expireImmediate */);
    var jsong = getJSONGraph({
        _root: model._root,
        _boxed: model._boxed, _materialized: true,
        _treatErrorsAsValues: model._treatErrorsAsValues
    }, set.optimized, data, progressive, expireImmediate);
    return {
        args: args,
        data: data,
        error: jsong.error,
        fragments: jsong.data,
        missing: set.optimized,
        relative: set.relative,
        hasValue: jsong.hasValue,
        requested: jsong.requested
    };
}

function setGroupsIntoCache(model, xs /*, expireImmediate */) {

    var groupIndex = -1;
    var groupCount = xs.length;
    var requestedPaths = [];
    var optimizedPaths = [];
    var modelRoot = model._root;
    var selector = modelRoot.errorSelector;

    // Takes each of the groups and normalizes their input into
    // requested paths and optimized paths.
    while (++groupIndex < groupCount) {

        var group = xs[groupIndex];
        var inputType = group.inputType;
        var groupedArgs = group.arguments;

        if (groupedArgs.length > 0) {
            var operation = module.exports['set' + inputType];
            var resultPaths = operation(model, groupedArgs, selector, null, false);
            optimizedPaths.push.apply(optimizedPaths, resultPaths[1]);
            if (inputType === 'PathValues') {
                requestedPaths.push.apply(requestedPaths, groupedArgs.map(pluckPaths));
            } else if (inputType === 'JSONGraphs') {
                requestedPaths.push.apply(requestedPaths, arrayFlatMap(groupedArgs, pluckPaths));
            } else {
                requestedPaths.push.apply(requestedPaths, resultPaths[0]);
            }
        }
    }

    return { optimized: optimizedPaths, relative: requestedPaths };
};

function pluckPaths(x) {
    return x.path || x.paths;
}


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

module.exports = function transferBackReferences(fromNode, destNode) {
    var fromNodeRefsLength = fromNode["ƒ_refs_length"] || 0,
        destNodeRefsLength = destNode["ƒ_refs_length"] || 0,
        i = -1;
    while (++i < fromNodeRefsLength) {
        var ref = fromNode["ƒ_ref" + i];
        if (ref !== void 0) {
            ref["ƒ_context"] = destNode;
            destNode["ƒ_ref" + (destNodeRefsLength + i)] = ref;
            fromNode["ƒ_ref" + i] = void 0;
        }
    }
    destNode["ƒ_refs_length"] = fromNodeRefsLength + destNodeRefsLength;
    fromNode["ƒ_refs_length"] = void 0;
    return destNode;
};


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

module.exports = function unlinkBackReferences(node) {
    var i = -1, n = node["ƒ_refs_length"] || 0;
    while (++i < n) {
        var ref = node["ƒ_ref" + i];
        if (ref != null) {
            ref["ƒ_context"] = ref["ƒ_ref_index"] = node["ƒ_ref" + i] = void 0;
        }
    }
    node["ƒ_refs_length"] = void 0;
    return node;
};


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

module.exports = function unlinkForwardReference(reference) {
    var destination = reference["ƒ_context"];
    if (destination) {
        var i = (reference["ƒ_ref_index"] || 0) - 1,
            n = (destination["ƒ_refs_length"] || 0) - 1;
        while (++i <= n) {
            destination["ƒ_ref" + i] = destination["ƒ_ref" + (i + 1)];
        }
        destination["ƒ_refs_length"] = n;
        reference["ƒ_ref_index"] = reference["ƒ_context"] = destination = void 0;
    }
    return reference;
};


/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

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
    if (reference && reference["ƒ_parent"] === undefined) {
        return false;
    }

    // The reference has expired but has not been collected from the graph.
    if (reference && reference["ƒ_invalidated"]) {
        return false;
    }

    return true;
}


/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

var CONTAINER_DOES_NOT_EXIST = 'e';
var $ref = __webpack_require__(0);
var FalcorJSON = __webpack_require__(5);
var getCachePosition = __webpack_require__(9);
var InvalidDerefInputError = __webpack_require__(80);

module.exports = function deref(boundJSONArg) {

    if (!boundJSONArg || typeof boundJSONArg !== 'object') {
        throw new InvalidDerefInputError();
    }

    var referenceContainer, currentRefPath, i, len;
    var jsonMetadata = boundJSONArg && boundJSONArg["ƒ_meta"];

    if (!jsonMetadata || typeof jsonMetadata !== 'object') {
        return this._clone({
            _node: undefined
        });
    }

    var recycleJSON = this._recycleJSON;
    var absolutePath = jsonMetadata["abs_path"];

    if (!absolutePath) {
        return this._clone({
            _node: undefined,
            _seed: recycleJSON && {
                json: boundJSONArg, __proto__: FalcorJSON.prototype
            } || undefined
        });
    } else if (absolutePath.length === 0) {
        return this._clone({
            _path: absolutePath,
            _node: this._root.cache,
            _referenceContainer: true,
            _seed: recycleJSON && {
                json: boundJSONArg, __proto__: FalcorJSON.prototype
            } || undefined
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
        _seed: recycleJSON && {
            json: boundJSONArg, __proto__: FalcorJSON.prototype
        } || undefined
    });
};


/***/ },
/* 79 */
/***/ function(module, exports) {

var NAME = 'BoundJSONGraphModelError';
var MESSAGE = 'It is not legal to use the JSON Graph ' +
    'format from a bound Model. JSON Graph format' +
    ' can only be used from a root model.';

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
/* 80 */
/***/ function(module, exports) {

var NAME = 'InvalidDerefInputError';
var MESSAGE = 'Deref can only be used with a non-primitive object from get, set, or call.';

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
/* 81 */
/***/ function(module, exports) {

var NAME = 'InvalidModelError';
var MESSAGE = 'The boundPath of the model is not valid since a value or error was found before the path end.';

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
/* 82 */
/***/ function(module, exports) {

var NAME = 'MaxRetryExceededError';
var MESSAGE = 'The allowed number of retries have been exceeded.';

/**
 * A request can only be retried up to a specified limit.  Once that
 * limit is exceeded, then an error will be thrown.
 *
 * @private
 */
function MaxRetryExceededError(maxRetryCount, absolute, relative, optimized) {
    var err = Error.call(this,
        'Exceeded the max retry count (' + maxRetryCount + ') for these paths: \n' +
        (absolute &&
        'absolute: [\n\t' + printPaths(absolute) + '\n]\n' || '') +
        (relative &&
        'relative: [\n\t' + printPaths(relative) + '\n]\n' || '') +
        (optimized &&
        'optimized: [\n\t' + printPaths(optimized) + '\n]\n' || '')
    );
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

function printPaths(paths) {
    return paths.map(function(path) {
        return JSON.stringify(path);
    }).join(',\n\t');
}


/***/ },
/* 83 */
/***/ function(module, exports) {

module.exports = String.fromCharCode(30) + 'ƒ_';


/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

var Source = __webpack_require__(49);
var Subscriber = __webpack_require__(12);
var lruCollect = __webpack_require__(47);
var FalcorJSON = __webpack_require__(5);
var collapse = __webpack_require__(100);
var InvalidSourceError = __webpack_require__(46);
var MaxRetryExceededError = __webpack_require__(82);

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
    source.operator = operator;
    source.type = this.type;
    source.model = this.model;
    source._args = this._args;
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
    get: __webpack_require__(61),
    set: __webpack_require__(73),
    call: __webpack_require__(60),
    invalidate: __webpack_require__(71)
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

    var seedIsImmutable = progressive && data && !model._recycleJSON;

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
            throw results.error;
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
        this.args = args;// || this.args;
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
            return Subscriber.prototype.onError.call(
                this,  errors.length && errors || error
            );
        }

        return Subscriber.prototype.onCompleted.call(this);
    }

    if (++this.retryCount >= this.maxRetryCount) {
        return Subscriber.prototype.onError.call(this, new MaxRetryExceededError(
            this.retryCount,
            this.requested,
            this.relative,
            this.missing
        ));
    }

    this.request = this.model._root.requests[this.type](
        this.model,
        this.missing,
        this.relative,
        this.fragments
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

function mergeInto(dest, node) {

    var destValue, nodeValue,
        key, keys = Object.keys(node),
        index = -1, length = keys.length;

    while (++index < length) {

        key = keys[index];

        if (key === "ƒ_meta") {
            dest["ƒ_meta"] = node["ƒ_meta"];
        } else {

            nodeValue = node[key];
            destValue = dest[key];

            if (destValue !== nodeValue) {
                if (destValue === undefined || 'object' !== typeof nodeValue) {
                    dest[key] = nodeValue;
                }
                else {
                    mergeInto(destValue, nodeValue);
                }
            }
        }
    }

    return dest;
}


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

var Source = __webpack_require__(49);
var Request = __webpack_require__(86);
var Subscriber = __webpack_require__(12);
var Subscription = __webpack_require__(13);
var ImmediateScheduler = __webpack_require__(50);

module.exports = Queue;

function Queue(modelRoot) {
    Subscription.call(this, []);
    this.modelRoot = modelRoot;
}

Queue.prototype = Object.create(Subscription.prototype);

Queue.prototype.set = isolateSet;
Queue.prototype.call = isolateCall;
Queue.prototype.get = batchAndDedupeGet;

function isolateSet(model, optimized, requested, env) {
    var queue = this;
    return new Source(function(destination) {

        var request = new Request('set', queue, model._source, new ImmediateScheduler())
            .batch(requested, optimized || env.paths, env.jsonGraph);

        var subscriber = request.subscribe(new Subscriber(destination, request));

        queue.add(request);

        request.connect();

        return subscriber;
    });
}

function isolateCall(model, optimized, requested, env) {
    var queue = this;
    return new Source(function(destination) {

        var request = new Request('call', queue, model._source, new ImmediateScheduler())
            .batch(null, null, env);

        var subscriber = request.subscribe(new Subscriber(destination, request));

        queue.add(request);

        request.connect();

        return subscriber;
    });
}

function batchAndDedupeGet(model, optimized, requested) {
    return new Dedupe(
        this, model._source, model._scheduler, requested, optimized
    );
}

function Dedupe(queue, source, scheduler, requested, optimized) {
    this.queue = queue;
    this.dataSource = source;
    this.scheduler = scheduler;
    this.requested = requested;
    this.optimized = optimized;
}

Dedupe.prototype.subscribe = function(destination) {

    var queue = this.queue;
    var source = this.dataSource;
    var requested = this.requested;
    var optimized = this.optimized;
    var scheduler = this.scheduler;

    var requestsIndex = -1;
    var requests  = queue.subscriptions;
    var requestsCount = requests.length;
    var subscription = new Subscription([], destination);

    while (++requestsIndex < requestsCount) {

        var request = requests[requestsIndex];

        if (request.type !== 'get') {
            continue;
        }

        if (request = request.batch(requested, optimized, requested = [], optimized = [])) {
            subscription.add(request.subscribe(new Subscriber(destination, request)));
        }

        if (!optimized.length) {
            break;
        }
    }

    if (optimized.length) {
        request = requests[requestsIndex] =
            new Request('get', queue, source, scheduler).batch(requested, optimized);
        subscription.add(request.subscribe(new Subscriber(destination, request)));
        request.connect();
    }

    return subscription;
}


/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

var Subject = __webpack_require__(87);
var $error = __webpack_require__(14);
var Subscriber = __webpack_require__(12);
var Subscription = __webpack_require__(13);
var InvalidSourceError = __webpack_require__(46);

var setJSONGraphs = __webpack_require__(16);
var setPathValues = __webpack_require__(28);
var invalidatePaths = __webpack_require__(25);

var toPaths = __webpack_require__(108);
var toCollapseMap = __webpack_require__(105);
var toCollapseTrees = __webpack_require__(106);
var hasIntersection = __webpack_require__(104);

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
    this.data = requestedComplements;
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
    var total = optimized.length;

    while (++index < total) {
        var path = optimized[index];
        var pathLen = path.length;
        var subTree = tree[pathLen];
        if (subTree && hasIntersection(subTree, path, 0, pathLen)) {
            optimizedIntersection[++intersectionIndex] = path;
            requestedIntersection[intersectionIndex] = requested[index];
        } else {
            optimizedComplements[++complementIndex] = path;
            requestedComplements[complementIndex] = requested[index];
        }
    }

    return ~intersectionIndex;
}


/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

var Subscriber = __webpack_require__(12);
var Subscription = __webpack_require__(13);

module.exports = Subject;

function Subject(observers, parent) {
    Subscriber.call(this, null, parent);
    this.observers = observers || [];
}

Subject.prototype = Object.create(Subscriber.prototype);

// Unused
// Subject.prototype.onNext = function(value) {
//     this.observers.slice(0).forEach(function(observer) {
//         observer.onNext(value);
//     });
// }

Subject.prototype.onError = function(error) {
    var observers = this.observers.slice(0);
    this.dispose();
    observers.forEach(function(observer) {
        observer.onError(error);
    });
}

Subject.prototype.onCompleted = function() {
    var observers = this.observers.slice(0);
    this.dispose();
    observers.forEach(function(observer) {
        observer.onCompleted();
    });
}

Subject.prototype.subscribe = function(subscriber) {
    this.observers.push(subscriber);
    this.subscriptions.push(subscriber = new Subscription([subscriber], this));
    return subscriber;
}

Subject.prototype.dispose =
Subject.prototype.unsubscribe = function () {
    this.observers = [];
}


/***/ },
/* 88 */
/***/ function(module, exports) {

function TimeoutScheduler(delay) {
    this.delay = delay;
}

var TimerDisposable = function TimerDisposable(id) {
    this.id = id;
    this.disposed = false;
};

TimeoutScheduler.prototype.schedule = function schedule(action) {
    return new TimerDisposable(setTimeout(action, this.delay));
};

TimerDisposable.prototype.dispose =
TimerDisposable.prototype.unsubscribe = function() {
    if (!this.disposed) {
        clearTimeout(this.id);
        this.id = null;
        this.disposed = true;
    }
};

module.exports = TimeoutScheduler;


/***/ },
/* 89 */
/***/ function(module, exports) {

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
/* 90 */
/***/ function(module, exports, __webpack_require__) {

var isArray = Array.isArray;
var isInternal = __webpack_require__(30);

module.exports = clone;

function clone(source) {
    var dest = source;
    if (!(!dest || typeof dest !== 'object')) {
        dest = isArray(source) ? [] : {};
        for (var key in source) {
            if (isInternal(key)) {
                continue;
            }
            dest[key] = source[key];
        }
    }
    return dest;
}


/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(2);
module.exports = function getSize(node) {
    return isObject(node) && node.$expires || undefined;
};


/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(2);

module.exports = function getType(node, anyType) {
    var type = isObject(node) && node.$type || void 0;
    if (anyType && type) {
        return 'branch';
    }
    return type;
};


/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(2);
var hasOwn = Object.prototype.hasOwnProperty;

module.exports = function(obj, prop) {
  return isObject(obj) && hasOwn.call(obj, prop);
};


/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

var isArray = Array.isArray;
var isObject = __webpack_require__(2);

module.exports = function isPathValue(pathValue) {
    return isObject(pathValue) && (
        isArray(pathValue.path) || (
            typeof pathValue.path === 'string'
        ));
};


/***/ },
/* 95 */
/***/ function(module, exports) {

module.exports = 'atom';


/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(97);


/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global, module) {'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ponyfill = __webpack_require__(98);

var _ponyfill2 = _interopRequireDefault(_ponyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var root; /* global window */


if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (true) {
  root = module;
} else {
  root = Function('return this')();
}

var result = (0, _ponyfill2['default'])(root);
exports['default'] = result;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(32), __webpack_require__(99)(module)))

/***/ },
/* 98 */
/***/ function(module, exports) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports['default'] = symbolObservablePonyfill;
function symbolObservablePonyfill(root) {
	var result;
	var _Symbol = root.Symbol;

	if (typeof _Symbol === 'function') {
		if (_Symbol.observable) {
			result = _Symbol.observable;
		} else {
			result = _Symbol('observable');
			_Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
};

/***/ },
/* 99 */
/***/ function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			configurable: false,
			get: function() { return module.l; }
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			configurable: false,
			get: function() { return module.i; }
		});
		module.webpackPolyfill = 1;
	}
	return module;
}


/***/ },
/* 100 */
/***/ function(module, exports) {

module.exports = require("@graphistry/falcor-path-utils/lib/collapse");

/***/ },
/* 101 */
/***/ function(module, exports) {

module.exports = require("@graphistry/falcor-path-utils/lib/computeFlatBufferHash");

/***/ },
/* 102 */
/***/ function(module, exports) {

module.exports = require("@graphistry/falcor-path-utils/lib/flatBufferToPaths");

/***/ },
/* 103 */
/***/ function(module, exports) {

module.exports = require("@graphistry/falcor-path-utils/lib/getHashCode");

/***/ },
/* 104 */
/***/ function(module, exports) {

module.exports = require("@graphistry/falcor-path-utils/lib/hasIntersection");

/***/ },
/* 105 */
/***/ function(module, exports) {

module.exports = require("@graphistry/falcor-path-utils/lib/toCollapseMap");

/***/ },
/* 106 */
/***/ function(module, exports) {

module.exports = require("@graphistry/falcor-path-utils/lib/toCollapseTrees");

/***/ },
/* 107 */
/***/ function(module, exports) {

module.exports = require("@graphistry/falcor-path-utils/lib/toFlatBuffer");

/***/ },
/* 108 */
/***/ function(module, exports) {

module.exports = require("@graphistry/falcor-path-utils/lib/toPaths");

/***/ },
/* 109 */
/***/ function(module, exports) {

module.exports = require("@graphistry/falcor-path-utils/lib/toTree");

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(56);


/***/ }
/******/ ]);
//# sourceMappingURL=falcor.node.js.map