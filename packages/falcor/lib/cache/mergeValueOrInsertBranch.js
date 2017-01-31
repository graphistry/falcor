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

module.exports = mergeValueOrInsertBranch;

function mergeValueOrInsertBranch(
    parentArg, nodeArg, key, value,
    branch, reference, requestedPath, optimizedPath, version,
    expired, lru, comparator, errorSelector, expireImmediate) {

    var node = nodeArg;
    var parent = parentArg;
    var cType = getType(node, reference);

    if (branch || reference) {
        if (cType && isExpired(node,
            /* expireImmediate:
             * force true so the node is marked as
             * expired but keep using it for the merge if it expires immediately
             */
            true)) {
            expireNode(node, expired, lru);
            cType = node.$expires === $now ? cType : 'expired';
        }
        if ((cType && cType !== $ref) || (!node || typeof node !== 'object')) {
            node = replaceNode(node, {}, parent, key, lru, version);
            node = insertNode(node, parent, key, version, optimizedPath);
        }
    } else {
        var message = value;
        var isDistinct = true;
        var mType = getType(message);

        // If both the cache and message are primitives,
        // insert the message into the cache.
        if (!cType && !mType) {
            isDistinct = true;
        }
        // Compare the current cache value with the new value. If either of
        // them don't have a timestamp, or the message's timestamp is newer,
        // replace the cache value with the message value. If a comparator
        // is specified, the comparator takes precedence over timestamps.
        else if (comparator) {
            isDistinct = !(comparator.length < 3 ?
                comparator(node, message) : comparator(node, message,
                    optimizedPath.slice(0, optimizedPath.index))
            );
        } else {
            // Comparing either Number or undefined to undefined always results in false.
            isDistinct = getTimestamp(message) < getTimestamp(node) === false;
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
