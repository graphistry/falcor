var $ref = require("../types/ref");
var $error = require("../types/error");
var getType = require("../support/getType");
var getSize = require("../support/getSize");
var getTimestamp = require("../support/getTimestamp");

var wrapNode = require("./wrapNode");
var isExpired = require("./isExpired");
var expireNode = require("./expireNode");
var insertNode = require("./insertNode");
var replaceNode = require("./replaceNode");
var reconstructPath = require("./reconstructPath");
var updateNodeAncestors = require("./updateNodeAncestors");

module.exports = function mergeValueOrInsertBranch(
    parent, node, key, value,
    branch, reference, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector) {

    var type = getType(node, reference);

    if (branch || reference) {
        if (type && isExpired(node)) {
            type = "expired";
            expireNode(node, expired, lru);
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
