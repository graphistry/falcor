/**
 * Determined if the key passed in is an f_ internal key.
 *
 * @param {String} x The key
 * @private
 * @returns {Boolean}
 */

var f_ = require('./f_');
var regexp = new RegExp('^' + f_, 'i', 'g');

module.exports = regexp.test.bind(regexp);
