var errors = require('./../exceptions');
var $ref = require('./../support/types').$ref;
var catAndSlice = require('./../support/catAndSlice');
var iterateKeySet = require('@graphistry/falcor-path-utils/lib/iterateKeySet');

/**
 * Find paths from the input list that aren't in the JSON Graph.
 *
 * What it does:
 * - Any atom short-circuit / found value will be removed from the path.
 * - All paths will be exploded which means that collapse will need to be
 *   ran afterwords.
 * - Any missing path will be optimized as much as possible.
 */
module.exports = function optimizePathSets(cache, paths, maxRefFollow) {
    return paths.reduce(function(optimized, path) {
        optimizePathSet(cache, cache, path, 0, optimized, [], maxRefFollow, 0);
        return optimized;
    }, []);
};


/**
 * optimizes one pathSet at a time.
 */
function optimizePathSet(cache, cacheRoot, pathSet,
                         depth, out, optimizedPath, maxRefFollow, referenceCount) {

    // at missing, report optimized path.
    if (cache === undefined) {
        out[out.length] = catAndSlice(optimizedPath, pathSet, depth);
        return;
    }

    var typeofCache = cache === null ? 'undefined' : typeof cache;
    var type = typeofCache !== 'object' ? undefined : cache.$type;

    // all other sentinels are short circuited.
    // Or we found a primitive (which includes null)
    if (typeofCache !== 'object' || (type && type !== $ref)) {
        return;
    }

    // If the reference is the last item in the path then do not
    // continue to search it.
    if (type === $ref && depth === pathSet.length) {
        return;
    }

    var keySet = pathSet[depth];
    var nextDepth = depth + 1;
    var isBranchKey = nextDepth < pathSet.length;
    var iteratorNote = {};
    var key, next, nextOptimized;
    var optimizedPathLength = optimizedPath.length;

    key = iterateKeySet(keySet, iteratorNote);
    do {
        next = cache[key];
        type = next && next.$type;

        if (key !== null) {
            optimizedPath[optimizedPathLength] = key;
        }

        if (isBranchKey && type === $ref) {

            if (referenceCount > maxRefFollow) {
                throw new Error(errors.circularReference);
            }

            nextOptimized = [];
            var refPath = catAndSlice(next.value, pathSet, nextDepth);
            optimizePathSet(cacheRoot, cacheRoot, refPath, 0,
                            out, nextOptimized, maxRefFollow, referenceCount+1);
            optimizedPath.length = optimizedPathLength;
        } else {

            nextOptimized = optimizedPath;

            optimizePathSet(next, cacheRoot, pathSet, nextDepth,
                            out, nextOptimized, maxRefFollow, referenceCount);
            optimizedPath.length = optimizedPathLength;
        }

        if (!iteratorNote.done) {
            key = iterateKeySet(keySet, iteratorNote);
        }
    } while (!iteratorNote.done);
}

