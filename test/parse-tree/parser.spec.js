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
    testRunner.compare(['one', ['test', 'test2'], 'oneMore'], out);
});

