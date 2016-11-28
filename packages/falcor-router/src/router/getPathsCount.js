var pathCount = require('@graphistry/falcor-path-utils/lib/pathCount');

function getPathsCount(pathSets) {
    return pathSets.reduce(function(numPaths, pathSet) {
        return numPaths + pathCount(pathSet);
    }, 0);
}

module.exports = getPathsCount;
