var template = require('./template');
var Parser = require('./paths-parser');
var flatBufferToPaths = require('@graphistry/falcor-path-utils/lib/flatBufferToPaths');

module.exports = toPaths;

function toPaths() {
    return flatBufferToPaths(
        Parser.parse.apply(
            Parser, template.apply(null, arguments)));
}

toPaths.Parser = Parser;
