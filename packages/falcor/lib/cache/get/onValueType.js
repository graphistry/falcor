var isExpired = require("../isExpired");
var expireNode = require("../expireNode");
var lruPromote = require("../../lru/promote");

module.exports = onValueType;

function onValueType(node, type, json,
                     path, depth, seed, results,
                     requestedPath, requestedLength,
                     optimizedPath, optimizedLength,
                     fromReference, modelRoot, expired, expireImmediate,
                     branchSelector, boxValues, materialized, reportMissing,
                     treatErrorsAsValues, onValue, onMissing) {

    var reportMaterialized = materialized;

    if (!node || !type) {
        if (materialized) {
            reportMaterialized = true;
            seed && (results.hasValue = true);
        }
        return onMissing(path, depth, results,
                         requestedPath, requestedLength, fromReference,
                         optimizedPath, optimizedLength, reportMissing,
                         json, reportMaterialized, branchSelector);
    } else if (isExpired(node, expireImmediate)) {
        if (!node[ƒ_invalidated]) {
            expireNode(node, expired, modelRoot);
        }
        return onMissing(path, depth, results,
                         requestedPath, requestedLength, fromReference,
                         optimizedPath, optimizedLength, reportMissing,
                         json, reportMaterialized, branchSelector);
    }

    lruPromote(modelRoot, node);

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
