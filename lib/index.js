"use strict";

var Model = require("./Model");

function falcor(opts) {
    return new Model(opts);
}

falcor.Model = Model;

module.exports = falcor;
