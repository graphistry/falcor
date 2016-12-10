/**
 * getCachePosition makes a fast walk to the bound value since all bound
 * paths are the most possible optimized path.
 *
 * @param {Model} model -
 * @param {Array} path -
 * @returns {Mixed} - undefined if there is nothing in this position.
 * @private
 */
module.exports = getCachePosition;

function getCachePosition(cache, path) {

    var node = cache;
    var type, depth = 0;
    var maxDepth = path.length;

    if (maxDepth > 0) {
        do {
            node = node[path[depth]];

            while (node && (type = node.$type) === $ref) {
                node = getCachePosition(cache, node.value);
            }
        } while (++depth < maxDepth && node && !type);
    }

    return node;
};
