var isArray = Array.isArray;
var nullTerminator = require('./support/nullTerminator');

/**
 * @param {Array} paths -
 * @returns {Object} -
 */
module.exports = function toTree(paths) {
    return paths.reduce(function(acc, path) {
        return innerToTree(acc, path, 0, path.length);
    }, {});
};

function innerToTree(seed, path, depth, length) {

    if (depth === length) {
        return true;
    }

    var keyset, keysetIndex = -1, keysetLength = 0;
    var node, next, nextKey, nextDepth = depth + 1,
        keyIsRange, rangeEnd, keysOrRanges;

    keyset = path[depth];

    if (keyset === null) {
        return nullTerminator;
    }

    seed = seed || {};

    iteratingKeyset: do {
        // If the keyset is a primitive value, we've found our `nextKey`.
        if ('object' !== typeof keyset) {
            nextKey = keyset;
            rangeEnd = undefined;
            keyIsRange = false;
        }
        // If we encounter a Keyset, either iterate through the Keys and Ranges,
        // or throw an error if we're already iterating a Keyset. Keysets cannot
        // contain other Keysets.
        else if (isArray(keyset)) {
            // If we've already encountered an Array keyset, throw an error.
            if (keysOrRanges !== undefined) {
                break iteratingKeyset;
            }
            keysetIndex = 0;
            keysOrRanges = keyset;
            keysetLength = keyset.length;
            // If an Array of keys or ranges is empty, terminate the graph walk
            // and return the json constructed so far. An example of an empty
            // Keyset is: ['lolomo', [], 'summary']. This should short circuit
            // without building missing paths.
            if (0 === keysetLength) {
                break iteratingKeyset;
            }
            // Assign `keyset` to the first value in the Keyset. Re-entering the
            // outer loop mimics a singly-recursive function call.
            keyset = keysOrRanges[keysetIndex];
            continue iteratingKeyset;
        }
        // If the Keyset isn't a primitive or Array, then it must be a Range.
        else {
            rangeEnd = keyset.to;
            nextKey = keyset.from || 0;
            if ("number" !== typeof rangeEnd) {
                rangeEnd = nextKey + (keyset.length || 0) - 1;
            }
            if ((rangeEnd - nextKey) < 0) {
                break iteratingKeyset;
            }
            keyIsRange = true;
        }

        do {
            if (nextDepth === length) {
                seed[nextKey] = null;
            } else {
                node = seed[nextKey];
                next = innerToTree(node, path, nextDepth, length);
                if (!next) {
                    seed[nextKey] = null;
                } else if (!node) {
                    seed[nextKey] = next;
                }
            }
        }
        // Re-enter the inner loop and continue iterating the Range, or exit
        // here if we encountered a Key.
        while (keyIsRange && ++nextKey <= rangeEnd);

        // If we've exhausted the Keyset (or never encountered one at all),
        // exit the outer loop.
        if (++keysetIndex === keysetLength) {
            break iteratingKeyset;
        }

        // Otherwise get the next Key or Range from the Keyset and re-enter the
        // outer loop from the top.
        keyset = keysOrRanges[keysetIndex];
    } while (true);

    return seed;
}
