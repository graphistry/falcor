"use strict";

var Model = require("./Model");
var jsong = require("falcor-json-graph");
var hasOwn = require("./support/hasOwn");
var internalKeys = require("./internal");
var ModelResponse = require("./response/ModelResponse");

function falcor(opts) {
    return new Model(opts);
}

falcor.Model = Model;

falcor.ref = Model.ref = jsong.ref;
falcor.atom = Model.atom = jsong.atom;
falcor.error = Model.error = jsong.error;

falcor.pathValue = Model.pathValue = jsong.pathValue;
falcor.pathInvalidation = Model.pathInvalidation = jsong.pathInvalidation;

Object.defineProperty(falcor, "Promise", {
    key: "Promise",
    set: function(PromiseCtor) {
        ModelResponse.Promise = PromiseCtor;
    },
    get: function() {
        return ModelResponse.Promise;
    }
});

if (typeof Promise === "function") {
    ModelResponse.Promise = Promise;
}


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
            return !hasOwn(internalKeys, key);
        });
};

module.exports = falcor;
