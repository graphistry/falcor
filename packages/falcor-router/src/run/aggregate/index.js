var optimizePathsToExpand = require('./optimizePathsToExpand');
var recurseMatchAndExecute = require('./../recurseMatchAndExecute');
var toJSONGraphEnvelope = require('./../conversion/toJSONGraphEnvelope');
var fetchUnhandledAndMaterialize = require('./fetchUnhandledAndMaterialize');
var aggregateJSONGraphPaths = require('./../conversion/aggregateJSONGraphPaths');
var aggregateUnhandledPaths = require('./../conversion/aggregateUnhandledPaths');

module.exports = runAggregate;

function runAggregate(match, actionRunner, requestedPaths, method,
                      router, jsonGraph, unhandledRunner) {

    var optimizedPaths = [];
    var invalidatedPaths = [];
    var jsonGraphEnvelope = {
        jsonGraph: jsonGraph,
        paths: optimizedPaths,
        invalidated: invalidatedPaths
    };

    var pathsToReport = optimizedPaths;
    var pathsToMaterialize = method === 'call' ?
        optimizedPaths : requestedPaths;

    var optimizeRunner = optimizePathsToExpand(router, jsonGraph);
    var fetchUnhandledRunner = fetchUnhandledAndMaterialize(
        router, jsonGraph, unhandledRunner,
        requestedPaths, pathsToMaterialize,
        pathsToReport, jsonGraphEnvelope
    );

    var matchAllPathsAndRun = recurseMatchAndExecute(
        match, actionRunner, requestedPaths, method, optimizeRunner
    );

    return matchAllPathsAndRun
        .scan(aggregateUnhandledPaths, {})
        .reduce(aggregateJSONGraphPaths, {
            paths: optimizedPaths,
            invalidated: invalidatedPaths
        })
        .mergeMap(fetchUnhandledRunner)
        .map(toJSONGraphEnvelope);
}
