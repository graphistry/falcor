/* eslint-disable max-len */
var Observable = require('../../rx').Observable;
var jsongMerge = require('./../../cache/jsongMerge');
var notOnCompleted = require('../conversion/notOnCompleted');
var optimizeJSONGraph = require('./../../cache/optimizeJSONGraph');
var outputToObservable = require('../conversion/outputToObservable');
var noteToMatchAndResult = require('../conversion/noteToMatchAndResult');
var hasIntersection = require('./../../operations/matcher/intersection/hasIntersection');
var flattenAndNormalizeActionResults = require('../conversion/flattenAndNormalizeActionResults');
/* eslint-enable max-len */

module.exports = function outerRunSetAction(routerInstance, modelContext, jsongCache) {
    return function innerRunSetAction(matchAndPath) {
        return runSetAction(routerInstance, modelContext,
                            matchAndPath, jsongCache);
    };
};

function runSetAction(routerInstance, jsongMessage, matchAndPath, jsongCache) {

    var arg = matchAndPath.path;
    var match = matchAndPath.match;

    // We are at out destination.  Its time to get out
    // the pathValues from the
    if (match.isSet) {

        var tmpJsonGraph = optimizeJSONGraph(
            routerInstance, jsongMessage.paths,
            jsongCache, jsongMessage.jsonGraph,
            function(optimizedPath) {
                return optimizedPath && hasIntersection(optimizedPath, match.virtual);
            }
        ).jsonGraph;

        // Takes the temporary JSONGraph, attaches only the matched paths
        // then creates the subset json and assigns it to the argument to
        // the set function.
        var subJsonGraphEnv = {
            jsonGraph: tmpJsonGraph,
            paths: [match.requested]
        };

        jsongMerge(arg = {}, subJsonGraphEnv);
    }

    return Observable.defer(function() {
            return outputToObservable(match.action.call(routerInstance, arg));
        })
        .materialize()
        .filter(notOnCompleted)
        .map(noteToMatchAndResult(matchAndPath))
        .mergeMap(flattenAndNormalizeActionResults);
}
