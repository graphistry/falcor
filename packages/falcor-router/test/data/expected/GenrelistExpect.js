var $atom = require('./../../../src/support/types').$atom;
var falcor = require('@graphistry/falcor');
var $ref = falcor.Model.ref;

module.exports = function() {
    var retVal = {};
    [0, 1, 2].forEach(function(key) {
        retVal[key] = {
            genreLists: generateGenrelist(key)
        };
    });
    return retVal;
};

module.exports.generateGenrelist = generateGenrelist;

function generateGenrelist(id) {
    var genreLists = {};
    genreLists[id] = $ref(['videos', id]);

    return {
        jsonGraph: {genreLists: genreLists}
    };
}
