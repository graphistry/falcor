var Subject = require('./../../rx').Subject;
var Observable = require('./../../rx').Observable;
var jsongMerge = require('./../../cache/jsongMerge');
var materializeMissing = require('./../materializeMissing');
var aggregateJSONGraphPaths = require('./../conversion/aggregateJSONGraphPaths');

module.exports = fetchUnhandledAndMaterializeStreaming;

function fetchUnhandledAndMaterializeStreaming(
    router, jsonGraph, unhandledRunner,
    requestedPaths, pathsToMaterialize,
    pathsToReport) {

    return function innerFetchUnhandledAndMaterializeStreaming(state) {

        var unhandled = state.unhandled;
        var unhandledFetched = !!(unhandledRunner && unhandled && unhandled.length);
        var resultObs = !unhandledFetched ?
            Observable.empty() : unhandledRunner(router, {
                    paths: unhandled,
                    jsonGraph: jsonGraph
                }, requestedPaths, unhandled)
                .do(function(x) {
                    jsongMerge(jsonGraph, {
                        paths: x.paths || unhandled,
                        jsonGraph: x.jsonGraph || {}
                    });
                });

        return resultObs.multicast(
            function() { return new Subject() },
            function(results) {
                return results.merge(results
                    .reduce(aggregateJSONGraphPaths, {})
                    .mergeMap(materializeMissing(
                        router, jsonGraph, pathsToMaterialize, pathsToReport
                    )));
            }
        );
    }
}
