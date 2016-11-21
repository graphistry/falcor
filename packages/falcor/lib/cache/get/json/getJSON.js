var isArray = Array.isArray;
var walkPathAndBuildOutput = require("./walkPath");
var walkFlatBufferAndBuildOutput = require("./walkFlatBuffer");
var getBoundCacheNode = require("../../getBoundCacheNode");
var InvalidModelError = require("../../../errors/InvalidModelError");
var toFlatBuffer = require("@graphistry/falcor-path-utils").toFlatBuffer;
var computeFlatBufferHash = require("@graphistry/falcor-path-utils").computeFlatBufferHash;

module.exports = getJSON;

function getJSON(model, paths, seed, progressive, forceUsePathWalk) {

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

    var hasFlatBuffer = false,
        json = seed && seed.json,
        results = { data: seed },
        boxValues = model._boxed,
        expired = modelRoot.expired,
        recycleJSON = model._recycleJSON,
        materialized = model._materialized,
        hasDataSource = Boolean(model._source),
        branchSelector = modelRoot.branchSelector,
        treatErrorsAsValues = model._treatErrorsAsValues,
        allowFromWhenceYouCame = model._allowFromWhenceYouCame;

    if (recycleJSON && forceUsePathWalk !== true && isArray(paths[0])) {
        paths = [computeFlatBufferHash(toFlatBuffer(paths))];
    }

    var pathsIndex = -1, pathsCount = paths.length;
    while (++pathsIndex < pathsCount) {
        var path = paths[pathsIndex];
        if (isArray(path)) {
            requestedLength = path.length;
            json = walkPathAndBuildOutput(cache, node, json, path,
                                       /* depth = */ 0, seed, results,
                                          requestedPath, requestedLength,
                                          optimizedPath, optimizedLength,
                                          /* fromReference = */ false, referenceContainer,
                                          modelRoot, expired, branchSelector,
                                          boxValues, materialized, hasDataSource,
                                          treatErrorsAsValues, allowFromWhenceYouCame);
        } else {
            hasFlatBuffer = true;
            var arr = walkFlatBufferAndBuildOutput(cache, node, json, path, 0, seed, results,
                                                   requestedPath, optimizedPath, optimizedLength,
                                                   /* fromReference = */ false, referenceContainer,
                                                   modelRoot, expired, branchSelector,
                                                   boxValues, materialized, hasDataSource,
                                                   treatErrorsAsValues, allowFromWhenceYouCame);
            json = arr[0];
            arr[0] = undefined;
            arr[1] = undefined;
        }
    }

    var requested = results.requested;

    results.args = hasFlatBuffer && paths || requested;

    if (requested && requested.length) {
        results.relative = results.args;//requested;
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
