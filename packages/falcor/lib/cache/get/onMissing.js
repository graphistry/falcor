var isArray = Array.isArray;

module.exports = onMissing;

/* eslint-disable no-constant-condition */
function onMissing(path, depth, results,
                   requestedPath, requestedLength,
                   optimizedPath, optimizedLength) {

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

    var lastKeyIsNull = keyset === null;
    var missDepth = depth,
        missTotal = requestedLength, missingPath = requestedPath,
        missingPaths = results.requested || (results.requested = []);

    var isRequestedPath = true, index, count, mPath;

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
            missingPaths[missingPaths.length] = mPath;
        } else {
            missingPaths[missingPaths.length] = restPath;
        }

        // break after inserting both requested and optimized missing paths
        if (isRequestedPath = !isRequestedPath) {
            break;
        }

        missDepth = optimizedLength;
        missingPath = optimizedPath;
        missingPaths = results.missing || (results.missing = []);
        missTotal = optimizedLength + restPathCount - Number(lastKeyIsNull);
    } while (true);
}
/* eslint-enable */

function isEmptyKeySet(keyset) {

    // false if the keyset is a primitive
    if ("object" !== typeof keyset) {
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
    if ("number" !== typeof rangeEnd) {
        rangeEnd = from + (keyset.length || 0);
    }

    // false if trying to request incorrect or empty ranges
    // e.g. { from: 10, to: 0 } or { from: 5, length: 0 }
    return from >= rangeEnd;
}
