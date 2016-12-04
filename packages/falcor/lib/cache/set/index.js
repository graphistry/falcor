var getJSON = require('../get/json');
var getJSONGraph = require('../get/jsonGraph');
var arrayFlatMap = require('../../support/array-flat-map');
var groupCacheArguments = require('../groupCacheArguments');

module.exports = {
    json: json,
    jsonGraph: jsonGraph,
    setPathMaps: require('./setPathMaps'),
    setPathValues: require('./setPathValues'),
    setJSONGraphs: require('./setJSONGraphs')
};

function json(model, _args, data, progressive, expireImmediate) {

    var set, json, jsong,
        args = groupCacheArguments(_args);

    set = setGroupsIntoCache(model, args /*, expireImmediate */);
    get = (progressive || !set.changed) &&
           getJSON(model, set.requested, data, progressive, expireImmediate);

    if (set.changed) {
        jsong = getJSONGraph({
            _root: model._root, _boxed: model._boxed, _materialized: true,
            _treatErrorsAsValues: model._treatErrorsAsValues
        }, set.optimized, {}, progressive, expireImmediate)
    }

    return {
        args: args, data: data,
        relative: set.requested,
        error: get && get.error,
        errors: get && get.errors,
        hasValue: get && get.hasValue,
        fragments: jsong && jsong.data,
        missing: jsong && jsong.data.paths,
        requested: jsong && jsong.requested
    };
}

function jsonGraph(model, _args, data, progressive, expireImmediate) {

    var set, jsong, args = groupCacheArguments(_args);
    set = setGroupsIntoCache(model, args /*, expireImmediate */);

    if (progressive || set.changed) {
        jsong = getJSONGraph({
            _root: model._root,
            _boxed: model._boxed, _materialized: true,
            _treatErrorsAsValues: model._treatErrorsAsValues
        }, set.optimized, data, progressive, expireImmediate);
    }

    return {
        args: args, data: data,
        relative: set.requested,
        error: jsong && jsong.error,
        fragments: jsong && jsong.data,
        hasValue: jsong && jsong.hasValue,
        missing: jsong && jsong.data.paths,
        requested: jsong && jsong.requested
    };
}

function setGroupsIntoCache(model, xs /*, expireImmediate */) {

    var changed = false;
    var groupIndex = -1;
    var groupCount = xs.length;
    var requestedPaths = [];
    var optimizedPaths = [];
    var modelRoot = model._root;
    var selector = modelRoot.errorSelector;

    // Takes each of the groups and normalizes their input into
    // requested paths and optimized paths.
    while (++groupIndex < groupCount) {

        var group = xs[groupIndex];
        var inputType = group.inputType;
        var groupedArgs = group.arguments;

        if (groupedArgs.length > 0) {
            var operation = module.exports['set' + inputType];
            var results = operation(model, groupedArgs, selector, null, false);
            changed = changed || results[2];
            optimizedPaths.push.apply(optimizedPaths, results[1]);
            if (inputType === 'PathValues') {
                requestedPaths.push.apply(requestedPaths, groupedArgs.map(pluckPaths));
            } else if (inputType === 'JSONGraphs') {
                requestedPaths.push.apply(requestedPaths, arrayFlatMap(groupedArgs, pluckPaths));
            } else {
                requestedPaths.push.apply(requestedPaths, results[0]);
            }
        }
    }

    return {
        changed: changed,
        requested: requestedPaths,
        optimized: optimizedPaths
    };
};

function pluckPaths(x) {
    return x.path || x.paths;
}
