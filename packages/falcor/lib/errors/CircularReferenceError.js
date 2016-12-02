var createErrorClass = require('./createErrorClass');

module.exports = createErrorClass('CircularReferenceError', function(referencePath) {
    this.message = 'Encountered circular reference ' + JSON.stringify(referencePath);
});
