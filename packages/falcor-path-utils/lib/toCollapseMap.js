var isArray = Array.isArray;
var flatBufferToPaths = require('./flatBufferToPaths');

module.exports = toCollapseMap;

function toCollapseMap(pathsArg, collapseMapArg) {
    var paths = pathsArg, collapseMap = collapseMapArg;
    if (!collapseMap || typeof collapseMap !== 'object') {
        collapseMap = {};
    }
    if (!paths) {
        return collapseMap;
    } else if (!isArray(paths) && isArray(paths.$keys)) {
        paths = flatBufferToPaths(paths);
    }
    return paths.reduce(partitionPathsByLength, collapseMap);
}

function partitionPathsByLength(collapseMap, path) {
    var length = path.length;
    var paths = collapseMap[length] || (
                collapseMap[length] = []);
    paths[paths.length] = path;
    return collapseMap;
}
