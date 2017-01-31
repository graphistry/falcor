var arr = new Array(5);
var isExpired = require('../isExpired');
var expireNode = require('../expireNode');
var createHardlink = require('../createHardlink');
var mergeJSONGraphNode = require('../mergeJSONGraphNode');
var NullInPathError = require('../../errors/NullInPathError');
var iterateKeySet = require('@graphistry/falcor-path-utils/lib/iterateKeySet');

/**
 * Merges a list of {@link JSONGraphEnvelope}s into a {@link JSONGraph}.
 * @function
 * @param {Object} model - the Model for which to merge the {@link JSONGraphEnvelope}s.
 * @param {Array.<PathValue>} jsonGraphEnvelopes - the {@link JSONGraphEnvelope}s to merge.
 * @return {Array.<Array.<Path>>} - an Array of Arrays where each inner Array is a list of requested and optimized paths (respectively) for the successfully set values.
 */

module.exports = setJSONGraphs;

function setJSONGraphs(model, jsonGraphEnvelopes, errorSelector, comparator, expireImmediate) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = modelRoot.version + 1;
    var cache = modelRoot.cache;

    var requestedPath = [];
    var optimizedPath = [];
    var requestedPaths = [];
    var optimizedPaths = [];
    var jsonGraphEnvelopeIndex = -1;
    var jsonGraphEnvelopeCount = jsonGraphEnvelopes.length;

    while (++jsonGraphEnvelopeIndex < jsonGraphEnvelopeCount) {

        var jsonGraphEnvelope = jsonGraphEnvelopes[jsonGraphEnvelopeIndex];
        var paths = jsonGraphEnvelope.paths;
        var jsonGraph = jsonGraphEnvelope.jsonGraph;

        var pathIndex = -1;
        var pathCount = paths.length;

        while (++pathIndex < pathCount) {

            var path = paths[pathIndex];
            optimizedPath.index = 0;

            setJSONGraphPathSet(
                path, 0,
                cache, cache, cache,
                jsonGraph, jsonGraph, jsonGraph,
                requestedPaths, optimizedPaths, requestedPath, optimizedPath,
                version, expired, lru, comparator, errorSelector, expireImmediate
            );
        }
    }

    arr[0] = undefined;
    arr[1] = undefined;
    arr[2] = undefined;
    arr[3] = undefined;
    arr[4] = undefined;

    if (cache[f_version] === version) {
        modelRoot.version = version;
        return [requestedPaths, optimizedPaths, true];
    }

    return [requestedPaths, optimizedPaths, false];
}

/* eslint-disable no-constant-condition */
function setJSONGraphPathSet(
    path, depth, root, parent, node,
    messageRoot, messageParent, message,
    requestedPaths, optimizedPaths, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, expireImmediate) {

    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet(keySet, note);
    var optimizedIndex = optimizedPath.index;

    do {

        requestedPath.depth = depth;

        setNode(
            root, parent, node, messageRoot, messageParent, message,
            key, branch, false, requestedPath, optimizedPath, version,
            expired, lru, comparator, errorSelector, expireImmediate
        );

        requestedPath[depth] = key;
        requestedPath.index = depth;

        var nextNode = arr[0];
        var nextParent = arr[1];
        var nextOptimizedPath = arr[4];
        nextOptimizedPath[nextOptimizedPath.index++] = key;

        if (nextNode) {
            if (branch) {
                setJSONGraphPathSet(
                    path, depth + 1, root, nextParent, nextNode,
                    messageRoot, arr[3], arr[2],
                    requestedPaths, optimizedPaths, requestedPath, nextOptimizedPath,
                    version, expired, lru, comparator, errorSelector, expireImmediate
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
    root, nodeArg, messageRoot, message, requestedPath, optimizedPathArg,
    version, expired, lru, comparator, errorSelector, expireImmediate) {

    var parent;
    var messageParent;
    var node = nodeArg;
    var reference = node.value;
    var optimizedPath = reference.slice(0);

    if (isExpired(node, expireImmediate)) {
        expireNode(node, expired, lru);
        node = undefined;
        parent = root;
        messageParent = messageRoot;
        optimizedPath.index = reference.length;
    } else {

        var index = 0;
        var container = node;
        var count = reference.length - 1;
        parent = node = root;
        messageParent = message = messageRoot;

        do {
            var key = reference[index];
            var branch = index < count;
            optimizedPath.index = index;

            setNode(
                root, parent, node, messageRoot, messageParent, message,
                key, branch, true, requestedPath, optimizedPath, version,
                expired, lru, comparator, errorSelector, expireImmediate
            );
            node = arr[0];
            optimizedPath = arr[4];
            if (!node || typeof node !== 'object') {
                optimizedPath.index = index;
                return;
            }
            parent = arr[1];
            message = arr[2];
            messageParent = arr[3];
        } while (index++ < count);

        optimizedPath.index = index;

        if (container[f_context] !== node) {
            createHardlink(container, node);
        }
    }

    arr[0] = node;
    arr[1] = parent;
    arr[2] = message;
    arr[3] = messageParent;
    arr[4] = optimizedPath;
}

function setNode(
    root, parentArg, nodeArg, messageRoot, messageParentArg, messageArg,
    key, branch, reference, requestedPath, optimizedPathArg, version,
    expired, lru, comparator, errorSelector, expireImmediate) {

    var node = nodeArg;
    var type = node.$type;
    var parent = parentArg;
    var message = messageArg;
    var optimizedPath = optimizedPathArg;
    var messageParent = messageParentArg;

    while (type === $ref) {

        setReference(
            root, node, messageRoot, message, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector, expireImmediate
        );

        node = arr[0];

        if (!node || typeof node !== 'object') {
            return;
        }

        parent = arr[1];
        message = arr[2];
        messageParent = arr[3];
        optimizedPath = arr[4];
        type = node.$type;
    }

    if (type === undefined) {
        if (key == null) {
            if (branch) {
                throw new NullInPathError();
            } else if (node) {
                key = node[f_key];
            }
        } else {
            parent = node;
            messageParent = message;
            node = parent[key];
            message = messageParent && messageParent[key];
        }

        node = mergeJSONGraphNode(
            parent, node, message, key, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector, expireImmediate
        );
    }

    arr[0] = node;
    arr[1] = parent;
    arr[2] = message;
    arr[3] = messageParent;
    arr[4] = optimizedPath;
}
