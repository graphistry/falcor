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

function whenBufferHasValues(buffer) {
    return buffer.length > 0;
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

    function concatUnhandledAndMaterialize(source) {

        var streamingValues = source
            .scan(aggregateStreamingValues, {
                _paths: [], _invalidated: []
            })
            .filter(whenEmitValuesIsTrue);

        if (router._bufferTime > 0) {
            streamingValues = streamingValues
                .bufferTime(router._bufferTime)
                .filter(whenBufferHasValues)
                .map(flattenJSONGraphsBuffer);
        }

        return streamingValues.merge(source
            .reduce(aggregateUnhandledPaths, {})
            .mergeMap(fetchUnhandledRunner));
    }

    function aggregateStreamingValues(memo, next) {

        var graph, paths, invalidated;
        var _paths = memo._paths;
        var nextPaths = next.paths;
        var emitValues = next.emitValues;
        var _invalidated = memo._invalidated;
        var nextInvalidated = next.invalidated;

        if (nextPaths && nextPaths.length) {
            _paths.push.apply(_paths, nextPaths);
            optimizedPaths.push.apply(optimizedPaths, nextPaths);
        }

        if (nextInvalidated && nextInvalidated.length) {
            _invalidated.push.apply(_invalidated, nextInvalidated);
        }

        if (emitValues) {
            if (_paths.length) {
                paths = jsongMerge(graph = {}, {
                    paths: _paths, jsonGraph: jsonGraph
                }).paths;
                if (paths.length) {
                    _paths = [];
                } else {
                    paths = undefined;
                    graph = undefined;
                    emitValues = _invalidated.length > 0;
                }
            }
            invalidated = _invalidated;
            _invalidated = [];
        }

        memo = {
            paths: paths,
            _paths: _paths,
            jsonGraph: graph,
            emitValues: emitValues,
            invalidated: invalidated,
            _invalidated: _invalidated
        };

        return memo;
    }
}

function flattenJSONGraphsBuffer(buffer) {
    if (buffer.length === 1) {
        return buffer[0];
    }
    return buffer.reduce(reduceJSONGraphsBuffer, {
        paths: [], jsonGraph: {}, invalidated: []
    });
}

function reduceJSONGraphsBuffer(memo, env) {

    var paths = memo.paths;
    var nextPaths = env.paths;
    var invalidated = memo.invalidated;
    var nextInvalidated = env.invalidated;

    if (nextPaths && nextPaths.length) {
        jsongMerge(memo.jsonGraph, env);
        paths.push.apply(paths, nextPaths);
    }

    if (nextInvalidated && nextInvalidated.length) {
        invalidated.push.apply(invalidated, nextInvalidated);
    }

    return memo;
}
