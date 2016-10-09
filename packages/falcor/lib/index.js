"use strict";

var Model = require("./Model");
var FalcorJSON = require("./get/json/FalcorJSON");

function falcor(opts) {
    return new Model(opts);
}

falcor["Model"] = Model;
falcor["FalcorJSON"] = FalcorJSON;
falcor["toProps"] = FalcorJSON.prototype.toProps;

module.exports = falcor;
