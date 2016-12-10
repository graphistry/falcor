var createErrorClass = require('./createErrorClass');
var MESSAGE = '`null` is not allowed in branch key positions.';

/**
 * Do not allow null in path.
 */
module.exports = createErrorClass('NullInPathError', function() {
    this.message = MESSAGE;
});
