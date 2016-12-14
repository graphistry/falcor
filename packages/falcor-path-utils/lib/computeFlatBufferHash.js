var isArray = Array.isArray;
var getHashCode = require('./getHashCode');

module.exports = computeFlatBufferHash;

function computeFlatBufferHash(seed) {

    if (seed === undefined) {
        return undefined;
    }

    var code = '';
    var keys = seed['$keys'];
    var keysIndex = -1;
    var keysLength = keys.length;

    while (++keysIndex < keysLength) {

        var key = keys[keysIndex];

        if (key === null) {
            code = '' + getHashCode('' + code + 'null');
            continue;
        } else if (typeof key === 'object') {
            key = '[' + key.from + '..' + (key.from + key.length - 1) + ']';
        }

        var next = computeFlatBufferHash(seed[keysIndex]);
        if (next === undefined) {
            code = '' + getHashCode('' + code + key);
        } else {
            code = '' + getHashCode('' + code + key + next['$code']);
        }
    }

    seed['$code'] = code;

    return seed;
}
