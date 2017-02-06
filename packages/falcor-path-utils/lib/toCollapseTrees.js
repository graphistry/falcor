var toTree = require('./toTree');

module.exports = toCollapseTrees;

function toCollapseTrees(pathsByLength, treesByPathLengthArg) {

    var pathLengths = Object.keys(pathsByLength);
    var pathLength, pathLengthsIndex = -1;
    var pathLengthsCount = pathLengths.length;
    var treesByPathLength = treesByPathLengthArg;

    if (!treesByPathLength || typeof treesByPathLength !== 'object') {
        treesByPathLength = {};
    }

    while (++pathLengthsIndex < pathLengthsCount) {
        pathLength = pathLengths[pathLengthsIndex];
        treesByPathLength[pathLength] = toTree(
            pathsByLength[pathLength], treesByPathLength[pathLength]
        );
    }

    return treesByPathLength;
}
