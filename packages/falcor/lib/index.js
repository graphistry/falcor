"use strict";

var Model = require("./Model");
var JSONProto = require("./get/json/JSONProto");

function falcor(opts) {
    return new Model(opts);
}

falcor["Model"] = Model;
falcor["JSONProto"] = JSONProto;
falcor["toProps"] = JSONProto.prototype.toProps;

module.exports = falcor;
