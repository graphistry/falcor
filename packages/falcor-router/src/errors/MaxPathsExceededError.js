var MESSAGE = 'Maximum number of paths exceeded.';

var MaxPathsExceededError = function MaxPathsExceededError(message) {
    var err = Error.call(this, message || MESSAGE);
    this.message = err.message;
    this.stack = err.stack;
};

MaxPathsExceededError.prototype = Object.create(Error.prototype);

module.exports = MaxPathsExceededError;
