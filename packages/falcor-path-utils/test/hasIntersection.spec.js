var expect = require('chai').expect;
var hasIntersection = require('../lib/hasIntersection');
var materializedAtom = require('../lib/support/materializedAtom');

describe('hasIntersection', function() {
    it('should return true when a simple path completely intersects the tree.', function() {
        var path = ['one', 'two'];
        var tree = {one: {two: null}};

        expect(hasIntersection(tree, path, 0, path.length)).to.equal(true);
    });
    it('should return true when a complex path completely intersects the tree.', function() {
        var tree = {one: {two: null, three: null}};
        var path = ['one', ['three', 'two']];

        expect(hasIntersection(tree, path, 0, path.length)).to.equal(true);
    });
    it('should return false when a simple path does not completely intersect the tree.', function() {
        var path = ['one', 'two'];
        var tree = {one: {two: { three: null}}};

        expect(hasIntersection(tree, path, 0, path.length)).to.equal(false);
    });
    it('should return false when a complex path does not completely intersect the tree.', function() {
        var tree = {one: { three: null}};
        var path = ['one', ['three', 'two']];

        expect(hasIntersection(tree, path, 0, path.length)).to.equal(false);
    });
    it('should return true when a simple path with a null last key completely intersects the tree.', function() {
        var path = ['one', 'two', null];
        var tree = {one: {two: materializedAtom}};

        expect(hasIntersection(tree, path, 0, path.length)).to.equal(true);
    });
});
