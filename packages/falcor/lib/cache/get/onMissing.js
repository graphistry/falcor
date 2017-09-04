var isArray = Array.isArray;

module.exports = onMissing;

/* eslint-disable no-constant-condition */
function onMissing(path, depth, results,
                   requestedPath, requestedLength, fromReference,
                   optimizedPath, optimizedLength, reportMissing,
                   reportMaterialized, json, branchSelector,
                   boxValues, onMaterialize, modelRoot) {

    if (!reportMissing && !reportMaterialized) {
        return;
    }

    var keyset,
        restPathIndex = -1,
        restPathCount = requestedLength - depth,
        restPath = restPathCount && new Array(restPathCount) || undefined;

    while (++restPathIndex < restPathCount) {
        keyset = path[restPathIndex + depth];
        if (isEmptyKeySet(keyset)) {
            return;
        }
        restPath[restPathIndex] = keyset;
    }

    var index, count, mPath;
    var lastKeyIsNull = keyset === null;
    var isRequestedPath = reportMissing;
    var missDepth, missTotal, missingPath, missingPaths;

    if (!reportMissing) {
        missDepth = optimizedLength;
        missingPath = optimizedPath;
        missTotal = optimizedLength + restPathCount - Number(lastKeyIsNull);
    } else {
        missDepth = depth;
        missTotal = requestedLength;
        missingPath = requestedPath;
        missingPaths = results.requested || (results.requested = []);
    }

    do {
        if (restPathCount < requestedLength || !isRequestedPath) {
            index = -1;
            count = missDepth;
            mPath = new Array(missTotal);
            while (++index < count) {
                mPath[index] = missingPath[index];
            }
            restPathIndex = -1;
            while (index < missTotal) {
                mPath[index++] = restPath[++restPathIndex];
            }
        }

        // break after inserting both requested and optimized missing paths
        if (isRequestedPath = !isRequestedPath) {
            if (reportMissing) {
                missingPaths[missingPaths.length] = mPath;
            }
            break;
        }

        missingPaths[missingPaths.length] = mPath || restPath;

        missDepth = optimizedLength;
        missingPath = optimizedPath;
        missingPaths = results.missing || (results.missing = []);
        missTotal = optimizedLength + restPathCount - Number(lastKeyIsNull);
    } while (true);

    if (reportMaterialized) {
        return onMaterialize(json, mPath, missDepth, missTotal, branchSelector, boxValues, modelRoot, reportMissing);
    }
}
/* eslint-enable */

function isEmptyKeySet(keyset) {

    // false if the keyset is a primitive
    if ('object' !== typeof keyset) {
        return false;
    } else if (keyset === null) {
        return false;
    }

    if (isArray(keyset)) {
        // return true if the keyset is an empty array
        return keyset.length === 0;
    }

    var rangeEnd = keyset.to,
        from = keyset.from || 0;
    if ('number' !== typeof rangeEnd) {
        rangeEnd = from + (keyset.length || 0);
    }

    // false if trying to request incorrect or empty ranges
    // e.g. { from: 10, to: 0 } or { from: 5, length: 0 }
    return from >= rangeEnd;
}
