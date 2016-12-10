var typeofNumber = 'number';
var typeofObject = 'object';
var clone = require('../clone');
var onValueType = require('./onValueType');
var FalcorJSON = require('./json/FalcorJSON');
var NullInPathError = require('../../errors/NullInPathError');
var InvalidKeySetError = require('../../errors/InvalidKeySetError');
var materializedAtom = require('@graphistry/falcor-path-utils/lib/support/materializedAtom');

module.exports = onMaterializeFlatBuffer;

/* eslint-disable camelcase */
/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function onMaterializeFlatBuffer(json, path, depth, length,
                                 branchSelector, boxValues, results,
                                 requestedPath, optimizedPath, optimizedLength,
                                 fromReference, reportMissing, onMissing) {

    var type, refTarget;

    // ============ Check for base cases ================

    // If there's nowhere to go, we've reached a terminal node, or hit
    // the end of the path, stop now. Either build missing paths or report the value.
    if (undefined === path) {
        onValueType(undefined, undefined, json,
                    path, depth, undefined, results,
                    requestedPath, depth, optimizedPath,
                    optimizedLength, fromReference, undefined, undefined,
                    false, branchSelector, boxValues, false, reportMissing,
                    false, undefined, onMissing, undefined);
        return boxValues ? clone(materializedAtom) : undefined;
    }

    var f_meta, f_old_keys, f_new_keys;

    var nextKey,
        keyset, keyIsRange,
        keys = path['$keys'],
        nextDepth = depth + 1, rangeEnd,
        nextOptimizedLength = optimizedLength + 1;

    if (!json || typeofObject !== typeof json) {
        json = { __proto__: FalcorJSON.prototype, [f_meta_data]: f_meta = {
                [f_meta_version]: 0,
                [f_meta_abs_path]: optimizedPath.slice(
                    0, optimizedLength
                )
        }};
        if (branchSelector) {
            json = branchSelector(json);
        }
    } else if (!(f_meta = json[f_meta_data])) {
        json[f_meta_data] = f_meta = {
            [f_meta_version]: 0,
            [f_meta_abs_path]: optimizedPath.slice(
                0, optimizedLength
            )
        };
    } else {
        f_old_keys = f_meta[f_meta_keys];
        f_meta[f_meta_abs_path] = optimizedPath.slice(
            0, optimizedLength
        );
    }

    f_new_keys = {};

    var nextPath;
    var keysIndex = -1;
    var keysLength = keys.length;

    iteratingKeyset:
    while (++keysIndex < keysLength) {

        keyset = keys[keysIndex];
        nextPath = path[keysIndex];

        // If `null` appears before the end of the path, throw an error.
        // If `null` is at the end of the path, but the reference doesn't
        // point to a sentinel value, throw an error.
        //
        // Inserting `null` at the end of the path indicates the target of a ref
        // should be returned, rather than the ref itself. When `null` is the last
        // key, the path is lengthened by one, ensuring that if a ref is encountered
        // just before the `null` key, the reference is followed before terminating.
        if (null === keyset) {
            if (nextPath !== undefined) {
                throw new NullInPathError();
            }
            continue;
        }
        // If the keyset is a primitive value, we've found our `nextKey`.
        else if (typeofObject !== typeof keyset) {
            nextKey = keyset;
            rangeEnd = undefined;
            keyIsRange = false;
        }
        // If the Keyset isn't null or primitive, then it must be a Range.
        else {
            rangeEnd = keyset.to;
            nextKey = keyset.from || 0;
            if (typeofNumber !== typeof rangeEnd) {
                rangeEnd = nextKey + (keyset.length || 0) - 1;
            }
            if ((rangeEnd - nextKey) < 0) {
                break iteratingKeyset;
            }
            keyIsRange = true;
        }

        // Now that we have the next key, step down one level in the cache.
        do {

            requestedPath[depth] = nextKey;
            optimizedPath[optimizedLength] = nextKey;

            f_new_keys[nextKey] = true;
            if (f_old_keys && (nextKey in f_old_keys)) {
                f_old_keys[nextKey] = false;
            }

            // insert the materialized branch
            json[nextKey] = onMaterializeFlatBuffer(
                json[nextKey], nextPath, nextDepth,
                nextDepth, branchSelector, boxValues, results,
                requestedPath, optimizedPath, nextOptimizedLength,
                fromReference, reportMissing, onMissing
            );
        }
        // Re-enter the inner loop and continue iterating the Range, or exit
        // here if we encountered a Key.
        while (keyIsRange && ++nextKey <= rangeEnd);
    }

    f_meta['$code'] = '__incomplete__';
    f_meta[f_meta_keys] = f_new_keys;
    if (f_old_keys) {
        for (nextKey in f_old_keys) {
            if (f_old_keys[nextKey]) {
                delete json[nextKey];
            }
        }
    }

    // `json` will be a branch if any cache hits, or undefined if all cache misses
    return json;
}
