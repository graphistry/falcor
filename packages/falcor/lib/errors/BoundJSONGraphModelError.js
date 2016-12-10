var createErrorClass = require('./createErrorClass');
var MESSAGE = 'It is not legal to use the JSON Graph ' +
    'format from a bound Model. JSON Graph format' +
    ' can only be used from a root model.';

/**
 * When a bound model attempts to retrieve JSONGraph it should throw an
 * error.
 *
 * @private
 */
module.exports = createErrorClass('BoundJSONGraphModelError', function() {
    this.message = MESSAGE;
});
