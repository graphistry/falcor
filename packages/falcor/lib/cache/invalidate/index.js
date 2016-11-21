var invalidatePathSets = require('./invalidatePathSets');
var invalidatePathMaps = require('./invalidatePathMaps');

module.exports = {
    json: invalidate,
    jsonGraph: invalidate,
}

function invalidate(model, args, seed) {
    invalidatePathSets(model, args);
    return {};
}
