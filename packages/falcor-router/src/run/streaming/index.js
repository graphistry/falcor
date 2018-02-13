var Subject = require('./../../rx').Subject;
var Observable = require('./../../rx').Observable;
var jsongMerge = require('./../../cache/jsongMerge');
var pluckPath = require('./../../support/pluckPath');
var optimizePathsToExpand = require('./optimizePathsToExpand');
var recurseMatchAndExecute = require('./../recurseMatchAndExecute');
var toJSONGraphEnvelope = require('./../conversion/toJSONGraphEnvelope');
var fetchUnhandledAndMaterialize = require('./fetchUnhandledAndMaterialize');
var aggregateUnhandledPaths = require('./../conversion/aggregateUnhandledPaths');

module.exports = runStreaming;

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
        match, actionRunner, requestedPaths, method, optimizeRunner
    );

    return matchAllPathsAndRun
        .multicast(newSubject, concatUnhandledAndMaterialize)
        .map(toJSONGraphEnvelope);

    function concatUnhandledAndMaterialize(source) {

        var streamingValues = source
            .scan(aggregateStreamingValues, {
                _paths: [], _invalidated: []
            })
            .multicast(newSubject, emitStreamingAndFinalValues);

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

        var _paths = memo._paths;
        var nextPaths = next.paths;
        var emitValues = next.emitValues;
        var _invalidated = memo._invalidated;
        var nextInvalidated = next.invalidated;
        var res, graph, paths, references, invalidated;

        if (nextPaths && nextPaths.length) {
            _paths.push.apply(_paths, nextPaths);
            optimizedPaths.push.apply(optimizedPaths, nextPaths);
        }

        if (nextInvalidated && nextInvalidated.length) {
            _invalidated.push.apply(_invalidated, nextInvalidated);
        }

        if (emitValues) {
            if (_paths.length) {
                res = jsongMerge(graph = {}, {
                    paths: _paths, jsonGraph: jsonGraph
                });
                paths = res.paths;
                references = res.references;
                if (paths.length || references.length) {
                    _paths = [];
                    paths = paths.concat(references.map(pluckPath));
                } else {
                    paths = graph = undefined;
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

    function emitStreamingAndFinalValues(streamingValuesShared) {
        return streamingValuesShared
            .filter(whenEmitValuesIsTrue)
            .merge(streamingValuesShared
                .takeLast(1)
                .filter(isNotEmptyAndWasNotEmitted)
                .map(finalizeLastJSONGraphEnv));
    }

    function finalizeLastJSONGraphEnv(state) {
        var res, references;
        var paths = state._paths;
        var graph = state.jsonGraph;
        var invalidated = state._invalidated;
        if (paths.length > 0) {
            res = jsongMerge(graph = {}, {
                paths: paths, jsonGraph: jsonGraph
            });
            paths = res.paths;
            references = res.references;
            if (paths.length || references.length) {
                paths = paths.concat(references.map(pluckPath));
            } else {
                paths = graph = undefined;
            }
        }
        return {
            paths: paths,
            jsonGraph: graph,
            invalidated: invalidated
        };
    }
}

function newSubject() {
    return new Subject();
}

function whenEmitValuesIsTrue(state) {
    return state.emitValues === true;
}

function whenBufferHasValues(buffer) {
    return buffer.length > 0;
}

function isNotEmptyAndWasNotEmitted(state) {
    return !state.emitValues && (
        state._paths.length > 0 ||
        state._invalidated.length > 0
    );
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
