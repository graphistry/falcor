var template = require('./template');
var Parser = require('./paths-parser');
var flatBufferToPaths = require('@graphistry/falcor-path-utils/lib/flatBufferToPaths');

module.exports = toPaths;

function QL() {
    return Parser.parse.apply(Parser, template.apply(null, arguments));
}

function toPaths() {
    return flatBufferToPaths(QL.apply(null, arguments));
}

toPaths.QL = QL;
toPaths.Parser = Parser;
