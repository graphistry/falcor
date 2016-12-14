var template = require('./template');
var Parser = require('./route-parser');
var flatBufferToRoutes = require('@graphistry/falcor-path-utils/lib/flatBufferToRoutes');

module.exports = toRoutes;

function toRoutes() {
    return flatBufferToRoutes(
        Parser.parse.apply(
            Parser, template.apply(null, arguments)));
}

toRoutes.Parser = Parser;
