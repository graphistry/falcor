var collapse = require('@graphistry/falcor-path-utils/lib/collapse');

module.exports = toJSONGraphEnvelope;

function toJSONGraphEnvelope(jsonGraphEnvelope) {

    var paths = jsonGraphEnvelope.paths;
    var jsonGraph = jsonGraphEnvelope.jsonGraph;
    var invalidated = jsonGraphEnvelope.invalidated;

    jsonGraphEnvelope = {};

    if (jsonGraph) {
        jsonGraphEnvelope.jsonGraph = jsonGraph;
    }

    if (paths && paths.length) {
        jsonGraphEnvelope.paths = collapse(paths);
    }

    if (invalidated && invalidated.length) {
        jsonGraphEnvelope.invalidated = collapse(invalidated);
    }

    return jsonGraphEnvelope;
}
