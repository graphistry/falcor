var createErrorClass = require('./createErrorClass');
var MESSAGE = 'The boundPath of the model is not valid since a value or error was found before the path end.';

/**
 * An InvalidModelError can only happen when a user binds, whether sync
 * or async to shorted value.  See the unit tests for examples.
 *
 * @param {String} message
 * @private
 */
module.exports = createErrorClass('InvalidModelError', function(boundPath, shortedPath) {
    this.message = MESSAGE;
    this.boundPath = boundPath;
    this.shortedPath = shortedPath;
});
