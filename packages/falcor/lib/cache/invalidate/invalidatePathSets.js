var arr = new Array(2);
var $ref = require("../../types/ref");

var getBoundCacheNode = require("../getBoundCacheNode");

var isExpired = require("../isExpired");
var expireNode = require("../expireNode");
var lruPromote = require("../../lru/promote");
var getSize = require("../../support/getSize");
var createHardlink = require("../createHardlink");
var iterateKeySet = require("@graphistry/falcor-path-utils").iterateKeySet;
var updateNodeAncestors = require("../updateNodeAncestors");
var removeNodeAndDescendants = require("../removeNodeAndDescendants");

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
    var parent = node[ƒ_parent] || cache;
    var initialVersion = cache[ƒ_version];

    var pathIndex = -1;
    var pathCount = paths.length;

    while (++pathIndex < pathCount) {

        var path = paths[pathIndex];

        invalidatePathSet(
            path, 0, cache, parent, node,
            version, expired, lru
        );
    }

    arr[0] = undefined;
    arr[1] = undefined;

    var newVersion = cache[ƒ_version];
    var rootChangeHandler = modelRoot.onChange;

    if (rootChangeHandler && initialVersion !== newVersion) {
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
        arr = invalidateNode(
            root, parent, node,
            key, branch, false,
            version, expired, lru
        );
        var nextNode = arr[0];
        var nextParent = arr[1];
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
        arr[0] = undefined;
        arr[1] = root;
        return arr;
    }

    lruPromote(lru, node);

    var container = node;
    var reference = node.value;
    var parent = root;

    node = node[ƒ_context];

    if (node != null) {
        parent = node[ƒ_parent] || root;
    } else {

        var index = 0;
        var count = reference.length - 1;

        parent = node = root;

        do {
            var key = reference[index];
            var branch = index < count;
            arr = invalidateNode(
                root, parent, node,
                key, branch, true,
                version, expired, lru
            );
            node = arr[0];
            if (!node && typeof node !== 'object') {
                return arr;
            }
            parent = arr[1];
        } while (index++ < count);

        if (container[ƒ_context] !== node) {
            createHardlink(container, node);
        }
    }

    arr[0] = node;
    arr[1] = parent;

    return arr;
}

function invalidateNode(
    root, parent, node,
    key, branch, reference,
    version, expired, lru) {

    var type = node.$type;

    while (type === $ref) {

        arr = invalidateReference(root, node, version, expired, lru);

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
            throw new Error("`null` is not allowed in branch key positions.");
        } else if (node) {
            key = node[ƒ_key];
        }
    } else {
        parent = node;
        node = parent[key];
    }

    arr[0] = node;
    arr[1] = parent;

    return arr;
}
