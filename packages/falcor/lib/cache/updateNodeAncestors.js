var removeNodeAndDescendants = require('./removeNodeAndDescendants');
var updateBackReferenceVersions = require('./updateBackReferenceVersions');

module.exports = updateNodeAncestors;

function updateNodeAncestors(node, offset, lru, version) {
    var curr = node, next;
    do {
        if ((curr.$size = (curr.$size || 0) - offset) > 0) {
            if (!(next = curr[f_parent])) {
                curr[f_version] = version;
            } else if (curr[f_version] !== version) {
                updateBackReferenceVersions(curr, version);
            }
        } else if (next = curr[f_parent]) {
            removeNodeAndDescendants(curr, next, curr[f_key], lru, version);
        }
    } while (curr = next);
    return node;
}
