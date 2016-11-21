var isArray = Array.isArray;

module.exports = clone;

function clone(source) {
    var dest = source;
    if (!(!dest || typeof dest !== 'object')) {
        dest = isArray(source) ? [] : {};
        for (var key in source) {
            if (key.charAt(0) === ƒ_) {
                continue;
            }
            dest[key] = source[key];
        }
    }
    return dest;
}
