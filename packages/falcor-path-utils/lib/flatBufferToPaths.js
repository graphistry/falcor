module.exports = flatBufferToPaths;

function flatBufferToPaths(flatBuf, paths, path) {

    path = path || [];
    paths = paths || [];

    var leaf = [];
    var keys = flatBuf['$keys'];
    var keysLen = keys.length;
    var keysIndex = -1, key, len;

    while (++keysIndex < keysLen) {

        var rest = flatBuf[keysIndex];
        var keyset = keys[keysIndex];

        if (!rest) {
            leaf.push(keyset);
        } else {
            flatBufferToPaths(rest, paths, path.concat([keyset]));
        }
    }

    if (leaf.length === 1) {
        paths.push(path.concat(leaf));
    } else if (leaf.length > 1) {
        paths.push(path.concat([leaf]));
    }

    return paths;
}
