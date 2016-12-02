var createErrorClass = require('./createErrorClass');
var MESSAGE = 'Deref can only be used with a non-primitive object from get, set, or call.';

/**
 * An invalid deref input is when deref is used with input that is not generated
 * from a get, set, or a call.
 *
 * @param {String} message
 * @private
 */
module.exports = createErrorClass('InvalidDerefInputError', function() {
    this.message = MESSAGE;
});
