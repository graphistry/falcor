module.exports = toJSONWithHashCodes;

/**
 * branchSelector = (
 *     nodeKey: String|Number|null,
 *     nodePath: Array|null,
 *     nodeVersion: Number,
 *     requestedPath: Array,
 *     requestedDepth: Number,
 *     referencePath: Array|null,
 *     pathToReference: Array|null
 * ) => Object { $__path?, $__refPath?, $__toReference? }
 */

function toJSONWithHashCodes(nodeKey = '$__cache__$',
                             nodePath = [],
                             nodeVersion = 0,
                             requestedPath = [],
                             requestedDepth = 0,
                             referencePath, pathToReference) {

    var json = {
        __proto__: JSONProto,
        $__key: nodeKey,
        $__path: nodePath,
        $__version: nodeVersion,
        $__keysPath: requestedPath,
        $__keyDepth: requestedDepth
    };

    if (referencePath && pathToReference) {
        json.$__refPath = referencePath;
        json.$__toReference = pathToReference;
    }

    return json;
}

var isArray = Array.isArray;
var JSONProto = Object.create(Object.prototype, Object.assign(
    {
        $__name: { value: 'falcor-node' },
        $__hash: {
            enumerable: false,
            get() {
                var $__hash__$ = this.$__hash__$;
                if ($__hash__$ === undefined) {
                    $__hash__$ = this.$__hash__$ = `${
                        getHashCode(`${
                        computeHashCodeForKeys('$__cache__$', this.$__path, 0)}${
                        computeHashCodeForKeys(this.$__key, this.$__keysPath, this.$__keyDepth)
                    }`)}`;
                }
                return $__hash__$;
            }
        }
    },
    arrayProtoMethods().reduce((jsonProto, methodName) => {
            var method = Array.prototype[methodName];
            jsonProto[methodName] = {
                writable: true, enumerable: false, value() {
                    return method.apply(this, arguments);
                }
            };
            return jsonProto;
        }, {})
    )
);

function arrayProtoMethods() {
    return [
        'concat', 'copyWithin', 'entries', 'every', 'fill', 'filter', 'find',
        'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'keys',
        'lastIndexOf', 'map', 'pop', 'push', 'reduce', 'reduceRight',
        'reverse', 'shift', 'slice', 'some', 'sort', 'splice', 'unshift', 'values'
    ];
}

function computeHashCodeForKeys(key, path, depth) {

    var code = `${getHashCode(`${key}`)}`;

    if (depth === path.length) {
        return code;
    }

    var nextDepth = depth + 1;
    var keyset, keysetIndex = -1, keysetLength = 0;
    var nextKey, keyIsRange, rangeEnd, keysOrRanges;

    keyset = path[depth];

    if (keyset === null) {
        return code;
    }

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
            code = `${
                getHashCode(`${code}${
                computeHashCodeForKeys(nextKey, path, nextDepth)
            }`)}`;
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

    return code;
}

function getHashCode(str) {
    var hash = 5381, i = str.length;
    while (i) {
        hash = (hash * 33) ^ str.charCodeAt(--i);
    }
    // JavaScript does bitwise operations (like XOR, above) on 32-bit signed
    // integers. Since we want the results to be always positive, convert the
    // signed int to an unsigned by doing an unsigned bitshift.
    return hash >>> 0;
}
