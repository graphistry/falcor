var groupCacheArguments = require('../groupCacheArguments');

module.exports = {
    json: invalidate,
    jsonGraph: invalidate,
    invalidatePathMaps: require('./invalidatePathMaps'),
    invalidatePathValues: require('./invalidatePathSets')
};

function invalidate(model, args, seed, progressive, expireImmediate) {
    if (invalidateArgumentGroups(model, groupCacheArguments(args), expireImmediate)) {
        var rootChangeHandler = model._root.onChange;
        rootChangeHandler && rootChangeHandler.call(model._root.topLevelModel);
    }
    return {};
}

function invalidateArgumentGroups(model, xs, expireImmediate) {

    var changed = false;
    var groupIndex = -1;
    var groupCount = xs.length;

    // Takes each of the groups and normalizes their input into
    // requested paths and optimized paths.
    while (++groupIndex < groupCount) {

        var group = xs[groupIndex];
        var inputType = group.inputType;
        var groupedArgs = group.arguments;

        if (groupedArgs.length > 0) {
            if (inputType === 'PathValues') {
                groupedArgs = groupedArgs.map(pluckPaths);
            }
            var operation = module.exports['invalidate' + inputType];
            if (operation(model, groupedArgs, expireImmediate)) {
                changed = true;
            }
        }
    }
    return changed;
}

function pluckPaths(x) {
    return x.path || x.paths;
}
