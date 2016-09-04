var expect = require('chai').expect;
var toRoutes = require('../lib/toRoutes');
var template = require('../lib/template');
var routeParser = require('../lib/route-parser');

describe('Route', function() {
    it('should parse keys route token', function() {
        expect(toRoutes`{
            genreLists: {
                [{keys}]: {
                    name,
                    rating
                }
            }
        }`).to.deep.equal([
            ['genreLists',{
                type: 'keys', named: false },
            ['name', 'rating']]
        ]);

        expect(toRoutes`{
            genreLists: {
                [{keys: indexKeys}]: {
                    name,
                    rating
                }
            }
        }`).to.deep.equal([
            ['genreLists',{
                type: 'keys', name: 'indexKeys', named: true },
            ['name', 'rating']]
        ]);
    });
    it('should parse integers route token', function() {

        expect(toRoutes`{
            genreLists: {
                [{integers}]: {
                    name,
                    rating
                }
            }
        }`).to.deep.equal([
            ['genreLists',{
                type: 'integers', named: false },
            ['name', 'rating']]
        ]);

        expect(toRoutes`{
            genreLists: {
                [{integers: indexes}]: {
                    name,
                    rating
                }
            }
        }`).to.deep.equal([
            ['genreLists',{
                type: 'integers', name: 'indexes', named: true },
            ['name', 'rating']]
        ]);
    });
    it('should parse ranges route token', function() {
        expect(toRoutes`{
            genreLists: {
                [{ranges}]: {
                    name,
                    rating
                }
            }
        }`).to.deep.equal([
            ['genreLists',{
                type: 'ranges', named: false },
            ['name', 'rating']]
        ]);

        expect(toRoutes`{
            genreLists: {
                [{ranges: rangesOfIndexes}]: {
                    name,
                    rating
                }
            }
        }`).to.deep.equal([
            ['genreLists',{
                type: 'ranges', name: 'rangesOfIndexes', named: true },
            ['name', 'rating']]
        ]);
    });
    it('should parse range syntax to integers', function() {
        expect(toRoutes`{
            genreLists: {
                [0...10]: {
                    name,
                    rating
                }
            }
        }`).to.deep.equal([
            ['genreLists',{
                type: 'integers', named: false },
            ['name', 'rating']]
        ])
    });
    it('should do all the things at once', function() {
        expect(toRoutes`{
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
        }`).to.deep.equal([
            ['genreLists', {
                type: 'integers', name: 'lists', named: true },
             'titles', {
                type: 'keys', named: false },
            ['name', 'rating', 'box-shot']],
            ['genreLists', {
                type: 'integers', name: 'lists', named: true },
             'titles', 'length'],
            ['genreLists',{
                type: 'integers', name: 'lists', named: true },
                ['name', 'rating']],
            ['genreLists', 'length']
        ]);
    });
});
