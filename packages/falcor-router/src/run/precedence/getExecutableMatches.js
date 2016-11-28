/* eslint-disable max-len */
var collapse = require('@graphistry/falcor-path-utils/lib/collapse');
var stripPath = require('./../../operations/strip/stripPath');
var hasIntersection = require('./../../operations/matcher/intersection/hasIntersection');
/* eslint-enable max-len */

/**
 * takes in the set of ordered matches and pathSet that got those matches.
 * From there it will give back a list of matches to execute.
 */
module.exports = getExecutableMatches;

function getExecutableMatches(optimized, matches) {

    var matchesIndex = 0;
    var matchesCount = matches.length;
    var remainingPaths = [optimized];
    var executableMatches = [];

    do {
        var match = matches[matchesIndex];
        var availablePaths = remainingPaths;

        remainingPaths = [];

        if (matchesIndex > 0) {
            availablePaths = collapse(availablePaths);
        }

        // For every available path, check for intersection with the
        // matched virtual path. When the path intersects, strip and
        // replace any relative complements, and add them to the
        // remainingPaths.

        var availablePathsIndex = -1;
        var availablePathsCount = availablePaths.length;
        while (++availablePathsIndex < availablePathsCount) {

            var path = availablePaths[availablePathsIndex];

            if (hasIntersection(path, match.virtual)) {

                var stripResults = stripPath(path, match.virtual);

                remainingPaths = remainingPaths.concat(stripResults[1]);

                executableMatches[executableMatches.length] = {
                    match: match, path: stripResults[0]
                };
            }
        }
    } while (++matchesIndex < matchesCount && remainingPaths.length > 0);

    return {
        executableMatches: executableMatches,
        // Report the remaining paths as unhandled.
        unhandledPaths: remainingPaths &&
            remainingPaths.length &&
            remainingPaths || undefined
    };
}



