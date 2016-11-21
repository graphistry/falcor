var MESSAGE = 'JSONGraph returned from call must have a paths Array.';
var CallRequiresPathsError = function CallRequiresPathsError() {
    var err = Error.call(this, MESSAGE);
    this.stack = err.stack;
    this.message = err.message;
};

CallRequiresPathsError.prototype = Object.create(Error.prototype);

module.exports = CallRequiresPathsError;
