var template = require('./template');
var parser = require('./paths-parser');
var flatBufferToPaths = require('@graphistry/falcor-path-utils').flatBufferToPaths;

module.exports = toPaths;

function toPaths() {
    return flatBufferToPaths(parser.parse(template.apply(null, arguments)));
}
