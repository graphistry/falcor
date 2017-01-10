var arr = new Array(2);
var isExpired = require('../isExpired');
var expireNode = require('../expireNode');
var lruPromote = require('../../lru/promote');
var getSize = require('../../support/getSize');
var createHardlink = require('../createHardlink');
var getBoundCacheNode = require('../getBoundCacheNode');
var isInternalKey = require('../../support/isInternalKey');
var updateNodeAncestors = require('../updateNodeAncestors');

/**
 * Sets a list of PathMaps into a JSON Graph.
 * @function
 * @param {Object} model - the Model for which to insert the PathMaps.
 * @param {Array.<PathMapEnvelope>} pathMapEnvelopes - the a list of @PathMapEnvelopes to set.
 */

module.exports = invalidatePathMaps;

function invalidatePathMaps(model, pathMapEnvelopes, expireImmediate) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = modelRoot.version + 1;
    var comparator = modelRoot._comparator;
    var cache = modelRoot.cache;
    var node = getBoundCacheNode(model);

    if (!node) {
        return false;
    }

    var pathMapIndex = -1;
    var parent = node[f_parent] || cache;
    var pathMapCount = pathMapEnvelopes.length;

    while (++pathMapIndex < pathMapCount) {

        var pathMapEnvelope = pathMapEnvelopes[pathMapIndex];

        invalidatePathMap(
            pathMapEnvelope.json, 0, cache, parent, node,
            version, expired, lru, comparator, expireImmediate
        );
    }

    arr[0] = undefined;
    arr[1] = undefined;

    if (cache[f_version] === version) {
        modelRoot.version = version;
        return true;
    }

    return false;
}

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
            arr = invalidateNode(
                root, parent, node,
                key, child, branch, false, version, expired,
                lru, comparator, expireImmediate
            );
            var nextNode = arr[0];
            var nextParent = arr[1];
            if (nextNode) {
                if (branch) {
                    invalidatePathMap(
                        child, depth + 1,
                        root, nextParent, nextNode,
                        version, expired, lru, comparator, expireImmediate
                    );
                } else {
                    updateNodeAncestors(nextNode, getSize(nextNode), lru, version);
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
                key, value, branch, true, version,
                expired, lru, comparator, expireImmediate
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
    key, value, branch, reference, version,
    expired, lru, comparator, expireImmediate) {

    var type = node.$type;

    while (type === $ref) {

        arr = invalidateReference(
            value, root, node, version, expired,
            lru, comparator, expireImmediate
        );

        node = arr[0];

        if (!node && typeof node !== 'object') {
            return arr;
        }

        parent = arr[1];
        type = node.$type;
    }

    if (type === undefined) {
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
    }

    arr[0] = node;
    arr[1] = parent;

    return arr;
}
