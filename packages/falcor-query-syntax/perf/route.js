var benchmark = require('benchmark');
var template = require('../lib/template');
var routeParser = require('../lib/route-parser');
var toRoutes = require('../lib/toRoutes');

function pushHandler() {};
var getHandler = { get: function() {} };

module.exports = (new benchmark.Suite('Route'))
    .add('routeParser', function() {
        routeParser.parse(template`{
            genreLists: {
                push: ${ pushHandler },
                length: ${ getHandler },
                [{ integers: lists }]: {
                    [name, rating]: ${ getHandler },
                    titles: {
                        length: ${ getHandler },
                        [{ keys }]: {
                            [name, rating, box-shot]: ${ getHandler }
                        }
                    }
                }
            }
        }`[0]);
    })
    .add('toRoutes template', function() {
        toRoutes`{
            genreLists: {
                push: ${ pushHandler },
                length: ${ getHandler },
                [{ integers: lists }]: {
                    [name, rating]: ${ getHandler },
                    titles: {
                        length: ${ getHandler },
                        [{ keys }]: {
                            [name, rating, box-shot]: ${ getHandler }
                        }
                    }
                }
            }
        }`
    });
