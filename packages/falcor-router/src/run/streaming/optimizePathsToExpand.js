var pluckPath = require('./../../support/pluckPath');
var optimizePathsToExpand = require('../aggregate/optimizePathsToExpand');

module.exports = optimizePathsToExpandOrEmitValues;

function optimizePathsToExpandOrEmitValues(router, jsonGraph) {

    var innerOptimizePathsToExpand = optimizePathsToExpand(router, jsonGraph);

    return function innerOptimizePathsToExpandOrEmitValues(requestedPath, result) {

        var state = innerOptimizePathsToExpand(requestedPath, result);

        var paths = state.paths;
        var values = state.values;
        var references = state.references;
        var invalidated = state.invalidated;

        state.emitValues = (
            values && values.length > 0) || (
            invalidated && invalidated.length > 0);

        if (values && values.length) {
            !paths && (
                paths = state.paths = values.map(pluckPath)) || (
                paths.push.apply(paths, values.map(pluckPath)));
        }

        if (references && references.length) {
            !paths && (
                paths = state.paths = references.map(pluckPath)) || (
                paths.push.apply(paths, references.map(pluckPath)));
        }

        return state;
    }
}
