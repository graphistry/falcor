var benchmark = require('benchmark');
var template = require('../lib/template');
var routeParser = require('../lib/route-parser');
var toRoutes = require('../lib/toRoutes');

module.exports = (new benchmark.Suite('Route'))
    .add('routeParser', function() {
        routeParser.parse(template`{
            genreLists: {
                length,
                [{ integers: lists }]: {
                    name,
                    rating,
                    titles: {
                        length,
                        [{keys}]: {
                            name,
                            rating,
                            box-shot
                        }
                    }
                }
            }
        }`);
    })
    .add('toRoutes template', function() {
        toRoutes`{
            genreLists: {
                length,
                [{ integers: lists }]: {
                    name,
                    rating,
                    titles: {
                        length,
                        [{keys}]: {
                            name,
                            rating,
                            box-shot
                        }
                    }
                }
            }
        }`
    });
