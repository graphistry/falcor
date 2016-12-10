var invalidatePathSets = require('./invalidatePathSets');
var invalidatePathMaps = require('./invalidatePathMaps');

module.exports = {
    json: invalidate,
    jsonGraph: invalidate,
}

function invalidate(model, args, seed, progressive, expireImmediate) {
    invalidatePathSets(model, args, expireImmediate);
    return {};
}
