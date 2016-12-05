var $now = require('../values/expires-now');
var getType = require('../support/getType');
var getSize = require('../support/getSize');
var getTimestamp = require('../support/getTimestamp');

var wrapNode = require('./wrapNode');
var isExpired = require('./isExpired');
var expireNode = require('./expireNode');
var insertNode = require('./insertNode');
var replaceNode = require('./replaceNode');
var reconstructPath = require('./reconstructPath');
var updateNodeAncestors = require('./updateNodeAncestors');
var removeNodeAndDescendants = require('./removeNodeAndDescendants');

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
        var isDistinct = true;
        var mType = getType(message);

        // Compare the current cache value with the new value. If either of
        // them don't have a timestamp, or the message's timestamp is newer,
        // replace the cache value with the message value. If a comparator
        // is specified, the comparator takes precedence over timestamps.
        if (comparator) {
            isDistinct = !comparator(
                node, message, optimizedPath.slice(0, optimizedPath.index)
            );
        } else if (!mType) {
            isDistinct = !node || node.value !== message;
        } else {
            isDistinct = !type || ((
                // Comparing either Number or undefined to undefined always results in false.
                getTimestamp(message) < getTimestamp(node)) === false) || !(
                // They're the same if the following fields are the same.
                type !== mType ||
                node.value !== message.value ||
                node.$expires !== message.$expires);
        }

        if (isDistinct) {

            if (errorSelector && mType === $error) {
                message = errorSelector(reconstructPath(requestedPath, key), message);
            }

            var sizeOffset = getSize(node) - getSize(message =
                wrapNode(message, mType, mType ? message.value : message));

            node = replaceNode(node, message, parent, key, lru, version);
            parent = updateNodeAncestors(parent, sizeOffset, lru, version);
            node = insertNode(node, parent, key, version, optimizedPath);
        }
    }

    return node;
};
