var arr = new Array(3);
var $ref = require("../../types/ref");
var isExpired = require("../isExpired");
var expireNode = require("../expireNode");
var createHardlink = require("../createHardlink");
var getCachePosition = require("../getCachePosition");
var NullInPathError = require("../../errors/NullInPathError");
var iterateKeySet = require("@graphistry/falcor-path-utils").iterateKeySet;
var mergeValueOrInsertBranch = require("../mergeValueOrInsertBranch");

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
    var parent = node[ƒ_parent] || cache;
    var initialVersion = cache[ƒ_version];

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

    var newVersion = cache[ƒ_version];
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

        node = node[ƒ_context];

        if (node != null) {
            parent = node[ƒ_parent] || root;
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
                if (!node || typeof node !== 'object') {
                    optimizedPath.index = index;
                    return results;
                }
                parent = results[1];
            } while (index++ < count);

            optimizedPath.index = index;

            if (container[ƒ_context] !== node) {
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
                key = node[ƒ_key];
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
