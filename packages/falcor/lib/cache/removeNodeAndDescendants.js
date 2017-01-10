var lruSplice = require('../lru/splice');
var isInternalKey = require('../support/isInternalKey');
var unlinkBackReferences = require('./unlinkBackReferences');
var unlinkForwardReference = require('./unlinkForwardReference');
var updateBackReferenceVersions = require('./updateBackReferenceVersions');

module.exports = removeNodeAndDescendants;

function removeNodeAndDescendants(node, parent, key, lru, version) {
    if (!(!node || typeof node !== 'object')) {
        var type = node.$type;
        if (type === undefined) {
            for (var key2 in node) {
                if (!isInternalKey(key2)) {
                    removeNodeAndDescendants(node[key2], node, key2, lru, version);
                }
            }
        } else {
            if (type === $ref) {
                unlinkForwardReference(node);
            }
            lruSplice(lru, node);
        }
        unlinkBackReferences(updateBackReferenceVersions(node, version));
        parent[key] = node[f_parent] = undefined;
        return true;
    }
    return false;
}
