var removeNode = require('./removeNode');
var updateBackReferenceVersions = require('./updateBackReferenceVersions');

module.exports = function updateNodeAncestors(nodeArg, offset, lru, version) {
    var child = nodeArg;
    do {
        var node = child[f_parent];
        var size = child.$size = (child.$size || 0) - offset;
        if (size <= 0 && node != null) {
            removeNode(child, node, child[f_key], lru);
        } else if (child[f_version] !== version) {
            updateBackReferenceVersions(child, version);
        }
        child = node;
    } while (child);
    return nodeArg;
};
