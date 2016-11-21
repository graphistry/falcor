var CallNotFoundError = module.exports = function CallNotFoundError(callPath) {
    var err = Error.call(this,
        'Error: No call handler found for ' +
        '"' + JSON.stringify(callPath) + '"'
    );
    this.stack = err.stack;
    this.message = err.message;
};

CallNotFoundError.prototype = Object.create(Error.prototype);

