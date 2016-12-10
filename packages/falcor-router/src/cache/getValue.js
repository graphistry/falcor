/**
 * To simplify this algorithm, the path must be a simple
 * path with no complex keys.
 *
 * Note: The path coming in must contain no references, as
 * all set data caches have no references.
 * @param {Object} cache
 * @param {PathSet} path
 */
module.exports = function getValue(node, path) {
    var index = -1;
    var count = path.length;
    while (node &&
           typeof node === 'object' &&
           !node.$type && ++index < count) {
        node = node[path[index]];
    }
    return node;
};
