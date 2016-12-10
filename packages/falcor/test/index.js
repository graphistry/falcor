global.DEBUG = false;

var internalKeys = require('../lib/internal');

Object.keys(internalKeys).forEach(function(key) {
    global[key] = internalKeys[key];
});

describe('Falcor', function() {
    require('./Model.spec');
    require('./integration');
});

