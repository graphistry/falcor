var Observable = require('../../rx').Observable;
var notOnCompleted = require('../conversion/notOnCompleted');
var outputToObservable = require('../conversion/outputToObservable');
var noteToMatchAndResult = require('../conversion/noteToMatchAndResult');
var flattenAndNormalizeActionResults = require('../conversion/flattenAndNormalizeActionResults');

module.exports = function runGetAction(routerInstance, jsongCache) {
    return function innerGetAction(matchAndPath) {
        return getAction(routerInstance, matchAndPath, jsongCache);
    };
};

function getAction(routerInstance, matchAndPath, jsongCache) {
    return Observable.defer(function() {
            return outputToObservable(matchAndPath.match
                .action.call(routerInstance, matchAndPath.path));
        })
        .materialize()
        .filter(notOnCompleted)
        .map(noteToMatchAndResult(matchAndPath))
        .mergeMap(flattenAndNormalizeActionResults);
}

