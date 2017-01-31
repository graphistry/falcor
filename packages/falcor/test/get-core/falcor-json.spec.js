var expect = require('chai').expect;
var FalcorJSON = require('./../../falcor.js').FalcorJSON;
var $atom = require('@graphistry/falcor-json-graph').atom;

function identity(x) { return x; }
function sum(a, b) { return a + b; }
function evens(x, i) { return i % 2 === 0; }

function testValidLength(boxed) {
    var list = ['zero', 'one', 'two', 'three', 'four'];
    var json = { length: boxed ? $atom(5) : 5,
                 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four' };

    json.__proto__ = FalcorJSON.prototype;

    expect(json.map(identity)).to.deep.equal(list.map(identity));
    expect(json.some(evens)).to.deep.equal(list.some(evens));
    expect(json.every(evens)).to.deep.equal(list.every(evens));
    expect(json.filter(evens)).to.deep.equal(list.filter(evens));
    expect(json.reduce(sum, 0)).to.deep.equal(list.reduce(sum, 0));
}

function testInvalidLength(boxed, length) {

    var json = { length: boxed ? $atom(length) : length,
                 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four' };

    json.__proto__ = FalcorJSON.prototype;

    try { json.map(identity);
          throw new Error('FalcorJSON map did not throw on invalid' +
            (boxed && ' boxed' || '') + ' length \'' + JSON.stringify(length) + '\''); }
    catch (e) { expect(e.message).to.equal('Invalid FalcorJSON length'); }
    try { json.some(evens);
          throw new Error('FalcorJSON some did not throw on invalid' +
            (boxed && ' boxed' || '') + ' length \'' + JSON.stringify(length) + '\''); }
    catch (e) { expect(e.message).to.equal('Invalid FalcorJSON length'); }
    try { json.every(evens);
          throw new Error('FalcorJSON every did not throw on invalid' +
            (boxed && ' boxed' || '') + ' length \'' + JSON.stringify(length) + '\''); }
    catch (e) { expect(e.message).to.equal('Invalid FalcorJSON length'); }
    try { json.filter(evens);
          throw new Error('FalcorJSON filter did not throw on invalid' +
            (boxed && ' boxed' || '') + ' length \'' + JSON.stringify(length) + '\''); }
    catch (e) { expect(e.message).to.equal('Invalid FalcorJSON length'); }
    try { json.reduce(sum, 0);
          throw new Error('FalcorJSON reduce did not throw on invalid' +
            (boxed && ' boxed' || '') + ' length \'' + JSON.stringify(length) + '\''); }
    catch (e) { expect(e.message).to.equal('Invalid FalcorJSON length'); }
}

describe('FalcorJSON', function() {
    it('should behave like an Array when length is numeric', function() {
        testValidLength(false);
    });
    it('should behave like an Array when length is boxed numeric', function() {
        testValidLength(true);
    });
    it('should throw when length is invalid', function() {
        testInvalidLength(false, -1);
        testInvalidLength(false, {});
        testInvalidLength(false, NaN);
        testInvalidLength(false, null);
        testInvalidLength(false, true);
        testInvalidLength(false, false);
        testInvalidLength(false, Infinity);
        testInvalidLength(false, undefined);
        testInvalidLength(false, function bad_length() {});
        testInvalidLength(false, Number.POSITIVE_INFINITY);
        testInvalidLength(false, Number.NEGATIVE_INFINITY);
    });
    it('should throw when length is invalid boxed', function() {
        testInvalidLength(true, -1);
        testInvalidLength(true, {});
        testInvalidLength(true, NaN);
        testInvalidLength(true, null);
        testInvalidLength(true, true);
        testInvalidLength(true, false);
        testInvalidLength(true, Infinity);
        testInvalidLength(true, undefined);
        testInvalidLength(true, function bad_length() {});
        testInvalidLength(true, Number.POSITIVE_INFINITY);
        testInvalidLength(true, Number.NEGATIVE_INFINITY);
    });
});
