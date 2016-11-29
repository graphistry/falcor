var isArray = Array.isArray;
var isInternal = require('../internal/isInternal');

module.exports = clone;

function clone(source) {
    var dest = source;
    if (!(!dest || typeof dest !== 'object')) {
        dest = isArray(source) ? [] : {};
        for (var key in source) {
            if (isInternal(key)) {
                continue;
            }
            dest[key] = source[key];
        }
    }
    return dest;
}
