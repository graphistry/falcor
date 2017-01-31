var walkPathAndBuildOutput = require('./walkPath');
var BoundJSONGraphModelError = require('../../../errors/BoundJSONGraphModelError');

module.exports = getJSONGraph;

function getJSONGraph(model, paths, seed, progressive, expireImmediate) {

    var node, cache,
        boundPath = model._path,
        modelRoot = model._root,
        requestedPath, requestedLength,
        optimizedPath, optimizedLength =
            boundPath && boundPath.length || 0;

    // If the model is bound, then get that cache position.
    if (optimizedLength) {
        // JSONGraph output cannot ever be bound or else it will
        // throw an error.
        return { error: new BoundJSONGraphModelError() };
    } else {
        optimizedPath = [];
        cache = node = modelRoot.cache;
    }

    requestedPath = [];

    var boxValues = model._boxed,
        expired = modelRoot.expired,
        materialized = model._materialized,
        hasDataSource = Boolean(model._source),
        pathsIndex = -1, pathsCount = paths.length,
        treatErrorsAsValues = model._treatErrorsAsValues,
        results = { args: null, data: seed, paths: null,
                    relative: null, requested: null, jsonGraph: null };

    while (++pathsIndex < pathsCount) {
        var path = paths[pathsIndex];
        requestedLength = path.length;
        walkPathAndBuildOutput(cache, node, path,
                            /* depth = */ 0, seed, results,
                               requestedPath, requestedLength,
                               optimizedPath, optimizedLength,
              /* fromReference = */ false, modelRoot, expired, expireImmediate,
                               boxValues, materialized, hasDataSource, treatErrorsAsValues);
    }

    results.args = results.relative = results.requested;

    return results;
}
