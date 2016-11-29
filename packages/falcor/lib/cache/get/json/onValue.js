var clone = require('../../clone');
var onError = require('./onError');
var $error = require('../../../types/error');
var materializedAtom = require('@graphistry/falcor-path-utils/lib/support/materializedAtom');

module.exports = onJSONValue;

function onJSONValue(node, type, depth, seed, results,
                     requestedPath, optimizedPath, optimizedLength,
                     fromReference, boxValues, materialized,
                     treatErrorsAsValues) {

    if ($error === type && !treatErrorsAsValues) {
        return onError(node, depth, results, requestedPath,
                       fromReference, boxValues);
    }

    var value = node && node.value;
    var requiresMaterializedToReport = type && value === undefined;

    if (requiresMaterializedToReport) {
        if (materialized) {
            debugger
            results.hasValue = true;
            return materializedAtom;
        }
        return undefined;
    }

    results.hasValue = true;

    // boxValues always clones the node
    if (boxValues) {
        return clone(node);
    }

    return value;
}
