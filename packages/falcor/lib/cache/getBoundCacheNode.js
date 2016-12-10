var getCachePosition = require('./getCachePosition');

module.exports = getBoundCacheNode;

function getBoundCacheNode(model, path) {
    path = path || model._path;
    var node = model._node;
    if (!node || node[f_parent] === undefined || node[f_invalidated]) {
        model._node = null;
        if (path.length === 0) {
            node = model._root.cache;
        } else {
            node = getCachePosition(model._root.cache, path);
            if (path === model._path) {
                model._node = node;
            }
        }
    }
    return node;
}
