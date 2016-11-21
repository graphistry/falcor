var jsongMerge = require('./../cache/jsongMerge');
var pathValueMerge = require('./../cache/pathValueMerge');
var isJSONG = require('./../support/isJSONG');
var isMessage = require('./../support/isMessage');
module.exports = mergeCacheAndGatherRefsAndInvalidations;

/**
 * takes the response from an action and merges it into the
 * cache.  Anything that is an invalidation will be added to
 * the first index of the return value, and the inserted refs
 * are the second index of the return value.  The third index
 * of the return value is messages from the action handlers
 *
 * @param {Object} cache
 * @param {Array} jsongOrPVs
 */
function mergeCacheAndGatherRefsAndInvalidations(cache, jsongOrPVs) {

    var values = [];
    var messages = [];
    var references = [];
    var invalidations = [];

    // Go through each of the outputs from the route end point and separate out
    // each type of potential output.
    //
    // * There are values that need to be merged into the JSONGraphCache
    // * There are references that need to be merged and potentially followed
    // * There are messages that can alter the behavior of the
    //   recurseMatchAndExecute cycle.
    jsongOrPVs.forEach(function(jsongOrPV) {

        var refsAndValues, vals, refs, invs;

        if (isMessage(jsongOrPV)) {
            messages[messages.length] = jsongOrPV;
        }

        else if (isJSONG(jsongOrPV)) {
            refsAndValues = jsongMerge(cache, jsongOrPV);
            vals = refsAndValues.values;
            refs = refsAndValues.references;
            invs = refsAndValues.invalidations;
        }

        // Last option are path values.
        else {
            refsAndValues = pathValueMerge(cache, jsongOrPV);
            vals = refsAndValues.values;
            refs = refsAndValues.references;
            invs = refsAndValues.invalidations;
        }

        if (vals && vals.length) {
            values = values.concat(vals);
        }

        if (refs && refs.length) {
            references = references.concat(refs);
        }

        if (invs && invs.length) {
            invalidations = invalidations.concat(invs);
        }
    });

    return {
        invalidations: invalidations,
        references: references,
        messages: messages,
        values: values
    };
}
