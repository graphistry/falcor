var $atom = require("../../types/atom");
var isExpired = require("../isExpired");
var expireNode = require("../expireNode");
var lruPromote = require("../../lru/promote");

module.exports = onValueType;

function onValueType(node, type,
                     path, depth, seed, results,
                     requestedPath, requestedLength,
                     optimizedPath, optimizedLength,
                     fromReference, modelRoot, expired,
                     boxValues, materialized, hasDataSource,
                     treatErrorsAsValues, onValue, onMissing) {

    if (!node || !type) {
        if (materialized && !hasDataSource) {
            if (seed) {
                results.hasValue = true;
                return { $type: $atom };
            }
            return undefined;
        } else {
            return onMissing(path, depth, results,
                             requestedPath, requestedLength,
                             optimizedPath, optimizedLength);
        }
    } else if (isExpired(node)) {
        if (!node[ƒ_invalidated]) {
            expireNode(node, expired, modelRoot);
        }
        return onMissing(path, depth, results,
                         requestedPath, requestedLength,
                         optimizedPath, optimizedLength);
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
