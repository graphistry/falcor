var isArray = Array.isArray;
var pluckPath = require('./../../support/pluckPath');
var optimizePathSets = require('./../../cache/optimizePathSets');
var mCGRI = require('./../mergeCacheAndGatherRefsAndInvalidations');
var collapse = require('@graphistry/falcor-path-utils/lib/collapse');

module.exports = optimizePathsToExpand;

function optimizePathsToExpand(router, jsonGraph) {

    return function innerOptimizePathsToExpand(requestedPath, result) {

        var match = result.match;
        var value = result.value;
        var unhandled = result.unhandled;

        var suffix = match && match.suffix;
        var method = match && match.method;
        var suffixLen = suffix && suffix.length || 0;

        if (!isArray(value)) {
            value = [value];
        }

        var invsRefsAndValues = mCGRI(jsonGraph, value);

        var values = invsRefsAndValues.values;
        var messages = invsRefsAndValues.messages;
        var references = invsRefsAndValues.references;
        var invalidated = invsRefsAndValues.invalidations;

        var reportedPaths = [];
        var pathsToExpand = suffixLen <= 0 ? [] :
            // Merge the remaining suffix with remaining nextPaths
            references.map(function(reference) {
                return reference.value.concat(suffix);
            });

        // Alters the behavior of the expand
        messages.forEach(function(message) {
            var _method, path, value;
            // mutates the method type for the matcher
            if (_method = message.method) {
                method = _method;
            }
            else if (value = message.value) {
                values[values.length] = value;
                reportedPaths[reportedPaths.length] = value.path;
            }
            // Adds to reported and paths to expand
            else if (path = message.path) {
                pathsToExpand[pathsToExpand.length] = path;
                reportedPaths[reportedPaths.length] = path;
            }
            // Any invalidations that come down from a call
            else if (message.invalidations) {
                invalidated.push.apply(
                    invalidated, message.invalidations
                );
            }
            // We need to add the unhandledPaths to the jsonGraph response.
            else if (message.unhandledPaths) {
                unhandled = unhandled ? unhandled.concat(
                    message.unhandledPaths):
                    message.unhandledPaths ;
            }
        });

        var state = {
            method: method,
            values: values,
            references: references
        };

        if (unhandled && unhandled.length) {
            state.unhandled = unhandled;
        }

        // Explodes and collapse the tree to remove
        // redundants and get optimized next set of
        // paths to evaluate.
        if (pathsToExpand.length) {
            state.requested = collapse(optimizePathSets(
                jsonGraph, pathsToExpand, router.maxRefFollow
            ));
        }

        if (reportedPaths.length) {
            state.paths = reportedPaths;
        }

        if (invalidated.length) {
            state.invalidated = invalidated;
        }

        return state;
    }
}
