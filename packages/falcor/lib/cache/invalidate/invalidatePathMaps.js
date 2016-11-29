var $ref = require('../../types/ref');
var isExpired = require('../isExpired');
var expireNode = require('../expireNode');
var lruPromote = require('../../lru/promote');
var getSize = require('../../support/getSize');
var createHardlink = require('../createHardlink');
var getBoundCacheNode = require('../getBoundCacheNode');
var isInternalKey = require('../../support/isInternalKey');
var updateNodeAncestors = require('../updateNodeAncestors');
var removeNodeAndDescendants = require('../removeNodeAndDescendants');

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
    var parent = node[f_parent] || cache;
    var initialVersion = cache[f_version];

    var pathMapIndex = -1;
    var pathMapCount = pathMapEnvelopes.length;

    while (++pathMapIndex < pathMapCount) {

        var pathMapEnvelope = pathMapEnvelopes[pathMapIndex];

        invalidatePathMap(
            pathMapEnvelope.json, 0, cache, parent, node,
            version, expired, lru, comparator, expireImmediate
        );
    }

    var newVersion = cache[f_version];
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

        if (container[f_context] !== node) {
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
            key = node[f_key];
        }
    } else {
        parent = node;
        node = parent[key];
    }

    return [node, parent];
}
