var getJSON = require('../get/json');
var getJSONGraph = require('../get/jsonGraph');
var arrayFlatMap = require("../../support/array-flat-map");
var groupCacheArguments = require('../groupCacheArguments');

module.exports = {
    json: json,
    jsonGraph: jsonGraph,
    setPathMaps: require("./setPathMaps"),
    setPathValues: require("./setPathValues"),
    setJSONGraphs: require("./setJSONGraphs")
};

function json(model, args, data, progressive) {
    args = groupCacheArguments(args);
    var set = setGroupsIntoCache(model, args);
    var get = progressive && getJSON(model, set.relative, data);
    var jsong = getJSONGraph({
        _root: model._root, _boxed: model._boxed, _materialized: true,
        _treatErrorsAsValues: model._treatErrorsAsValues }, set.optimized, {});
    return {
        args: args,
        data: data,
        fragments: jsong.data,
        missing: set.optimized,
        relative: set.relative,
        error: get && get.error,
        errors: get && get.errors,
        requested: jsong.requested,
        hasValue: get && get.hasValue
    };
}

function jsonGraph(model, args, data) {
    args = groupCacheArguments(args);
    var set = setGroupsIntoCache(model, args);
    var jsong = getJSONGraph({
        _root: model._root,
        _boxed: model._boxed, _materialized: true,
        _treatErrorsAsValues: model._treatErrorsAsValues
    }, set.optimized, data);
    return {
        args: args,
        data: data,
        error: jsong.error,
        fragments: jsong.data,
        missing: set.optimized,
        relative: set.relative,
        hasValue: jsong.hasValue,
        requested: jsong.requested
    };
}

function setGroupsIntoCache(model, xs) {

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
            var operation = module.exports["set" + inputType];
            var resultPaths = operation(model, groupedArgs, selector);
            optimizedPaths.push.apply(optimizedPaths, resultPaths[1]);
            if (inputType === "PathValues") {
                requestedPaths.push.apply(requestedPaths, groupedArgs.map(pluckPaths));
            } else if (inputType === "JSONGraphs") {
                requestedPaths.push.apply(requestedPaths, arrayFlatMap(groupedArgs, pluckPaths));
            } else {
                requestedPaths.push.apply(requestedPaths, resultPaths[0]);
            }
        }
    }

    return { optimized: optimizedPaths, relative: requestedPaths };
};

function pluckPaths(x) {
    return x.path || x.paths;
}
