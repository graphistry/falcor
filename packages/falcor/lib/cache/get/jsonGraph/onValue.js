var typeofObject = 'object';
var clone = require('../../clone');
var inlineValue = require('./inlineValue');

module.exports = onJSONGraphValue;

function onJSONGraphValue(node, type, depth, seed, results,
                          requestedPath, optimizedPath, optimizedLength,
                          fromReference, boxValues, materialized) {

    var value = node.value;

    // boxValues always clones the node
    if (boxValues || !(
        /**
         * JSON Graph should always clone:
         * - refs
         * - errors
         * - atoms we didn't create
         * - atoms we created to wrap Objects
         **/
        $ref !== type &&
        $error !== type &&
        node[f_wrapped_value] &&
        typeofObject !== typeof value)) {
        value = clone(node);
    }

    results.hasValue = true;
    inlineValue(value, optimizedPath, optimizedLength, seed);
    (seed.paths || (seed.paths = [])).push(
        requestedPath.slice(0, depth + !!fromReference) // depth + 1 if fromReference === true
    );

    return value;
}
