var template = require('./template');
var Parser = require('./route-parser');
var flatBufferToRoutes = require('@graphistry/falcor-path-utils/lib/flatBufferToRoutes');

module.exports = toRoutes;

function QL() {
    return Parser.parse.apply(Parser, template.apply(null, arguments));
}

function toRoutes() {
    return flatBufferToRoutes(QL.apply(null, arguments));
}

toRoutes.QL = QL;
toRoutes.Parser = Parser;
