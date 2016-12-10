var createErrorClass = require('./createErrorClass');
var MESSAGE = 'An exception was thrown when making a request';

/**
 * InvalidSourceError happens when a dataSource syncronously throws
 * an exception during a get/set/call operation.
 *
 * @param {Error} error - The error that was thrown.
 * @private
 */
module.exports = createErrorClass('InvalidSourceError', function(error) {
    this.message = MESSAGE + ':\n\t' + error;
});
