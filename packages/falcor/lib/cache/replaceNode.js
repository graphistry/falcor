var transferBackReferences = require('./transferBackReferences');
var removeNodeAndDescendants = require('./removeNodeAndDescendants');
var updateBackReferenceVersions = require('./updateBackReferenceVersions');

module.exports = replaceNode;

function replaceNode(node, replacement, parent, key, lru, version) {
    if (node === replacement) {
        return node;
    } else if (!(!node || typeof node !== 'object')) {
        transferBackReferences(node, replacement);
        removeNodeAndDescendants(node, parent, key, lru);
        updateBackReferenceVersions(replacement, version);
    }

    parent[key] = replacement;
    return replacement;
}
