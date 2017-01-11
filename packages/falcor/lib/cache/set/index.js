var getJSON = require('../get/json');
var getJSONGraph = require('../get/jsonGraph');
var groupCacheArguments = require('../groupCacheArguments');

module.exports = {
    json: json,
    jsonGraph: jsonGraph,
    setPathMaps: require('./setPathMaps'),
    setPathValues: require('./setPathValues'),
    setJSONGraphs: require('./setJSONGraphs')
};

function json(model, _args, data, progressive, expireImmediate) {

    var set, get, jsong,
        changed, relative, optimized,
        missing, fragments, requested,
        args = groupCacheArguments(_args);

    set = setGroupsIntoCache(model, args, expireImmediate);

    if ((relative = set.requested).length) {

        if (!(changed = set.changed) || progressive) {
            get = getJSON(model, relative, data, progressive, expireImmediate);
        }

        if (changed) {

            jsong = getJSONGraph({
                _root: model._root,
                _boxed: model._boxed, _materialized: true,
                _treatErrorsAsValues: model._treatErrorsAsValues
            }, set.optimized, {}, progressive, expireImmediate);

            fragments = jsong.data;
            missing = fragments.paths;
            requested = jsong.requested;

            var rootChangeHandler = model._root.onChange;
            rootChangeHandler && rootChangeHandler();
        }
    }

    return {
        args: args,
        data: data,
        missing: missing,
        relative: relative,
        fragments: fragments,
        requested: requested,
        error: get && get.error,
        errors: get && get.errors,
        hasValue: get && get.hasValue
    };
}

function jsonGraph(model, _args, data, progressive, expireImmediate) {

    var set, jsong,
        changed, relative, optimized,
        missing, fragments, requested,
        args = groupCacheArguments(_args);

    set = setGroupsIntoCache(model, args, expireImmediate);

    if ((relative = set.requested).length && (
         progressive || (changed = set.changed))) {

        jsong = getJSONGraph({
            _root: model._root,
            _boxed: model._boxed, _materialized: true,
            _treatErrorsAsValues: model._treatErrorsAsValues
        }, set.optimized, data, progressive, expireImmediate);

        fragments = jsong.data;
        missing = fragments.paths;
        requested = jsong.requested;

        if (changed) {
            var rootChangeHandler = model._root.onChange;
            rootChangeHandler && rootChangeHandler();
        }
    }

    return {
        args: args,
        data: data,
        missing: missing,
        relative: relative,
        fragments: fragments,
        requested: requested,
        error: jsong && jsong.error,
        hasValue: jsong && jsong.hasValue
    };
}

function setGroupsIntoCache(model, xs, expireImmediate) {

    var changed = false;
    var groupIndex = -1;
    var groupCount = xs.length;
    var requestedPaths = [];
    var optimizedPaths = [];
    var modelRoot = model._root;
    var errorSelector = modelRoot.errorSelector;

    expireImmediate = expireImmediate && !Boolean(model._source);
    var comparator = Boolean(model._source) ? null : modelRoot.comparator;

    // Takes each of the groups and normalizes their input into
    // requested paths and optimized paths.
    while (++groupIndex < groupCount) {

        var group = xs[groupIndex];
        var inputType = group.inputType;
        var groupedArgs = group.arguments;

        if (groupedArgs.length > 0) {
            var operation = module.exports['set' + inputType];
            var results = operation(model, groupedArgs, errorSelector, comparator, expireImmediate);
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
}

function pluckPaths(x) {
    return x.path || x.paths;
}

function arrayFlatMap(array, selector) {
    var index = -1;
    var i = -1;
    var n = array.length;
    var array2 = [];
    while (++i < n) {
        var array3 = selector(array[i], i, array);
        var j = -1;
        var k = array3.length;
        while (++j < k) {
            array2[++index] = array3[j];
        }
    }
    return array2;
}
