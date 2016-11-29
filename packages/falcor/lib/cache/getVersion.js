var getBoundCacheNode = require('./getBoundCacheNode');

module.exports = function _getVersion(model, path) {
    var node = getBoundCacheNode(model, path);
    var version = node && node[f_version];
    return (version == null) ? -1 : version;
};
