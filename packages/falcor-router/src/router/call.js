var call = 'call';
var Observable = require('../rx').Observable;
var getPathsCount = require('./getPathsCount');
var runCallAction = require('./../run/call/runCallAction');
var CallNotFoundError = require('./../errors/CallNotFoundError');
var MaxPathsExceededError = require('../errors/MaxPathsExceededError');
var recurseMatchAndExecute = require('./../run/recurseMatchAndExecute');
var normalizePathSets = require('../operations/ranges/normalizePathSets');

/**
 * Performs the call mutation.  If a call is unhandled, IE throws error, then
 * we will chain to the next dataSource in the line.
 */
module.exports = function routerCall(callPath, args,
                                     refPathsArg, thisPathsArg) {
    var router = this;

    return Observable.defer(function() {

        var jsonGraph = {};
        var callPaths = [callPath];
        var refPaths = normalizePathSets(refPathsArg || []);
        var thisPaths = normalizePathSets(thisPathsArg || []);
        var action = runCallAction(router, callPath, args,
                                   refPaths, thisPaths, jsonGraph);

        if (getPathsCount(refPaths) +
            getPathsCount(thisPaths) +
            getPathsCount(callPaths) >
            router.maxPaths) {
            throw new MaxPathsExceededError();
        }

        return recurseMatchAndExecute(router._matcher, action, callPaths, call,
                                      router, jsonGraph)
            // Catch CallNotFoundError in order to chain call requests.
            .catch(function catchException(e) {
                if (e instanceof CallNotFoundError &&
                    router._unhandled && router._unhandled.call) {
                    return Observable.from(router._unhandled.call(
                        callPath, args, refPaths, thisPaths
                    ));
                }
                return Observable.throw(e);
            });
    });
};
