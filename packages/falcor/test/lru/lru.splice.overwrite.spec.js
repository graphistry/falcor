var falcor = require('./../../falcor.js');
var Model = falcor.Model;
var chai = require('chai');
var expect = chai.expect;
var noOp = function() {};

describe('Overwrite', function() {
    it('should overwrite the cache and update the lru as PathValue', function() {
        var model = getModel();
        model.set({path: [1], value: 'overwrite'}).subscribe();
        testLRU(model);
    });
    it('should overwrite the cache and update the lru as JSON', function() {
        var model = getModel();
        model.set({json: {1: 'overwrite'}}).subscribe();
        testLRU(model);
    });
    it('should overwrite the cache and update the lru as JSONGraph', function() {
        var model = getModel();
        model.set({
            jsonGraph: {
                1: 'overwrite'
            },
            paths: [[1]]
        }).subscribe();
        testLRU(model);
    });
});

function getModel() {
    var model = new Model();
    model.set({json: {1: 'hello world'}}).subscribe();

    return model;
}

function testLRU(model) {
    expect(model._root[f_head].value).to.equal('overwrite');
    expect(model._root[f_head].value).to.deep.equal(model._root[f_tail].value);
    expect(model._root[f_head][f_next]).to.be.not.ok;
    expect(model._root[f_head][f_prev]).to.be.not.ok;
    expect(model._root[f_tail][f_next]).to.be.not.ok;
    expect(model._root[f_tail][f_prev]).to.be.not.ok;
}
