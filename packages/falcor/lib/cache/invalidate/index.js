var groupCacheArguments = require('../groupCacheArguments');

module.exports = {
    json: invalidate,
    jsonGraph: invalidate,
    invalidatePathMaps: require('./invalidatePathMaps'),
    invalidatePathValues: require('./invalidatePathSets')
};

function invalidate(model, args, seed, progressive, expireImmediate) {
    invalidateArgumentGroups(model, groupCacheArguments(args), expireImmediate);
    return {};
}

function invalidateArgumentGroups(model, xs, expireImmediate) {

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
            module.exports['invalidate' + inputType](model, groupedArgs, expireImmediate);
        }
    }
}

function pluckPaths(x) {
    return x.path || x.paths;
}
