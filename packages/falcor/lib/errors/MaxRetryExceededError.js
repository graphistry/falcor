var NAME = "MaxRetryExceededError";
var MESSAGE = "The allowed number of retries have been exceeded.";

/**
 * A request can only be retried up to a specified limit.  Once that
 * limit is exceeded, then an error will be thrown.
 *
 * @private
 */
function MaxRetryExceededError(maxRetryCount, absolute, relative, optimized) {
    var err = Error.call(this,
        "Exceeded the max retry count (" + maxRetryCount + ") for these paths: \n" +
        (absolute &&
        "absolute: [\n\t" + printPaths(absolute) + "\n]\n" || "") +
        (relative &&
        "relative: [\n\t" + printPaths(relative) + "\n]\n" || "") +
        (optimized &&
        "optimized: [\n\t" + printPaths(optimized) + "\n]\n" || "")
    );
    err.name = NAME;
    this.stack = err.stack;
    this.message = err.message;
    return this;
}

// instanceof will be an error, but stack will be correct because its defined
// in the constructor.
MaxRetryExceededError.prototype = Object.create(Error.prototype);
MaxRetryExceededError.prototype.name = NAME;
MaxRetryExceededError.is = function(e) {
    return e && e.name === NAME;
};

module.exports = MaxRetryExceededError;

function printPaths(paths) {
    return paths.map(function(path) {
        return JSON.stringify(path);
    }).join(',\n\t');
}
