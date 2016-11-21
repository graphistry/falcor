var isArray = Array.isArray;
var flatBufferToPaths = require('./flatBufferToPaths');

module.exports = toCollapseMap;

function toCollapseMap(paths, collapseMap) {
    if (!paths) { return collapseMap; }
    else if (!isArray(paths)) {
        if (isArray(paths.$keys)) {
            paths = flatBufferToPaths(paths);
        }
    }
    return paths.reduce(function(acc, path) {
        var len = path.length;
        if (!acc[len]) {
            acc[len] = [];
        }
        acc[len].push(path);
        return acc;
    }, collapseMap || {});
}
