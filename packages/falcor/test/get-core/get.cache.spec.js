var cacheGenerator = require('./../CacheGenerator');
var falcor = require('./../../falcor.js');
var isInternalKey = require('./../../lib/support/isInternalKey');
var clean = require('./../cleanData').clean;
var Model = falcor.Model;
var expect = require('chai').expect;

function deepExpectations(o, expectExpression) {
    for (var k in o) {
        expectExpression(k);

        if (typeof o[k] === 'object') {
            deepExpectations(o[k], expectExpression);
        }
    }
}

describe('getCache', function() {

    it('should serialize the cache', function() {
        var model = new Model({ cache: cacheGenerator(0, 1) });
        var cache = model.getCache();
        expect(clean(cache)).to.deep.equals(cacheGenerator(0, 1));
    });

    it('should serialize part of the cache', function() {
        var model = new Model({ cache: cacheGenerator(0, 10) });
        var cache = model.getCache(['lolomo', 0, 3, 'item', 'title']);
        expect(clean(cache)).to.deep.equals({
            jsonGraph: cacheGenerator(3, 1),
            paths: [
                ['lolomo', '0', '3', 'item', 'title']
            ]
        });
    });

    it('serialized cache should not contain internal keys (including $size, on boxedValues)', function(done) {
        var model = new Model({ cache: cacheGenerator(0, 1) });

        model.get(['lolomo', 0, 0, 'item', 'title']).subscribe(function() {}, done, function() {
            var cache = model.getCache();

            deepExpectations(cache, function(key) {
                expect(key !== '$type' && isInternalKey(key), 'shouldn\'t include key `' + key + '`').to.equal(false);
            });

            done();
        });
    });

    it('should serialize a cache with undefined values.', function() {
        var model = new Model({
            cache: {
                test: 'foo'
            }
        });

        // mimicking cache clean-up
        model._root.cache.testing = undefined;
        var cache = model.getCache();
        expect(clean(cache)).to.deep.equals({
            test: 'foo'
        });
    });
});

