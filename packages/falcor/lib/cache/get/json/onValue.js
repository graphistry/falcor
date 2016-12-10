var clone = require('../../clone');
var onError = require('./onError');

module.exports = onJSONValue;

function onJSONValue(node, type, depth, seed, results,
                     requestedPath, optimizedPath, optimizedLength,
                     fromReference, boxValues, materialized,
                     treatErrorsAsValues) {

    if ($error === type && !treatErrorsAsValues) {
        return onError(node, depth, results, requestedPath,
                       fromReference, boxValues);
    }

    results.hasValue = true;

    // boxValues always clones the node
    return !boxValues ? node.value : clone(node);
}
