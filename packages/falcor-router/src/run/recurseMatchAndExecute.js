var Rx = require('../rx');
var Subject = Rx.Subject;
var isArray = Array.isArray;
var Observable = Rx.Observable;
var materialize = require('./materialize');
var jsongMerge = require('./../cache/jsongMerge');
var pluckPath = require('./../support/pluckPath');
var optimizePathSets = require('./../cache/optimizePathSets');
var runByPrecedence = require('./precedence/runByPrecedence');
var mCGRI = require('./mergeCacheAndGatherRefsAndInvalidations');
var collapse = require('@graphistry/falcor-path-utils/lib/collapse');
var CallNotFoundError = require('./../errors/CallNotFoundError');

/**
 * The recurse and match function will async recurse as long as
 * there are still more paths to be executed.  The match function
 * will return a set of objects that have how much of the path that
 * is matched.  If there are still more paths to be matched, denoted
 * by suffixes, recurseMatchAndExecute will keep running.
 */
module.exports = function recurseMatchAndExecute(
        match, actionRunner, paths, method,
        router, jsonGraph, unhandledRunner) {

    return _recurseMatchAndExecute(
        match, actionRunner, paths, method,
        router, jsonGraph, unhandledRunner);
};

/**
 * performs the actual recursing
 */
function _recurseMatchAndExecute(
        match, actionRunner, requestedPaths, method,
        router, jsonGraph, unhandledRunner) {

    var optimizedPaths = [];
    var invalidatedPaths = [];
    var jsonGraphEnvelope = {
        jsonGraph: jsonGraph,
        paths: optimizedPaths,
        invalidated: invalidatedPaths
    };
    var routerSupportsStreaming = router._streaming;
    var pathsToMaterialize = method === 'call' ? optimizedPaths : requestedPaths;

    // Each pathSet (some form of collapsed path) need to be sent
    // independently. For each collapsed pathSet will, if producing
    // refs, be the highest likelihood of collapsibility.
    var matchAllPathsAndRun = Observable.of({
            method: method, requested: requestedPaths
        })
        .expand(matchPathsAndExecute)
        .defaultIfEmpty({ unhandled: requestedPaths });

    if (!routerSupportsStreaming) {
        return matchAllPathsAndRun
            .reduce(aggregateJSONGraphPaths, {
                paths: optimizedPaths,
                invalidated: invalidatedPaths
            })
            .mergeMap(fetchUnhandledAndMaterialize(
                router, jsonGraph, unhandledRunner,
                requestedPaths, pathsToMaterialize, jsonGraphEnvelope
            ))
            .map(mapToJSONGraphEnvelope);
    }

    var streamingPaths = [];
    var streamingJSONGraph = {};
    var streamingInvalidated = [];

    return matchAllPathsAndRun.multicast(
        function() { return new Subject() },
        function(streaming) {
            return streaming
                .filter(onlyEmitStreamingValues)
                .merge(streaming
                    .reduce(aggregateJSONGraphPaths, {
                        paths: optimizedPaths,
                        invalidated: invalidatedPaths
                    })
                    .mergeMap(fetchUnhandledAndMaterializeStreaming(
                        router, jsonGraph, unhandledRunner,
                        requestedPaths, pathsToMaterialize
                    ))
                );
        })
        .map(mapToJSONGraphEnvelope);

    function onlyEmitStreamingValues(x) {
        var shouldEmit = false;
        if (x.paths) {
            shouldEmit = true;
            streamingPaths = [];
            streamingJSONGraph = {};
        }
        if (x.invalidated) {
            shouldEmit = true;
            streamingInvalidated = [];
        }
        return shouldEmit;
    }

    function matchPathsAndExecute(state) {

        var requested = state.requested;

        if (!requested || !requested.length) {
            return Observable.empty();
        }

        return Observable
            .from(requested)
            .mergeMap(function(path) {
                var matches, exception;
                try  {
                    matches = match(state.method, path);
                } catch (e) {
                    exception = e instanceof Error ? e : new Error(('' + e) ||
                        'Encountered a problem while resolving a path.\n' +
                        'Have you written a route handler for this path?\n' +
                        'path: "' + JSON.stringify(path) + '"'
                    );
                    return Observable.throw(exception);
                }
                return runEachPathAndMatchesByPrecedence(
                    state.method, matches, path
                );
            },
            optimizePathsToExpandOrEmitValues);
    }

    function runEachPathAndMatchesByPrecedence(method, matches, path) {

        // When there is explicitly not a match then we need to handle
        // the unhandled paths.
        if (!matches.length) {
            return Observable.of({
                value: [],  match: { method: method }, unhandled: [path]
            });
        }
        // Execute the matched routes by precedence
        // Generate from the combined results the next requestable paths
        // and insert errors / values into the cache.
        return runByPrecedence(
            path, matches, method, actionRunner
        );
    }

    function optimizePathsToExpandOrEmitValues(requestedPath, result) {

        var match = result.match;
        var value = result.value;
        var unhandled = result.unhandled;

        var suffix = match && match.suffix;
        var method = match && match.method;
        var suffixLen = suffix && suffix.length || 0;

        if (!isArray(value)) {
            value = [value];
        }

        var invsRefsAndValues = mCGRI(jsonGraph, value);

        var values = invsRefsAndValues.values;
        var messages = invsRefsAndValues.messages;
        var references = invsRefsAndValues.references;
        var invalidated = invsRefsAndValues.invalidations;

        var reportedPaths = []
        var valuePaths = values.map(pluckPath);
        var pathsToExpand = suffixLen > 0 ? references : [];

        // Merges the remaining suffix with remaining nextPaths
        pathsToExpand = pathsToExpand.map(function(reference) {
            return reference.value.concat(suffix);
        });

        // Alters the behavior of the expand
        messages.forEach(function(message) {
            // mutates the method type for the matcher
            if (message.method) {
                method = message.method;
            }
            // Mutates the nextPaths and adds any additionalPaths
            else if (message.additionalPath) {
                var path = message.additionalPath;
                pathsToExpand[pathsToExpand.length] = path;
                reportedPaths[reportedPaths.length] = path;
            }
            // Any invalidations that come down from a call
            else if (message.invalidations) {
                invalidated.push.apply(
                    invalidated, message.invalidations
                );
            }
            // We need to add the unhandledPaths to the jsonGraph response.
            else if (message.unhandledPaths) {
                unhandled = unhandled ? unhandled.concat(
                    message.unhandledPaths):
                    message.unhandledPaths ;
            }
        });

        var state = { method: method };

        if (unhandled && unhandled.length) {
            state.unhandled = unhandled;
        }

        // Explodes and collapse the tree to remove
        // redundants and get optimized next set of
        // paths to evaluate.
        if (pathsToExpand.length) {
            state.requested = collapse(optimizePathSets(
                jsonGraph, pathsToExpand, router.maxRefFollow
            ));
        }

        if (!routerSupportsStreaming) {
            if (reportedPaths.length) {
                state.paths = reportedPaths;
            }
            if (invalidated.length) {
                state.invalidated = invalidated;
            }
        } else {

            if (references.length) {
                references = references.map(pluckPath);
                if (suffixLen === 0) {
                    valuePaths.push.apply(valuePaths, references);
                } else {
                    streamingPaths.push.apply(streamingPaths, references);
                    jsongMerge(streamingJSONGraph, {
                        jsonGraph: jsonGraph, paths: references
                    });
                }
            }

            if (reportedPaths.length) {
                streamingPaths.push.apply(streamingPaths, reportedPaths);
            }

            if (invalidated.length) {
                debugger
                state.invalidated = streamingInvalidated;
                streamingInvalidated.push.apply(streamingInvalidated, invalidated);
            }

            if (valuePaths.length || reportedPaths.length) {
                if (valuePaths.length > 0) {
                    debugger
                    state.paths = streamingPaths;
                    streamingPaths.push.apply(streamingPaths, valuePaths);
                }
                jsongMerge(state.jsonGraph = streamingJSONGraph, {
                    jsonGraph: jsonGraph, paths: valuePaths.concat(reportedPaths)
                });
            }
        }

        return state;
    }
}

function aggregateJSONGraphPaths(seed, next) {

    var paths = seed.paths;
    var unhandled = seed.unhandled;
    var invalidated = seed.invalidated;

    if (next) {

        var nextPaths = next.paths;
        var nextUnhandled = next.unhandled;
        var nextInvalidated = next.invalidated;

        if (nextPaths && nextPaths.length) {
            if (!paths) {
                paths = [];
            }
            paths.push.apply(paths, nextPaths);
        }

        if (nextUnhandled && nextUnhandled.length) {
            if (!unhandled) {
                unhandled = [];
            }
            unhandled.push.apply(unhandled, nextUnhandled);
        }

        if (nextInvalidated && nextInvalidated.length) {
            if (!invalidated) {
                invalidated = [];
            }
            invalidated.push.apply(invalidated, nextInvalidated);
        }
    }

    return {
        paths: paths,
        unhandled: unhandled,
        invalidated: invalidated,
        jsonGraph:
            next && next.jsonGraph ||
            seed && seed.jsonGraph || {}
    };
}

function fetchUnhandledAndMaterialize(
    router, jsonGraph, unhandledRunner,
    requestedPaths, pathsToMaterialize, outerJSONGraphEnv) {

    return function(state) {

        var unhandled = state.unhandled;
        var unhandledFetched = !!(unhandledRunner && unhandled && unhandled.length);
        var resultObs = !unhandledFetched ?
            Observable.of(outerJSONGraphEnv) :
            unhandledRunner(router, {
                    paths: unhandled,
                    jsonGraph: jsonGraph
                }, requestedPaths, unhandled
            )
            .map(function(x) {
                jsongMerge(jsonGraph, {
                    paths: x.paths || unhandled,
                    jsonGraph: x.jsonGraph || {}
                });
                return outerJSONGraphEnv;
            })
            .defaultIfEmpty(outerJSONGraphEnv);

        return resultObs
            .reduce(aggregateJSONGraphPaths, {
                paths: [], invalidated: []
            })
            .mergeMap(materializeResult(
                router, jsonGraph, pathsToMaterialize, outerJSONGraphEnv
            ));
    }
}

function fetchUnhandledAndMaterializeStreaming(
    router, jsonGraph, unhandledRunner,
    requestedPaths, pathsToMaterialize) {

    return function(state) {

        var unhandled = state.unhandled;
        var unhandledFetched = !!(unhandledRunner && unhandled && unhandled.length);
        var resultObs = !unhandledFetched ?
            Observable.empty() :
            unhandledRunner(router, {
                    paths: unhandled,
                    jsonGraph: jsonGraph
                }, requestedPaths, unhandled
            )
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
                    .reduce(aggregateJSONGraphPaths, {
                        paths: [], invalidated: []
                    })
                    .mergeMap(materializeResult(
                        router, jsonGraph, pathsToMaterialize
                    )));
            }
        );
    }
}

function materializeResult(router, jsonGraph, pathsToMaterialize, outerJSONGraphEnv) {

    return function innerMaterializeResult(resultJSONGraphEnv) {

        pathsToMaterialize = optimizePathSets(
            jsonGraph, pathsToMaterialize, router.maxRefFollow
        );

        if (!pathsToMaterialize.length) {
            if (!outerJSONGraphEnv && (
                !resultJSONGraphEnv.invalidated ||
                !resultJSONGraphEnv.invalidated.length)) {
                return Observable.empty();
            }
        } else {
            resultJSONGraphEnv = materialize(pathsToMaterialize, {
                paths: pathsToMaterialize,
                invalidated: resultJSONGraphEnv.invalidated,
                jsonGraph: resultJSONGraphEnv.jsonGraph || {}
            });
            if (outerJSONGraphEnv) {
                resultJSONGraphEnv.paths = null;
            }
        }

        return Observable.of(resultJSONGraphEnv);
    }
}

function mapToJSONGraphEnvelope(jsonGraphEnvelope) {

    var paths = jsonGraphEnvelope.paths;
    var jsonGraph = jsonGraphEnvelope.jsonGraph;
    var invalidated = jsonGraphEnvelope.invalidated;

    jsonGraphEnvelope = {};

    if (jsonGraph) {
        jsonGraphEnvelope.jsonGraph = jsonGraph;
    }

    if (paths && paths.length) {
        jsonGraphEnvelope.paths = collapse(paths);
    }

    if (invalidated && invalidated.length) {
        jsonGraphEnvelope.invalidated = collapse(invalidated);
    }

    return jsonGraphEnvelope;
}
