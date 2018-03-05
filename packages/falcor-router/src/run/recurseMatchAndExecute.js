var Observable = require('./../rx').Observable;
var matchPathsAndExecute = require('./matchPathsAndExecute');

/**
 * The recurse and match function will async recurse as long as
 * there are still more paths to be executed.  The match function
 * will return a set of objects that have how much of the path that
 * is matched.  If there are still more paths to be matched, denoted
 * by suffixes, recurseMatchAndExecute will keep running.
 */
module.exports = recurseMatchAndExecute;

function recurseMatchAndExecute(match, actionRunner, requestedPaths, method, optimizeRunner) {

    var runMatchAndExecute = matchPathsAndExecute(
        match, actionRunner, optimizeRunner
    );

    // Each pathSet (some form of collapsed path) need to be sent
    // independently. For each collapsed pathSet will, if producing
    // refs, be the highest likelihood of collapsibility.
    return Observable.of({
            method: method, requested: requestedPaths
        })
        .expand(runMatchAndExecute)
        .skip(1)
        .defaultIfEmpty({ unhandled: requestedPaths });
}
