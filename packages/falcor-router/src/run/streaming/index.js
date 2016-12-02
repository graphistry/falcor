var Subject = require('./../../rx').Subject;
var Observable = require('./../../rx').Observable;
var jsongMerge = require('./../../cache/jsongMerge');
var optimizePathsToExpand = require('./optimizePathsToExpand');
var recurseMatchAndExecute = require('./../recurseMatchAndExecute');
var toJSONGraphEnvelope = require('./../conversion/toJSONGraphEnvelope');
var fetchUnhandledAndMaterialize = require('./fetchUnhandledAndMaterialize');
var aggregateUnhandledPaths = require('./../conversion/aggregateUnhandledPaths');

module.exports = runStreaming;

function newSubject() {
    return new Subject();
}

function whenEmitValuesIsTrue(state) {
    return state.emitValues === true;
}

function runStreaming(match, actionRunner, requestedPaths, method,
                      router, jsonGraph, unhandledRunner) {

    var optimizedPaths = [];
    var invalidatedPaths = [];
    var jsonGraphEnvelope = {
        jsonGraph: jsonGraph,
        paths: optimizedPaths,
        invalidated: invalidatedPaths
    };

    var pathsToMaterialize = method === 'call' ?
        optimizedPaths : requestedPaths;

    var optimizeRunner = optimizePathsToExpand(router, jsonGraph);
    var fetchUnhandledRunner = fetchUnhandledAndMaterialize(
        router, jsonGraph, unhandledRunner,
        requestedPaths, pathsToMaterialize
    );

    var matchAllPathsAndRun = recurseMatchAndExecute(
        match, actionRunner, requestedPaths, method,
        router, jsonGraph, optimizeRunner, unhandledRunner
    );

    return matchAllPathsAndRun
        .multicast(newSubject, concatUnhandledAndMaterialize)
        .map(toJSONGraphEnvelope);

    function concatUnhandledAndMaterialize(streaming) {
        return streaming
            .scan(aggregateStreamingValues, {
                _paths: [], _invalidated: []
            })
            .filter(whenEmitValuesIsTrue)
            .merge(streaming
                .reduce(aggregateUnhandledPaths, {})
                .mergeMap(fetchUnhandledRunner));
    }

    function aggregateStreamingValues(memo, next) {

        var graph, paths;
        var _paths = memo._paths;
        var nextPaths = next.paths;
        var emitValues = next.emitValues;
        var invalidated = memo._invalidated;
        var nextInvalidated = next.invalidated;

        if (nextPaths && nextPaths.length) {
            _paths.push.apply(_paths, nextPaths);
            optimizedPaths.push.apply(optimizedPaths, nextPaths);
        }

        if (nextInvalidated && nextInvalidated.length) {
            invalidated.push.apply(invalidated, nextInvalidated);
        }

        if (emitValues && _paths.length) {

            paths = jsongMerge(graph = {}, {
                paths: _paths, jsonGraph: jsonGraph
            }).paths;

            if (paths.length) {
                _paths = [];
            } else {
                paths = undefined;
                graph = undefined;
                emitValues = invalidated.length > 0;
            }
        }

        if (memo.emitValues = emitValues) {
            memo._paths = _paths;
            memo._invalidated = [];
            memo.paths = paths;
            memo.jsonGraph = graph;
            memo.invalidated = invalidated;
        }


        return memo;
    }
}
