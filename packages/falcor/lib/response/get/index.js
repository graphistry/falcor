var ModelResponse = require("./../ModelResponse");
var GET_VALID_INPUT = require("./validInput");
var validateInput = require("./../../support/validateInput");
var GetResponse = require("./GetResponse");

/**
 * Performs a get on the cache and if there are missing paths
 * then the request will be forwarded to the get request cycle.
 * @private
 */
module.exports = function get(...paths) {
    // Validates the input.  If the input is not pathSets or strings then we
    // will onError.
    var out = validateInput(paths, GET_VALID_INPUT, "get");
    if (out !== true) {
        return new ModelResponse(function(o) {
            o.onError(out);
        });
    }

    return new GetResponse(this, paths);
};
