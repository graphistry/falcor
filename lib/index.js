"use strict";

function falcor(opts) {
    return new Model(opts);
}

var Model = require("./Model");
var jsong = require("falcor-json-graph");
var internalKeys = require("./internal");

falcor.Model = Model;
falcor.ref = Model.ref = jsong.ref;
falcor.atom = Model.atom = jsong.atom;
falcor.error = Model.error = jsong.error;

falcor.pathValue = Model.pathValue = jsong.pathValue;
falcor.pathInvalidation = Model.pathInvalidation = jsong.pathInvalidation;

/**
 * A filtering method for keys from a falcor json response.  The only gotcha
 * to this method is when the incoming json is undefined, then undefined will
 * be returned.
 *
 * @public
 * @param {Object} json - The json response from a falcor model.
 * @returns {Array} - the keys that are in the model response minus the deref
 * _private_ meta data.
 */
falcor.keys = function getJSONKeys(json) {
    if (!json) {
        return undefined;
    }

    return Object.
        keys(json).
        filter(function(key) {
            return !(key in internalKeys);
        });
};

module.exports = falcor;
