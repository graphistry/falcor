var iterateKeySet = require('@graphistry/falcor-path-utils').iterateKeySet;
var types = require('./../support/types');
var $ref = types.$ref;
var clone = require('./../support/clone');
var cloneArray = require('./../support/cloneArray');
var catAndSlice = require('./../support/catAndSlice');

/**
 * merges jsong into a seed
 */
module.exports = function jsongMerge(cache, jsongEnv) {

    var values = [];
    var references = [];
    var paths = jsongEnv.paths;
    var jsonGraph = jsongEnv.jsonGraph;
    var invalidations = jsongEnv.invalidated;

    paths.forEach(function(p) {
        merge({
            cacheRoot: cache,
            messageRoot: jsonGraph,
            references: references,
            values: values,
            requestedPath: [],
            requestIdx: -1,
            ignoreCount: 0
        },  cache, jsonGraph, 0, p);
    });

    return {
        values: values,
        references: references,
        invalidations: invalidations
    };
};

function merge(config, cache, message, depth, path, fromParent, fromKey) {
    var cacheRoot = config.cacheRoot;
    var messageRoot = config.messageRoot;
    var requestedPath = config.requestedPath;
    var ignoreCount = config.ignoreCount;
    var typeOfMessage = typeof message;
    var messageType = message && message.$type;

    // The message at this point should always be defined.
    // Reached the end of the JSONG message path
    if (message === null || typeOfMessage !== 'object' || messageType) {
        fromParent[fromKey] = clone(message);

        // NOTE: If we have found a reference at our cloning position
        // and we have resolved our path then add the reference to
        // the unfulfilledRefernces.
        if (messageType === $ref) {
            var references = config.references;
            references.push({
                path: cloneArray(requestedPath),
                value: message.value
            });
        }

        // We are dealing with a value.  We need this for call
        // Call needs to report all of its values into the jsongCache
        // and paths.
        else {
            var values = config.values;
            values.push({
                path: cloneArray(requestedPath),
                value: messageType ? message.value : message
            });
        }

        return;
    }

    var requestIdx = config.requestIdx;
    var updateRequestedPath = ignoreCount <= depth;

    if (updateRequestedPath) {
        requestIdx = ++config.requestIdx;
    }

    var outerKey = path[depth];
    var iteratorNote = {};
    var isBranchKey = depth < path.length - 1;
    var key = iterateKeySet(outerKey, iteratorNote);

    // We always attempt this as a loop.  If the memo exists then
    // we assume that the permutation is needed.
    do {

        // If the cache exists and we are not at our height, then
        // just follow cache, else attempt to follow message.
        var cacheRes = cache[key];
        var messageRes = message[key];

        var nextPath = path;
        var nextDepth = depth + 1;
        if (updateRequestedPath) {
            requestedPath[requestIdx] = key;
        }

        // We do not continue with this branch since the cache
        if (cacheRes === undefined) {
            cacheRes = cache[key] = {};
        }

        var nextIgnoreCount = ignoreCount;

        // TODO: Potential performance gain since we know that
        // references are always pathSets of 1, they can be evaluated
        // iteratively.

        messageType = messageRes && messageRes.$type;
        // There is only a need to consider message references since the
        // merge is only for the path that is provided.
        if (isBranchKey && messageType === $ref) {

            nextDepth = 0;
            nextPath = catAndSlice(messageRes.value, path, depth + 1);
            cache[key] = clone(messageRes);

            // Reset position in message and cache.
            nextIgnoreCount = messageRes.value.length;
            messageRes = messageRoot;
            cacheRes = cacheRoot;
        }

        // move forward down the path progression.
        config.ignoreCount = nextIgnoreCount;
        merge(config, cacheRes, messageRes,
              nextDepth, nextPath, cache, key);
        config.ignoreCount = ignoreCount;

        if (updateRequestedPath) {
            requestedPath.length = requestIdx;
        }

        // Are we done with the loop?
        key = iterateKeySet(outerKey, iteratorNote);
    } while (!iteratorNote.done);

    if (updateRequestedPath) {
        requestIdx = --config.requestIdx;
    }
}
