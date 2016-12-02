var isArray = Array.isArray;
var clone = require('./../support/clone');
var $ref = require('./../support/types').$ref;

/**
 * merges jsong into a seed
 */
module.exports = function jsongMerge(cache, jsongEnv) {

    var paths = [];
    var values = [];
    var references = [];
    var rPath = [], oPath = [];
    var graph = jsongEnv.jsonGraph;
    var invalidations = jsongEnv.invalidated;

    jsongEnv.paths.forEach(function(path) {
        walkPathAndBuildOutput(paths, values, references,
                               graph, graph, cache, path, 0,
                               rPath, path.length, oPath, 0);
    });

    return {
        paths: paths,
        values: values,
        references: references,
        invalidations: invalidations
    };
};

/* eslint-disable camelcase */
/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function walkPathAndBuildOutput(paths, values, references,
                                root, node, seed, path, depth,
                                requestedPath, requestedLength,
                                optimizedPath, optimizedLength) {

    var ref, type, refTarget, hasValue = false;

    // ============ Check for base cases ================

    if (node == null && depth < requestedLength) {
        return;
    }
    // If there's nowhere to go, we've reached a terminal node, or hit
    // the end of the path, stop now. Either build missing paths or report the value.
    else if (node == null || (
             type = node.$type) || (
             depth === requestedLength)) {

        paths.push(requestedPath = requestedPath.slice(0, depth));

        // NOTE: If we have found a reference at our cloning position
        // and we have resolved our path then add the reference to
        // the unfulfilledRefernces.
        if (type === $ref) {
            references.push({ path: requestedPath, value: node.value });
        } else {
            // We are dealing with a value.  We need this for call
            // Call needs to report all of its values into the jsongCache
            // and paths.
            values.push({ path: requestedPath, value: type ? node.value : node });
        }

        inlineValue(clone(node), optimizedPath, optimizedLength, seed);

        return true;
    }

    var next, nextKey,
        fromReference,
        keyset, keyIsRange,
        nextDepth = depth + 1,
        rangeEnd, keysOrRanges,
        keysetIndex = -1, keysetLength = 0,
        nextOptimizedLength, nextOptimizedPath,
        optimizedLengthNext = optimizedLength + 1;

    keyset = path[depth];

    // If `null` appears before the end of the path, throw an error.
    // If `null` is at the end of the path, but the reference doesn't
    // point to a sentinel value, throw an error.
    //
    // Inserting `null` at the end of the path indicates the target of a ref
    // should be returned, rather than the ref itself. When `null` is the last
    // key, the path is lengthened by one, ensuring that if a ref is encountered
    // just before the `null` key, the reference is followed before terminating.
    if (null === keyset) {
        if (nextDepth < requestedLength) {
            throw new Error('NullInPathError');
        }
        return false;
    }

    // Iterate over every key in the keyset. This loop is perhaps a bit clever,
    // but we do it this way because this is a performance-sensitive code path.
    // This loop simulates a recursive function if we encounter a Keyset that
    // contains Keys or Ranges. This is accomplished by a nifty dance between an
    // outer loop and an inner loop.
    //
    // The outer loop is responsible for identifying if the value at this depth
    // is a Key, Range, or Keyset. If it encounters a Keyset, the `keysetIndex`,
    // `keysetLength`, and `keysOrRanges` variables are assigned and the outer
    // loop restarts. If it encounters a Key or Range, `nextKey`, `keyIsRange`,
    // and `rangeEnd` are assigned values which signal whether the inner loop
    // should iterate a Range or exit after the first run.
    //
    // The inner loop steps `nextKey` one level down in the cache. If a Range
    // was encountered in the outer loop, the inner loop will iterate until the
    // Range has been exhausted. If a Key was encountered, the inner loop exits
    // after the first execution.
    //
    // After the inner loop exits, the outer loop iterates the `keysetIndex`
    // until the Keyset is exhausted. `keysetIndex` and `keysetLength` are
    // initialized to -1 and 0 respectively, so if a Keyset wasn't encountered
    // at this depth in the path, then the outer loop exits after one execution.

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
                throw new Error('InvalidKeySetError: ' +
                    JSON.stringify(path) + ' ' +
                    JSON.stringify(keysOrRanges)
                );
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
            keyIsRange = true;
        }

        // Now that we have the next key, step down one level in the cache.
        do {
            fromReference = false;
            nextOptimizedPath = optimizedPath;
            nextOptimizedLength = optimizedLengthNext;

            next = node[nextKey];
            requestedPath[depth] = nextKey;
            optimizedPath[optimizedLength] = nextKey;

            // If we encounter a ref, inline the reference target and continue
            // evaluating the path.
            if (next && nextDepth < requestedLength && next.$type === $ref) {

                // Retrieve the reference target and next referenceContainer (if
                // this reference points to other references) and continue
                // following the path. If the reference resolves to a missing
                // path or leaf node, it will be handled in the next call to
                // walkPath.
                refTarget = getReferenceTarget(root, ref = next, seed);

                next = refTarget[0];
                fromReference = true;
                nextOptimizedPath = refTarget[1];
                nextOptimizedLength = nextOptimizedPath.length;
                refTarget[0] = refTarget[1] = undefined;
            }

            // Continue following the path
            var hasNextValue = walkPathAndBuildOutput(
                paths, values, references,
                root, next, seed, path, nextDepth,
                requestedPath, requestedLength,
                nextOptimizedPath, nextOptimizedLength
            );

            hasValue = hasValue || hasNextValue;

            if (hasNextValue && fromReference) {
                // Write the cloned ref value into the jsonGraph at the
                // optimized path. JSONGraph must always clone references.
                inlineValue(clone(ref), optimizedPath, optimizedLengthNext, seed);
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

    return hasValue;
}
/* eslint-enable */

var arr = new Array(2);

function getReferenceTarget(root, ref, seed) {

    var key, type, depth = 0,
        node = root, path = ref.value,
        copy = path, length = path.length;

    do {
        if (undefined === (node = node[path[depth++]])) {
            break;
        } else if (depth === length) {
            // If the reference points to another ref, follow the new ref
            // by resetting the relevant state and continuing from the top.
            if (node.$type === $ref) {
                inlineValue(clone(node), path, length, seed);
                depth = 0;
                ref = node;
                node = root;
                path = copy = ref.value;
                length = path.length;
                continue;
            }
            break;
        } else if (undefined !== node.$type) {
            break;
        }
    } while (true);

    if (depth < length && undefined !== node) {
        length = depth;
    }

    depth = -1;
    path = new Array(length);
    while (++depth < length) {
        path[depth] = copy[depth];
    }

    arr[0] = node;
    arr[1] = path;

    return arr;
}

function inlineValue(node, path, length, seed) {

    var key, depth = 0, prev, curr = seed;

    do {
        prev = curr;
        key = path[depth++];
        if (depth >= length) {
            curr = prev[key] = node;
            break;
        }
        curr = prev[key] || (prev[key] = {});
    } while (true);

    return curr;
}
