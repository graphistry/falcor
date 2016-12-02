var clone = require('./../support/clone');
var $ref = require('./../support/types').$ref;
var iterateKeySet = require('@graphistry/falcor-path-utils/lib/iterateKeySet');

/**
 * merges pathValue into a cache
 */
module.exports = function pathValueMerge(cache, pathValue) {

    var refs = [];
    var values = [];
    var invalidations = [];

    var path = pathValue.path;
    var value = pathValue.value;
    var type = value && value.$type;

    // The pathValue invalidation shape.
    if (pathValue.invalidated === true) {
        invalidations.push(path);
    }
    // If the type of pathValue is a valueType (reference or value) then merge
    // it into the jsonGraph cache.
    else {
        // References and reference sets. Needed for evaluating suffixes in all
        // three types, get, call and set.
        if (type === $ref) {
            refs.push({
                path: path,
                value: value.value
            });
        }
        // Values.  Needed for reporting for call.
        else {
            values.push(pathValue);
        }
        innerPathValueMerge(cache, pathValue);
    }

    return {
        values: values,
        references: refs,
        invalidations: invalidations
    };
};

function innerPathValueMerge(cache, pathValue) {
    var path = pathValue.path;
    var curr = cache;
    var next, key, cloned, outerKey, iteratorNote;
    var i, len;

    for (i = 0, len = path.length - 1; i < len; ++i) {
        outerKey = path[i];

        // Setup the memo and the key.
        if (outerKey && typeof outerKey === 'object') {
            iteratorNote = {};
            key = iterateKeySet(outerKey, iteratorNote);
        } else {
            key = outerKey;
            iteratorNote = false;
        }

        do {
            next = curr[key];

            if (!next) {
                next = curr[key] = {};
            }

            if (iteratorNote) {
                innerPathValueMerge(
                    next, {
                        path: path.slice(i + 1),
                        value: pathValue.value
                    });

                if (!iteratorNote.done) {
                    key = iterateKeySet(outerKey, iteratorNote);
                }
            }

            else {
                curr = next;
            }
        } while (iteratorNote && !iteratorNote.done);

        // All memoized paths need to be stopped to avoid
        // extra key insertions.
        if (iteratorNote) {
            return;
        }
    }


    // TODO: This clearly needs a re-write.  I am just unsure of how i want
    // this to look.  Plus i want to measure performance.
    outerKey = path[i];

    iteratorNote = {};
    key = iterateKeySet(outerKey, iteratorNote);

    do {

        cloned = clone(pathValue.value);
        curr[key] = cloned;

        if (!iteratorNote.done) {
            key = iterateKeySet(outerKey, iteratorNote);
        }
    } while (!iteratorNote.done);
}
