/**
 * Determined if the key passed in is an internal key.
 *
 * @param {String} x The key
 * @private
 * @returns {Boolean}
 */

module.exports = isInternalKey;

var isInternal = require('../internal/isInternal');

function isInternalKey(key) {
    return key && key[0] === '$' || isInternal(key);
}
