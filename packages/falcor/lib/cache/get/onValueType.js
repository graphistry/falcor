var isExpired = require('../isExpired');
var expireNode = require('../expireNode');
var lruPromote = require('../../lru/promote');

module.exports = onValueType;

function onValueType(node, type, json,
                     path, depth, seed, results,
                     requestedPath, requestedLength,
                     optimizedPath, optimizedLength,
                     fromReference, modelRoot, expired, expireImmediate,
                     branchSelector, boxValues, materialized, reportMissing,
                     treatErrorsAsValues, onValue, onMissing, onMaterialize) {

    var _reportMissing = reportMissing;
    var reportMaterialized = reportMissing;

    if (type) {
        if (isExpired(node, expireImmediate)) {
            if (!node[f_invalidated]) {
                expireNode(node, expired, modelRoot);
            }
        } else {
            lruPromote(modelRoot, node);
            if (node.value === undefined) {
                _reportMissing = false;
                reportMaterialized = materialized;
            } else {
                if (seed) {
                    if (fromReference) {
                        requestedPath[depth] = null;
                    }
                    return onValue(node, type, depth, seed, results,
                                   requestedPath, optimizedPath, optimizedLength,
                                   fromReference, boxValues, materialized, treatErrorsAsValues);
                }
                return undefined;
            }
        }
    }

    if (materialized) {
        seed && (results.hasValue = true);
    } else if (!reportMaterialized) {
        return undefined;
    }

    return onMissing(path, depth, results,
                     requestedPath, requestedLength, fromReference,
                     optimizedPath, optimizedLength, _reportMissing,
                     materialized, json, branchSelector,
                     boxValues, onMaterialize, modelRoot);
}
