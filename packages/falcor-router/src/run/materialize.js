var pathValueMerge = require('./../cache/pathValueMerge');
var materializedAtom = require('@graphistry/falcor-path-utils/lib/support/materializedAtom');

/**
 * given a set of paths and a jsonGraph envelope, materialize missing will
 * crawl all the paths to ensure that they have been fully filled in.  The
 * paths that are missing will be filled with materialized atoms.
 */
module.exports = function materializeMissing(paths, jsongEnv) {

    var jsonGraph = jsongEnv.jsonGraph;

    // insert atoms of undefined
    paths.forEach(function(path) {
        pathValueMerge(jsonGraph, {
            path: path, value: materializedAtom
        });
    });

    return jsongEnv;
}
