var isInternal = require('../internal/isInternal');

module.exports = clone;

function clone(node) {

    var key, keys = Object.keys(node),
        json = {}, index = -1, length = keys.length;

    while (++index < length) {
        key = keys[index];
        if (isInternal(key)) {
            continue;
        }
        json[key] = node[key];
    }

    return json;
}
