var Observable = require('../rx').Observable;
var getPathsCount = require('./getPathsCount');
var runAggregate = require('../run/aggregate');
var runStreaming = require('../run/streaming');
var runGetAction = require('../run/get/runGetAction');
var collapse = require('@graphistry/falcor-path-utils/lib/collapse');
var MaxPathsExceededError = require('../errors/MaxPathsExceededError');
var normalizePathSets = require('../operations/ranges/normalizePathSets');

/**
 * The router get function
 */
module.exports = function routerGet(paths) {

    var router = this;

    return Observable.defer(function() {

        var jsonGraph = {};
        var pathsTrees, invalidatedTrees;
        var action = runGetAction(router, jsonGraph);
        var normPS = normalizePathSets(paths);

        if (getPathsCount(normPS) > router.maxPaths) {
            throw new MaxPathsExceededError();
        }

        var run = router._streaming ? runStreaming : runAggregate;

        return run(router._matcher,
                   action, normPS, 'get',
                   router, jsonGraph,
                   router._unhandled &&
                   router._unhandled.get &&
                   unhandledGetRunner || undefined);
    });
};

function unhandledGetRunner(router, jsonGraphEnvelope, paths, unhandled) {
    return Observable.from(router._unhandled.get(collapse(unhandled)));
}
