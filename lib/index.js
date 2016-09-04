"use strict";

var Model = require("./Model");
var internalKeys = require("./internal");
var QL = require("@graphistry/falcor-query-syntax");
var jsong = require("@graphistry/falcor-json-graph");

function falcor(opts) {
    return new Model(opts);
}

Model.QL = QL;
Model.prototype.QL = QL;

falcor.QL = QL;
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
