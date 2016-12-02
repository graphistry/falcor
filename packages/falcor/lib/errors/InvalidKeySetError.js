var createErrorClass = require('./createErrorClass');

/**
 * InvalidKeySetError happens when a dataSource syncronously throws
 * an exception during a get/set/call operation.
 *
 * @param {Error} error - The error that was thrown.
 * @private
 */
module.exports = createErrorClass('InvalidKeySetError', function(path, keysOrRanges) {
    this.mesage = '' +
        'The KeySet ' + JSON.stringify(keysOrRanges) +
        ' in path ' + JSON.stringify(path) + ' contains a KeySet. ' +
        'Keysets can only contain Keys or Ranges';
});
