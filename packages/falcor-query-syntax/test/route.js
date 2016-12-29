var expect = require('chai').expect;
var toRoutes = require('../lib/toRoutes');
var template = require('../lib/template');
var routeParser = require('../lib/route-parser');
var _keys = String.fromCharCode(30) + 'keys';
var _ranges = String.fromCharCode(30) + 'ranges';
var _integers = String.fromCharCode(30) + 'integers';

describe('Route', function() {

    var getHandler = { get: function() {} };
    var setHandler = { set: function() {} };

    it('should create multiple routes', function() {

        var routes = toRoutes`{
            genreLists: {
                length: ${ getHandler },
                my-list: ${ setHandler }
            }
        }`;

        expect(pluckRoute(routes)).to.deep.equal([
            ['genreLists', 'length'],
            ['genreLists', 'my-list']
        ]);

        expect(routes[0].get).to.equal(getHandler.get);
        expect(routes[1].set).to.equal(setHandler.set);
    });
    it('should accept functions as route handler factories', function() {

        function pushHandler() {};

        function pushHandlerFactory(route) {
            expect(route).to.deep.equal(
                ['genreLists', 'push']
            );
            return { call: pushHandler };
        }

        var routes = toRoutes`{
            genreLists: {
                push: ${ pushHandlerFactory }
            }
        }`;

        expect(pluckRoute(routes)).to.deep.equal([
            ['genreLists', 'push']
        ]);

        expect(typeof routes[0]).to.equal('object');
        expect(routes[0].call).to.equal(pushHandler);
        expect(routes[0].call.name).to.equal('pushHandler');
    });
    it('should tolerate dangling commas', function() {

        expect(pluckRoute(toRoutes`{
            genreLists: {
                [{ keys },]: {
                    [name, rating,]: ${ getHandler },
                },
            },
        }`)).to.deep.equal([
            ['genreLists',{
                type: _keys, named: false },
            ['name', 'rating']]
        ]);

        expect(pluckRoute(toRoutes`{
            genreLists: {
                [{ keys: indexKeys },]: {
                    [name, rating,]: ${ getHandler },
                },
            },
        }`)).to.deep.equal([
            ['genreLists',{
                type: _keys, name: 'indexKeys', named: true },
            ['name', 'rating']]
        ]);
    });

    it('should parse keys route token', function() {

        expect(pluckRoute(toRoutes`{
            genreLists: {
                [{ keys }]: {
                    [name, rating]: ${ getHandler }
                }
            }
        }`)).to.deep.equal([
            ['genreLists',{
                type: _keys, named: false },
            ['name', 'rating']]
        ]);

        expect(pluckRoute(toRoutes`{
            genreLists: {
                [{ keys: indexKeys }]: {
                    [name, rating]: ${ getHandler }
                }
            }
        }`)).to.deep.equal([
            ['genreLists',{
                type: _keys, name: 'indexKeys', named: true },
            ['name', 'rating']]
        ]);
    });
    it('should parse integers route token', function() {

        expect(pluckRoute(toRoutes`{
            genreLists: {
                [{ integers }]: {
                    [name, rating]: ${ getHandler }
                }
            }
        }`)).to.deep.equal([
            ['genreLists',{
                type: _integers, named: false },
            ['name', 'rating']]
        ]);

        expect(pluckRoute(toRoutes`{
            genreLists: {
                [{ integers: indexes }]: {
                    [name, rating]: ${ getHandler }
                }
            }
        }`)).to.deep.equal([
            ['genreLists',{
                type: _integers, name: 'indexes', named: true },
            ['name', 'rating']]
        ]);
    });
    it('should parse ranges route token', function() {

        expect(pluckRoute(toRoutes`{
            genreLists: {
                [{ ranges }]: {
                    [name, rating]: ${ getHandler }
                }
            }
        }`)).to.deep.equal([
            ['genreLists',{
                type: _ranges, named: false },
            ['name', 'rating']]
        ]);

        expect(pluckRoute(toRoutes`{
            genreLists: {
                [{ ranges: rangesOfIndexes }]: {
                    [name, rating]: ${ getHandler }
                }
            }
        }`)).to.deep.equal([
            ['genreLists',{
                type: _ranges, name: 'rangesOfIndexes', named: true },
            ['name', 'rating']]
        ]);
    });
    it('should parse range syntax to integers', function() {

        expect(pluckRoute(toRoutes`{
            genreLists: {
                [0...10]: {
                    [name, rating]: ${ getHandler }
                }
            }
        }`)).to.deep.equal([
            ['genreLists',{
                type: _integers, named: false },
            ['name', 'rating']]
        ]);
    });
    it('should merge ... routes', function() {

        expect(pluckRoute(toRoutes`{
            genreLists: {
                length: ${ getHandler },
                [9..0]: {
                    ... {
                        name: ${ getHandler }
                    },
                    ... {
                        [rating, box-shot]: ${ getHandler }
                    }
                }
            }
        }`)).to.deep.equal([
            ['genreLists', 'length'],
            ['genreLists',{
                type: _integers, named: false },
            'name'],
            ['genreLists',{
                type: _integers, named: false },
            ['rating', 'box-shot']]
        ]);
    });
    it('should merge nested ... routes', function() {

        expect(pluckRoute(toRoutes`{
            genreLists: {
                ... {
                    length: ${ getHandler }
                },
                ... {
                    [9..0]: {
                        ... {
                            name: ${ getHandler }
                        },
                        ... {
                            [rating, box-shot]: ${ getHandler }
                        }
                    }
                }
            }
        }`)).to.deep.equal([
            ['genreLists', 'length'],
            ['genreLists',{
                type: _integers, named: false },
            'name'],
            ['genreLists',{
                type: _integers, named: false },
            ['rating', 'box-shot']]
        ]);
    });
    it('should merge ... route handler factories', function() {

        function pushHandler() {};

        function pushHandlerFactory(route) {
            expect(route).to.deep.equal(
                ['genreLists', 'push']
            );
            return { call: pushHandler };
        }

        function titlesFactory(route) {
            return toRoutes.QL`{
                titlesById: {
                    [{ keys: titleIds }]: ${
                        getHandler
                    }
                }
            }`;
        }

        function genreListFactory(route) {
            return toRoutes.QL`{
                genreLists: {
                    length: ${ getHandler },
                    my-list: ${ setHandler },
                    push: ${ pushHandlerFactory },
                }
            }`;
        }

        var routes = toRoutes`{
            ... ${ genreListFactory },
            ... ${ titlesFactory },
        }`;

        expect(pluckRoute(routes)).to.deep.equal([
            ['genreLists', 'length'],
            ['genreLists', 'my-list'],
            ['genreLists', 'push'],
            ['titlesById',{
                type: _keys, name: 'titleIds', named: true }]
        ]);

        expect(routes[0].get).to.equal(getHandler.get);
        expect(routes[1].set).to.equal(setHandler.set);
        expect(typeof routes[2]).to.equal('object');
        expect(routes[2].call).to.equal(pushHandler);
        expect(routes[2].call.name).to.equal('pushHandler');
        expect(routes[3].get).to.equal(getHandler.get);
    });
    it('should ignore empty ... routes', function() {

        expect(pluckRoute(toRoutes`{
            genreLists: {
                ... { },
                ... {
                    [9..0]: {
                        ... { },
                        ... {
                            [rating, box-shot]: ${ getHandler }
                        }
                    }
                }
            }
        }`)).to.deep.equal([
            ['genreLists',{
                type: _integers, named: false },
            ['rating', 'box-shot']]
        ]);
    });
    it('should do all the things at once', function() {

        expect(pluckRoute(toRoutes`{
            genreLists: {
                ...{ },
                length: ${ getHandler },
                ...{
                    [{ integers: lists }]: {
                        [name, rating]: ${ getHandler },
                        titles: {
                            length: ${ getHandler },
                            [{keys}]: {
                                ... {
                                    name: ${ getHandler }
                                },
                                ... {
                                    [rating, box-shot]: ${ getHandler }
                                }
                            }
                        }
                    }
                }
            }
        }`)).to.deep.equal([
            ['genreLists', 'length'],
            ['genreLists',{
                type: _integers, name: 'lists', named: true },
                ['name', 'rating']],
            ['genreLists', {
                type: _integers, name: 'lists', named: true },
             'titles', 'length'],
            ['genreLists', {
                type: _integers, name: 'lists', named: true },
             'titles', {
                type: _keys, named: false },
            'name'],
            ['genreLists', {
                type: _integers, name: 'lists', named: true },
             'titles', {
                type: _keys, named: false },
            ['rating', 'box-shot']]
        ]);

        var stringifiedResults = template`{
            genreLists: {
                ...{ },
                length: ${ getHandler },
                ...{
                    [{ integers: lists }]: {
                        [name, rating]: ${ getHandler },
                        titles: {
                            length: ${ getHandler },
                            [{keys}]: {
                                ... {
                                    name: ${ getHandler }
                                },
                                ... {
                                    [rating, box-shot]: ${ getHandler }
                                }
                            }
                        }
                    }
                }
            }
        }`;

        expect(routeParser.parse(stringifiedResults[0])).to.deep.equal({
            '0': {
                '0': '$__0__$',
                '1': {
                    '0': '$__1__$',
                    '1': {
                        '0': '$__2__$',
                        '1': {
                            '0': '$__3__$',
                            '1': '$__4__$',
                            '$keys': ['name', ['rating', 'box-shot']]
                        },
                        '$keys': ['length', { type: _keys, named: false }]
                    },
                    '$keys': [['name', 'rating'], 'titles']
                },
                '$keys': ['length', { type: _integers, name: 'lists', named: true }]
            },
            '$keys': ['genreLists']
        });
    });
});

function pluckRoute(routes) {
    return routes.map(function(x) {
        return x.route;
    });
}
