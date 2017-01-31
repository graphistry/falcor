var wrapNode = require('./wrapNode');
var isExpired = require('./isExpired');
var insertNode = require('./insertNode');
var expireNode = require('./expireNode');
var replaceNode = require('./replaceNode');
var getSize = require('../support/getSize');
var reconstructPath = require('./reconstructPath');
var getTimestamp = require('../support/getTimestamp');
var updateNodeAncestors = require('./updateNodeAncestors');

module.exports = mergeJSONGraphNode;

function mergeJSONGraphNode(
    parentArg, nodeArg, messageArg, key, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, expireImmediate) {

    var sizeOffset;
    var node = nodeArg;
    var parent = parentArg;
    var message = messageArg;

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

        // The message and cache are both undefined, return undefined.
        if (message === undefined) {
            return message;
        }
        // There should not be undefined values. Those should always be
        // wrapped in an $atom
        else if (message === null) {
            node = wrapNode(message, undefined, message);
            parent = updateNodeAncestors(parent, -node.$size, lru, version);
            node = insertNode(node, parent, key, undefined, optimizedPath);
            return node;
        }
        // Is the cache node a branch? If so, return the cache branch.
        else if ((
            cIsObject = !(!node || typeof node !== 'object')) && (
            cType = node.$type) === undefined) {
            // Has the branch been introduced to the cache yet? If not,
            // give it a parent, key, and absolute path.
            if (node[f_parent] === undefined) {
                insertNode(node, parent, key, version, optimizedPath);
            }
            return node;
        }
    } else if (cIsObject = !(!node || typeof node !== 'object')) {
        cType = node.$type;
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
        // If the cache is a reference, but the message is empty,
        // leave the cache alone...
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
                    if (node[f_parent] != null) {
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

    // If the cache is a leaf but the message is a branch,
    // merge the branch over the leaf.
    if (cType && mIsObject && !mType) {
        return insertNode(replaceNode(
                node, message, parent, key, lru, version),
            parent, key, undefined, optimizedPath
        );
    }
    // If the message is a sentinel or primitive, insert it into the cache.
    else if (mType || !mIsObject) {

        if (mType === $error && errorSelector) {
            message = errorSelector(reconstructPath(requestedPath, key), message);
        }

        // If the cache and the message are the same value, we branch-merged one
        // of the message's ancestors. If this is the first time we've seen this
        // leaf, give the message a $size and $type, attach its graph pointers,
        // and update the cache sizes and versions.
        if (mType && node === message) {
            if (!node[f_parent]) {
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
            // If both the cache and message are primitives, we branch-merged
            // one of the message's ancestors. Insert the value into the cache.
            if (!cType && !mType) {
                isDistinct = true;
            }
            // If the cache is a branch, but the message is a leaf, replace the
            // cache branch with the message leaf.
            else if (!cIsObject || !isExpired(node, expireImmediate)) {
                // Compare the current cache value with the new value. If either of
                // them don't have a timestamp, or the message's timestamp is newer,
                // replace the cache value with the message value. If a comparator
                // is specified, the comparator takes precedence over timestamps.
                if (comparator) {
                    isDistinct = !(comparator.length < 3 ?
                        comparator(node, message) : comparator(node, message,
                            optimizedPath.slice(0, optimizedPath.index))
                    );
                } else {
                    // Comparing either Number or undefined to undefined always results in false.
                    isDistinct = getTimestamp(message) < getTimestamp(node) === false;
                }
            }
            if (isDistinct) {
                sizeOffset = getSize(node) - getSize(message =
                    wrapNode(message, mType, mType ? message.value : message));
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
