var isArray = Array.isArray;
var walkPathAndBuildOutput = require('./walkPath');
var walkFlatBufferAndBuildOutput = require('./walkFlatBuffer');
var getBoundCacheNode = require('../../getBoundCacheNode');
var InvalidModelError = require('../../../errors/InvalidModelError');
var toFlatBuffer = require('@graphistry/falcor-path-utils/lib/toFlatBuffer');
var computeFlatBufferHash = require('@graphistry/falcor-path-utils/lib/computeFlatBufferHash');

module.exports = getJSON;

function getJSON(model, paths, seed, progressive, expireImmediate) {

    var node,
        referenceContainer,
        boundPath = model._path,
        modelRoot = model._root,
        cache = modelRoot.cache,
        requestedPath, requestedLength,
        optimizedPath, optimizedLength =
            boundPath && boundPath.length || 0;

    // If the model is bound, get the cache position.
    if (optimizedLength) {
        node = getBoundCacheNode(model);
        // If there was a short, then we 'throw an error' to the outside
        // calling function which will onError the observer.
        if (node && node.$type) {
            return { error: new InvalidModelError(boundPath, boundPath) };
        }
        // We need to get the new cache position and copy the bound path.
        optimizedPath = [];
        for (var i = 0; i < optimizedLength; ++i) {
            optimizedPath[i] = boundPath[i];
        }
        referenceContainer = model._referenceContainer;
    } else {
        node = cache;
        optimizedPath = [];
    }

    requestedPath = [];

    var isFlatBuffer = false,
        json = seed && seed.json,
        results = { data: seed },
        boxValues = model._boxed,
        expired = modelRoot.expired,
        recycleJSON = model._recycleJSON,
        hasDataSource = Boolean(model._source),
        branchSelector = modelRoot.branchSelector,
        materialized = seed && model._materialized,
        treatErrorsAsValues = model._treatErrorsAsValues,
        allowFromWhenceYouCame = model._allowFromWhenceYouCame;

    var arr, path, pathsIndex = 0, pathsCount = paths.length;

    if (pathsCount > 0) {

        if (recycleJSON) {
            isFlatBuffer = true;
            if (pathsCount > 1 || isArray(paths[0])) {
                pathsCount = 1;
                paths = [computeFlatBufferHash(toFlatBuffer(paths, {}))];
            }
        }

        do {
            path = paths[pathsIndex];
            if (isFlatBuffer) {
                arr = walkFlatBufferAndBuildOutput(cache, node, json, paths[0], 0, seed, results,
                                                   requestedPath, optimizedPath, optimizedLength,
                                                   /* fromReference = */ false, referenceContainer,
                                                   modelRoot, expired, expireImmediate, branchSelector,
                                                   boxValues, materialized, hasDataSource,
                                                   treatErrorsAsValues, allowFromWhenceYouCame);
            } else {
                requestedLength = path.length;
                arr = walkPathAndBuildOutput(cache, node, json, path,
                                          /* depth = */ 0, seed, results,
                                             requestedPath, requestedLength,
                                             optimizedPath, optimizedLength,
                                             /* fromReference = */ false, referenceContainer,
                                             modelRoot, expired, expireImmediate, branchSelector,
                                             boxValues, materialized, hasDataSource,
                                             treatErrorsAsValues, allowFromWhenceYouCame);
            }
            json = arr[0];
            arr[0] = undefined;
            arr[1] = undefined;
        } while (++pathsIndex < pathsCount);
    }

    var requested = results.requested;

    results.args = isFlatBuffer && paths || requested;

    if (requested && requested.length) {
        results.relative = results.args;
        if (optimizedLength) {
            var boundRequested = [];
            for (var i = 0, len = requested.length; i < len; ++i) {
                boundRequested[i] = boundPath.concat(requested[i]);
            }
            results.requested = boundRequested;
        }
    }

    if (results.hasValue) {
        seed.json = json;
    }

    return results;
}
