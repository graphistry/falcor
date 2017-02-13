var Observable = require('../rx').Observable;
var getPathsCount = require('./getPathsCount');
var runAggregate = require('../run/aggregate');
var runStreaming = require('../run/streaming');
var runSetAction = require('./../run/set/runSetAction');
var optimizeJSONGraph = require('./../cache/optimizeJSONGraph');
var collapse = require('@graphistry/falcor-path-utils/lib/collapse');
var normalizePathSets = require('../operations/ranges/normalizePathSets');
var MaxPathsExceededError = require('../errors/MaxPathsExceededError');

/**
 * @returns {Observable.<JSONGraph>}
 * @private
 */
module.exports = routerSet;

function routerSet(incomingJsonGraphEnvelope) {

    var router = this;

    return Observable.defer(function() {

        var jsonGraph = {};
        var normPS = normalizePathSets(incomingJsonGraphEnvelope.paths);
        var action = runSetAction(router, incomingJsonGraphEnvelope, jsonGraph);

        if (getPathsCount(normPS) > router.maxPaths) {
            throw new MaxPathsExceededError();
        }

        var run = router._streaming ? runStreaming : runAggregate;

        return run(router._matcher,
                   action, normPS, 'set',
                   router, jsonGraph,
                   router._unhandled &&
                   router._unhandled.set &&
                   unhandledSetRunner || undefined);
    });

    function unhandledSetRunner(router, jsonGraphEnvelope, paths, unhandled) {

        var tmpJsonGraphEnv = optimizeJSONGraph(
            router, paths,
            jsonGraphEnvelope.jsonGraph,
            incomingJsonGraphEnvelope.jsonGraph,
            function(optimizedPath) {
                return optimizedPath && optimizedPath.length > 0;
            }
        );

        tmpJsonGraphEnv.paths = collapse(tmpJsonGraphEnv.paths);

        return Observable.from(router._unhandled.set(tmpJsonGraphEnv));
    }
}
