var arr = new Array(3);
var isArray = Array.isArray;
var isExpired = require('../isExpired');
var expireNode = require('../expireNode');
var createHardlink = require('../createHardlink');
var getCachePosition = require('../getCachePosition');
var isInternalKey = require('../../support/isInternalKey');
var NullInPathError = require('../../errors/NullInPathError');
var mergeValueOrInsertBranch = require('../mergeValueOrInsertBranch');

/**
 * Sets a list of {@link PathMapEnvelope}s into a {@link JSONGraph}.
 * @function
 * @param {Object} model - the Model for which to insert the PathMaps.
 * @param {Array.<PathMapEnvelope>} pathMapEnvelopes - the a list of {@link PathMapEnvelope}s to set.
 * @return {Array.<Array.<Path>>} - an Array of Arrays where each inner Array is a list of requested and optimized paths (respectively) for the successfully set values.
 */

module.exports = setPathMaps;

function setPathMaps(model, pathMapEnvelopes, errorSelector, comparator, expireImmediate) {

    var modelRoot = model._root;
    var expired = modelRoot.expired;
    var version = modelRoot.version + 1;
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = getCachePosition(cache, bound);

    if (!node) {
        return [[], [], false];
    }

    var parent = node[f_parent] || cache;

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
            version, expired, modelRoot, comparator, errorSelector, expireImmediate
        );
    }

    arr[0] = undefined;
    arr[1] = undefined;
    arr[2] = undefined;

    if (cache[f_version] === version) {
        modelRoot.version = version;
        return [requestedPaths, optimizedPaths, true];
    }

    return [requestedPaths, optimizedPaths, false];
}

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

            setNode(
                root, parent, node, key, child,
                branch, false, requestedPath, optimizedPath, version,
                expired, lru, comparator, errorSelector, expireImmediate
            );

            requestedPath[depth] = key;
            requestedPath.index = depth;

            var nextNode = arr[0];
            var nextParent = arr[1];
            var nextOptimizedPath = arr[2];
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
    value, root, nodeArg, requestedPath, optimizedPathArg, version,
    expired, lru, comparator, errorSelector, expireImmediate) {

    var parent;
    var node = nodeArg;
    var reference = node.value;
    var optimizedPath = reference.slice(0);

    if (isExpired(node, expireImmediate)) {
        expireNode(node, expired, lru);
        node = undefined;
        parent = root;
        optimizedPath.index = reference.length;
    } else {
        var container = node;
        parent = root;

        node = node[f_context];

        if (node != null) {
            parent = node[f_parent] || root;
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
                node = arr[0];
                optimizedPath = arr[2];
                if (!node || typeof node !== 'object') {
                    optimizedPath.index = index;
                    return;
                }
                parent = arr[1];
            } while (index++ < count);

            optimizedPath.index = index;

            if (container[f_context] !== node) {
                createHardlink(container, node);
            }
        }
    }

    arr[0] = node;
    arr[1] = parent;
    arr[2] = optimizedPath;
}

function setNode(
    root, parentArg, nodeArg, key, value,
    branch, reference, requestedPath, optimizedPathArg, version,
    expired, lru, comparator, errorSelector, expireImmediate) {

    var node = nodeArg;
    var type = node.$type;
    var parent = parentArg;
    var optimizedPath = optimizedPathArg;

    while (type === $ref) {

        setReference(
            value, root, node, requestedPath, optimizedPath, version,
            expired, lru, comparator, errorSelector, expireImmediate);

        node = arr[0];

        if (!node || typeof node !== 'object') {
            return;
        }

        parent = arr[1];
        optimizedPath = arr[2];
        type = node && node.$type;
    }

    if (!branch || type === undefined) {
        if (key == null) {
            if (branch) {
                throw new NullInPathError();
            } else if (node) {
                key = node[f_key];
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

    return undefined;
}
