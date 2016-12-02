var createErrorClass = require('./createErrorClass');

/**
 * A request can only be retried up to a specified limit.  Once that
 * limit is exceeded, then an error will be thrown.
 *
 * @private
 */
module.exports = createErrorClass('MaxRetryExceededError', function(maxRetryCount, absolute, relative, optimized) {
    this.message = '' +
        'Exceeded the max retry count (' + maxRetryCount + ') for these paths: \n' +
        (absolute &&
        'absolute: [\n\t' + printPaths(absolute) + '\n]\n' || '') +
        (relative &&
        'relative: [\n\t' + printPaths(relative) + '\n]\n' || '') +
        (optimized &&
        'optimized: [\n\t' + printPaths(optimized) + '\n]\n' || '');
});

function printPaths(paths) {
    return paths.map(function(path) {
        return JSON.stringify(path);
    }).join(',\n\t');
}
