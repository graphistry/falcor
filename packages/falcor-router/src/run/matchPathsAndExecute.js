var Observable = require('./../rx').Observable;
var runByPrecedence = require('./precedence/runByPrecedence');

module.exports = matchPathsAndExecute;

function matchPathsAndExecute(match, actionRunner,
                              optimizePathsToExpandOrEmitValues) {

    return function innerMatchPathsAndExecute(state) {

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
}
