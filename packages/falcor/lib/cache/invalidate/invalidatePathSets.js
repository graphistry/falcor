var arr = new Array(2);
var isExpired = require('../isExpired');
var expireNode = require('../expireNode');
var lruPromote = require('../../lru/promote');
var getSize = require('../../support/getSize');
var createHardlink = require('../createHardlink');
var getBoundCacheNode = require('../getBoundCacheNode');
var updateNodeAncestors = require('../updateNodeAncestors');
var removeNodeAndDescendants = require('../removeNodeAndDescendants');
var iterateKeySet = require('@graphistry/falcor-path-utils/lib/iterateKeySet');

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

    if (!node) {
        return;
    }

    var parent = node[f_parent] || cache;
    var initialVersion = cache[f_version];

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

    var newVersion = cache[f_version];
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

    node = node[f_context];

    if (node != null) {
        parent = node[f_parent] || root;
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

        if (container[f_context] !== node) {
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
            key = node[f_key];
        }
    } else {
        parent = node;
        node = parent[key];
    }

    arr[0] = node;
    arr[1] = parent;

    return arr;
}
