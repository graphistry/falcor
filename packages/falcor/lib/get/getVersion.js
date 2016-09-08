var getBoundCacheNode = require("./../get/getBoundCacheNode");

module.exports = function _getVersion(model, path) {
    var node = getBoundCacheNode(model, path);
    var version = node && node.ツversion;
    return (version == null) ? -1 : version;
};
