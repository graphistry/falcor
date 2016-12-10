var Subject = require('../../rx').Subject;
var Observable = require('../../rx').Observable;
var pluckPath = require('./../../support/pluckPath');
var notOnCompleted = require('../conversion/notOnCompleted');
var mCGRI = require('../mergeCacheAndGatherRefsAndInvalidations');
var outputToObservable = require('../conversion/outputToObservable');
var noteToMatchAndResult = require('../conversion/noteToMatchAndResult');
var flattenAndNormalizeActionResults = require('../conversion/flattenAndNormalizeActionResults');

var isArray = Array.isArray;
var isJSONG = require('./../../support/isJSONG');
var isMessage = require('./../../support/isMessage');
var isPathValue = require('./../../support/isPathValue');

module.exports =  outerRunCallAction;

function outerRunCallAction(routerInstance, callPath, callArgs,
                            suffixes, extraPaths, jsonGraph) {
    return function innerRunCallAction(matchAndPath) {
        return runCallAction(matchAndPath, routerInstance, callPath,
                             callArgs, suffixes, extraPaths, jsonGraph);
    };
}

function runCallAction(matchAndPath, routerInstance, callPath, callArgs,
                       suffixes, extraPaths, jsonGraph) {

    var out;
    var match = matchAndPath.match;
    var matchedPath = matchAndPath.path;

    var args = !match.isCall ?
        [matchAndPath.path] :
        [matchedPath, callArgs, suffixes, extraPaths];

    var optimized = !match.isCall ?
        matchedPath: matchedPath.slice(0, matchedPath.length - 1);

    var obs = Observable.defer(function() {
            return outputToObservable(match.action.apply(routerInstance, args));
        })
        .materialize()
        .filter(notOnCompleted)
        .map(noteToMatchAndResult(matchAndPath, optimized, match.isCall))
        .mergeMap(flattenAndNormalizeActionResults);

    return !match.isCall ? obs : validateAndEnhanceCallOutput(
        obs, matchedPath, callPath, callArgs, suffixes, extraPaths, jsonGraph
    );
}

function validateAndEnhanceCallOutput(callOperation, matchedPath, callPath,
                                      callArgs, suffixes, extraPaths, jsonGraph) {

    var hasSuffixes = suffixes && suffixes.length;
    var hasExtraPaths = extraPaths && extraPaths.length;
    var callPathSave1 = callPath.slice(0, callPath.length - 1);

    // matchedPath is the optimized path to call.
    // e.g:
    // callPath: [genreLists, 0, add] ->
    // matchedPath: [lists, 'abc', add]
    var optimizedPathLength = matchedPath.length - 1;

    return callOperation.map(function(result) {

        var value = result.value;

        if (!isArray(value)) {
            value = [value];
        }

        if (value.length === 0) {
            return result;
        }

        var callResultsLen = 0;
        // Use recurseMatchAndExecute to run the paths and suffixes for call.
        // Send a message to recurseMatchAndExecute to switch from call to get.
        var callResults = [{ isMessage: true, method: 'get' }];

        var invsRefsAndValues = mCGRI(jsonGraph, value);
        var values = invsRefsAndValues.values;
        var messages = invsRefsAndValues.messages;
        var references = invsRefsAndValues.references;
        var invalidations = invsRefsAndValues.invalidations;

        if (invalidations.length) {
            callResults[++callResultsLen] = {
                isMessage: true, invalidations: invalidations
            };
        }

        // If there are path values, report their paths in the output.
        values.forEach(function(pathValue) {
            callResults[++callResultsLen] = {
                isMessage: true, value: pathValue
            };
        });

        messages.forEach(function(message) {
            callResults[++callResultsLen] = message;
        });

        // If there are paths to add then push them into the next
        // paths through 'additionalPath' message.
        if (hasExtraPaths) {
            extraPaths.forEach(function(path) {
                callResults[++callResultsLen] = {
                    isMessage: true, path: callPathSave1.concat(path)
                };
            });
        }

        // Build the complete path for each reference
        // from callPath.length - 1 and the reference's
        // path (where the reference was found, not the
        // value of the reference).
        //
        // e.g: from the above example the output is:
        // output = {path: [lists, abc, 0], value: [titles, 123]}
        //
        // This means the refs object = [output];
        // callPathSave1: [genreLists, 0],
        // optimizedPathLength: 3 - 1 = 2
        // ref.path.slice(2): [lists, abc, 0].slice(2) = [0]
        // deoptimizedPath: [genreLists, 0, 0]
        //
        // Add the deoptimizedPath to the callResults messages.
        // This will make the outer expand run those as a 'get'
        if (hasSuffixes) {
            references.forEach(function(refPathValue) {
                var deoptimizedPath = callPathSave1.concat(
                    refPathValue.path.slice(optimizedPathLength)
                );
                suffixes.forEach(function(suffix) {
                    callResults[++callResultsLen] = {
                        isMessage: true, path: deoptimizedPath.concat(suffix)
                    };
                });
            });
        }
        // If there are no suffixes, additionally report the reference paths.
        else {
            references.forEach(function(refPathValue) {
                callResults[++callResultsLen] = {
                    isMessage: true, value: refPathValue
                };
            });
        }

        result.value = callResults;

        return result;
    });
}
