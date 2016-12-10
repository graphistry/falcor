var getValue = require('./../cache/getValue');
var spreadPaths = require('./../support/spreadPaths');
var pathValueMerge = require('./../cache/pathValueMerge');
var optimizePathSets = require('./../cache/optimizePathSets');

module.exports = optimizeJSONGraph;

function optimizeJSONGraph(router, paths, optimizedJSONGraph, originalJSONGraph, hasIntersection) {

    // We have to ensure that the paths maps in order
    // to the optimized paths array.
    var optimizedAndPaths = spreadPaths(paths)
        // Optimizes each path.
        .map(function(path) {
            var pair = optimizePathSets(
                optimizedJSONGraph, [path], router.maxRefFollow
            );
            pair[1] = path;
            return pair;
        })
        // only include the paths from the set that intersect
        .filter(function(optimizedAndPath) {
            return hasIntersection(optimizedAndPath[0]);
        });

    return optimizedAndPaths.reduce(function(env, optimizedAndPath) {
        env.paths.push(optimizedAndPath[0]);
        pathValueMerge(env.jsonGraph, {
            path: optimizedAndPath[0],
            value: getValue(originalJSONGraph, optimizedAndPath[1])
        });
        return env;
    }, { paths: [], jsonGraph: {} });
}
