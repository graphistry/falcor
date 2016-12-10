var Observable = require('../../rx').Observable;
var getExecutableMatches = require('./getExecutableMatches');

/**
 * Sorts and strips the set of available matches given the pathSet.
 */
module.exports = function runByPrecedence(optimized, matches, method, actionRunner) {

    // Precendence matching
    var execs = getExecutableMatches(
        optimized, matches.sort(sortByPrecedence)
    );

    var setOfMatchedPaths = Observable
        .from(execs.executableMatches)
        // Note: We do not wait for each observable to finish,
        // but repeat the cycle per onNext.
        .flatMap(actionRunner);

    if (execs.unhandledPaths) {
        setOfMatchedPaths = setOfMatchedPaths.
            concat(Observable.of({
                match: { method: method },
                value: {
                    isMessage: true,
                    unhandledPaths: execs.unhandledPaths
                }
            }));
    }

    return setOfMatchedPaths;
};

function sortByPrecedence(a, b) {

    var aPrecedence = a.precedence;
    var bPrecedence = b.precedence;

    if (aPrecedence < bPrecedence) {
        return 1;
    } else if (aPrecedence > bPrecedence) {
        return -1;
    }

    return 0;
}
