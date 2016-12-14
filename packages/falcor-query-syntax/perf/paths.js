var benchmark = require('benchmark');
var template = require('../lib/template');
var pathsParser = require('../lib/paths-parser');
var toPaths = require('../lib/toPaths');
var range = { from: 0, to: 9 };

module.exports = (new benchmark.Suite('Paths'))
    .add('pathsParser', function() {
        pathsParser.parse(template`{
            genreLists: {
                length,
                [10...1]: {
                    name,
                    rating,
                    color: { ${null} },
                    titles: {
                        length,
                        [${range}]: {
                            name,
                            rating,
                            box-shot
                        }
                    }
                }
            }
        }`[0]);
    })
    .add('toPaths template', function() {
        toPaths`{
            genreLists: {
                length,
                [10...1]: {
                    name,
                    rating,
                    color: { ${null} },
                    titles: {
                        length,
                        [${range}]: {
                            name,
                            rating,
                            box-shot
                        }
                    }
                }
            }
        }`;
    });
