var Observable = require('./../../rx').Observable;
var jsongMerge = require('./../../cache/jsongMerge');
var materializeMissing = require('./../materializeMissing');
var aggregateJSONGraphPaths = require('./../conversion/aggregateJSONGraphPaths');

module.exports = fetchUnhandledAndMaterializeAggregate;

function fetchUnhandledAndMaterializeAggregate(
    router, jsonGraph, unhandledRunner,
    requestedPaths, pathsToMaterialize,
    pathsToReport, outerJSONGraphEnv) {

    return function innerFetchUnhandledAndMaterializeAggregate(state) {

        var unhandled = state.unhandled;
        var unhandledFetched = !!(unhandledRunner && unhandled && unhandled.length);
        var resultObs = !unhandledFetched ?
            Observable.of(outerJSONGraphEnv) : unhandledRunner(router, {
                    paths: unhandled,
                    jsonGraph: jsonGraph
                }, requestedPaths, unhandled)
                .map(function(x) {
                    jsongMerge(jsonGraph, {
                        paths: x.paths || unhandled,
                        jsonGraph: x.jsonGraph || {}
                    });
                    return outerJSONGraphEnv;
                })
                .defaultIfEmpty(outerJSONGraphEnv);

        return resultObs
            .reduce(aggregateJSONGraphPaths)
            .mergeMap(materializeMissing(
                router, jsonGraph, pathsToMaterialize,
                pathsToReport, outerJSONGraphEnv
            ));
    }
}
