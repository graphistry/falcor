global.DEBUG = false;

var internalKeyDefinitions = require('../internalKeyDefinitions');
var internalKeys = internalKeyDefinitions();

Object.keys(internalKeys).forEach(function(key) {
    global[key] = internalKeys[key];
});

describe("Falcor", function() {
    require("./Model.spec.js");
    require("./integration");
});

