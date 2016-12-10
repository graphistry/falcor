var Observable = require('./../rx').Observable;
var pathValueMerge = require('./../cache/pathValueMerge');
var optimizePathSets = require('./../cache/optimizePathSets');
var materializedAtom = require('@graphistry/falcor-path-utils/lib/support/materializedAtom');

module.exports = materializeMissing;

/**
 * given a set of paths and a jsonGraph envelope, materialize missing will
 * crawl all the paths to ensure that they have been fully filled in.  The
 * paths that are missing will be filled with materialized atoms.
 */
function materializeMissing(
    router, jsonGraph, pathsToMaterialize,
    pathsToReport, outerJSONGraphEnv) {

    return function innerMaterializeResult(resultJSONGraphEnv) {

        var missing = optimizePathSets(
            jsonGraph, pathsToMaterialize, router.maxRefFollow
        );

        if (!missing.length) {
            if (!outerJSONGraphEnv && (
                !resultJSONGraphEnv.invalidated ||
                !resultJSONGraphEnv.invalidated.length)) {
                return Observable.empty();
            }
        } else {
            resultJSONGraphEnv = insertMaterializedMissing(missing, {
                paths: missing,
                invalidated: resultJSONGraphEnv.invalidated,
                jsonGraph: resultJSONGraphEnv.jsonGraph || {}
            });
        }

        if (outerJSONGraphEnv) {
            resultJSONGraphEnv.paths = pathsToReport === pathsToMaterialize ?
                pathsToReport : pathsToReport.concat(pathsToMaterialize);
        }

        return Observable.of(resultJSONGraphEnv);
    }
}

function insertMaterializedMissing(paths, jsongEnv) {

    var jsonGraph = jsongEnv.jsonGraph;

    // insert atoms of undefined
    paths.forEach(function(path) {
        pathValueMerge(jsonGraph, {
            path: path, value: materializedAtom
        });
    });

    return jsongEnv;
}
