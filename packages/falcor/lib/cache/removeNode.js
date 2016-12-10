var lruSplice = require('../lru/splice');
var unlinkBackReferences = require('./unlinkBackReferences');
var unlinkForwardReference = require('./unlinkForwardReference');

module.exports = function removeNode(node, parent, key, lru) {
    if (!(!node || typeof node !== 'object')) {
        var type = node.$type;
        if (type) {
            if (type === $ref) {
                unlinkForwardReference(node);
            }
            lruSplice(lru, node);
        }
        unlinkBackReferences(node);
        parent[key] = node[f_parent] = void 0;
        return true;
    }
    return false;
};
