var parser = require('./../../src');
var expect = require('chai').expect;
it('should parse a simple key string', function() {
    var out = parser('one.two.three');
    expect(out).to.deep.equal(['one', 'two', 'three']);
});
it('should parse a string with indexers', function() {
    var out = parser('one[0]');
    expect(out).to.deep.equal(['one', 0]);
});
it('should parse a string with indexers followed by dot separators.', function() {
    var out = parser('one[0].oneMore');
    expect(out).to.deep.equal(['one', 0, 'oneMore']);
});
it('should parse a string with a range', function() {
    var out = parser('one[0..5].oneMore');
    expect(out).to.deep.equal(['one', {from: 0, to: 5}, 'oneMore']);
});
it('should parse a string with a set of tokens', function() {
    var out = parser('one["test", \'test2\'].oneMore');
    expect(out).to.deep.equal(['one', ['test', 'test2'], 'oneMore']);
});
it('should treat 07 as 7', function() {
    var out = parser('one[07, 0001].oneMore');
    expect(out).to.deep.equal(['one', [7, 1], 'oneMore']);
});
it('should parse out a range.', function() {
    var out = parser('one[0..1].oneMore');
    expect(out).to.deep.equal(['one', {from: 0, to: 1}, 'oneMore']);
});
it('should parse out multiple ranges.', function() {
    var out = parser('one[0..1,3..4].oneMore');
    expect(out).to.deep.equal(['one', [{from: 0, to: 1}, {from: 3, to: 4}], 'oneMore']);
});


describe('#fromPath', function() {
    it('should convert a string to path.', function() {
        var input = 'videos[1234].summary';
        var output = ['videos', 1234, 'summary'];
        expect(parser.fromPath(input)).to.deep.equal(output);
    });

    it('should return a provided array.', function() {
        var input = ['videos', 1234, 'summary'];
        var output = ['videos', 1234, 'summary'];
        expect(parser.fromPath(input)).to.deep.equal(output);
    });

    it('should convert an undefined.', function() {
        var input = undefined;
        var output = [];
        expect(parser.fromPath(input)).to.deep.equal(output);
    });
});

describe('#fromPathsOrPathValues', function() {
    it('should convert a string to path.', function() {
        var input = ['videos[1234].summary'];
        var output = [['videos', 1234, 'summary']];
        expect(parser.fromPathsOrPathValues(input)).to.deep.equal(output);
    });

    it('should convert an undefined to path.', function() {
        var input = undefined;
        var output = [];
        expect(parser.fromPathsOrPathValues(input)).to.deep.equal(output);
    });

    it('should return a provided array.', function() {
        var input = [['videos', 1234, 'summary']];
        var output = [['videos', 1234, 'summary']];
        expect(parser.fromPathsOrPathValues(input)).to.deep.equal(output);
    });

    it('should convert with a bunch of values.', function() {
        var input = [
            ['videos', 1234, 'summary'],
            'videos[555].summary',
            {path: 'videos[444].summary', value: 5}
        ];
        var output = [
            ['videos', 1234, 'summary'],
            ['videos', 555, 'summary'],
            {path: ['videos', 444, 'summary'], value: 5}
        ];
        expect(parser.fromPathsOrPathValues(input)).to.deep.equal(output);
    });
});

describe('#routed', function() {
    it('should create a routed token for the path.', function() {
        var out = parser('one[{ranges}].oneMore', true);
        expect(out).to.deep.equal(['one', {type: 'ranges', named: false, name: ''}, 'oneMore']);
    });
    it('should create a named routed token for the path.', function() {
        var out = parser('one[{ranges:foo}].oneMore', true);
        expect(out).to.deep.equal(['one', {type: 'ranges', named: true, name: 'foo'}, 'oneMore']);
    });
});

describe('#errors', function() {

});
