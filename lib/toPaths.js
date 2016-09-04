var template = require('./template');
var parser = require('./paths-parser');

module.exports = toPaths;

function toPaths() {
    return pathmapToPaths([], [], parser.parse(template.apply(null, arguments)));
}

function pathmapToPaths(paths, path, maps) {

    var leaf = [];
    var keys = maps.$keys;
    var keysLen = keys.length;
    var keysIndex = -1, key, len;

    while (++keysIndex < keysLen) {

        var rest = maps[keysIndex];
        var keyset = keys[keysIndex];

        if (!rest) {
            leaf.push(keyset);
        } else {
            pathmapToPaths(paths, path.concat([keyset]), rest);
        }
    }

    if (leaf.length === 1) {
        paths.push(path.concat(leaf));
    } else if (leaf.length > 1) {
        paths.push(path.concat([leaf]));
    }

    return paths;
}
