module.exports = flatBufferToPaths;

function flatBufferToPaths(seed, paths, path) {

    path = path || [];
    paths = paths || [];

    if (!seed) {
        return paths;
    }

    var leaf = [];
    var keys = seed['$keys'];
    var keysLen = keys.length;
    var keysIndex = -1, key, len;

    while (++keysIndex < keysLen) {

        var next = seed[keysIndex];
        var keyset = keys[keysIndex];

        if (!next || typeof next !== 'object') {
            leaf.push(keyset);
        } else {
            flatBufferToPaths(next, paths, path.concat([keyset]));
        }
    }

    if (leaf.length === 1) {
        paths.push(path.concat(leaf));
    } else if (leaf.length > 1) {
        paths.push(path.concat([leaf]));
    }

    return paths;
}
