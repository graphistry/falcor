var isArray = Array.isArray;
var nullBuffer = { '$keys': [null], '$keysMap': { 'null': 0 } };
var flatBufferToPaths = require('./flatBufferToPaths');

module.exports = toFlatBuffer;

function toFlatBuffer(paths, seed) {
    return paths.reduce(function(seed, path) {
        if (isArray(path)) {
            return pathToFlatBuffer(seed, path, 0, path.length);
        } else if (isArray(path.$keys)) {
            return toFlatBuffer(flatBufferToPaths(path), seed);
        }
        return seed;
    }, seed || {});
}

function pathToFlatBuffer(seed, path, depth, length) {

    if (depth === length) {
        return undefined;
    }

    seed = seed || {};
    var keys = seed['$keys'] || (seed['$keys'] = []);
    var keysMap = seed['$keysMap'] || (seed['$keysMap'] = {});
    var keysIndex = -1;

    var keyset, keysetIndex = -1, keysetLength = 0;
    var node, next, nextKey, nextDepth = depth + 1,
        rangeEnd, keysOrRanges;

    keyset = path[depth];

    if (keyset === null) {
        return nullBuffer;
    }

    iteratingKeyset: do {
        // If the keyset is a primitive value, we've found our `nextKey`.
        if ('object' !== typeof keyset) {
            nextKey = keyset;
            if ('undefined' === typeof (keysIndex = keysMap[nextKey])) {
                keysIndex = keys.length;
            }
            keys[keysIndex] = nextKey;
            keysMap[nextKey] = keysIndex;
            next = pathToFlatBuffer(seed[keysIndex], path, nextDepth, length);
            if (next !== undefined) {
                seed[keysIndex] = next;
            }
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
            if ('number' !== typeof rangeEnd) {
                rangeEnd = nextKey + (keyset.length || 0) - 1;
            }
            if ((rangeEnd - nextKey) < 0) {
                break iteratingKeyset;
            }
            keyset = { from: nextKey, length: rangeEnd - nextKey + 1 };
            nextKey = '[' + nextKey + '..' + rangeEnd + ']';
            if ('undefined' === typeof (keysIndex = keysMap[nextKey])) {
                keysIndex = keys.length;
            }
            keys[keysIndex] = keyset;
            keysMap[nextKey] = keysIndex;
            next = pathToFlatBuffer(seed[keysIndex], path, nextDepth, length);
            if (next !== undefined) {
                seed[keysIndex] = next;
            }
        }

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
