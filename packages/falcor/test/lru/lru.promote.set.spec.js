var falcor = require('./../../falcor.js');
var Model = falcor.Model;
var chai = require('chai');
var expect = chai.expect;
var noOp = function() {};
var cacheGenerator = require('./../CacheGenerator');

describe('Set', function() {
    it('should set with pathValues.', function() {
        var model = getModel();

        model.set({
             path: ['1'],
             value: 'i am 1'
        }).subscribe();

        singleItem(model);
    });
    it('should set with json', function() {
        var model = getModel();

        model.set({
            json: {
                1: 'i am 1'
            }
        }).subscribe();

        singleItem(model);
    });
    it('should set with json-graph', function() {
        var model = getModel();

        model.set({
            jsonGraph: {
                1: 'i am 1'
            },
            paths: [
                [1]
            ]
        }).subscribe();

        singleItem(model);
    });
    it('should set with 2 pathValues.', function() {
        var model = getModel();

        model.set({
             path: ['1'],
             value: 'i am 1'
        }).subscribe();

        model.set({
             path: ['2'],
             value: 'i am 2'
        }).subscribe();

        doubleItem(model);
    });
    it('should set with 2 json', function() {
        var model = getModel();

        model.set({
            json: {
                1: 'i am 1'
            }
        }).subscribe();

        model.set({
            json: {
                2: 'i am 2'
            }
        }).subscribe();

        doubleItem(model);
    });
    it('should set with 2 json-graph', function() {
        var model = getModel();

        model.set({
            jsonGraph: {
                1: 'i am 1'
            },
            paths: [
                [1]
            ]
        }).subscribe();


        model.set({
            jsonGraph: {
                2: 'i am 2'
            },
            paths: [
                [2]
            ]
        }).subscribe();

        doubleItem(model);
    });
    it('should set with 3 pathValues.', function() {
        var model = getModel();

        model.set({
             path: ['1'],
             value: 'i am 1'
        }).subscribe();

        model.set({
             path: ['2'],
             value: 'i am 2'
        }).subscribe();

        model.set({
             path: ['3'],
             value: 'i am 3'
        }).subscribe();

        tripleItem(model);
    });
    it('should set with 3 json', function() {
        var model = getModel();

        model.set({
            json: {
                1: 'i am 1'
            }
        }).subscribe();

        model.set({
            json: {
                2: 'i am 2'
            }
        }).subscribe();


        model.set({
            json: {
                3: 'i am 3'
            }
        }).subscribe();

        tripleItem(model);
    });
    it('should set with 3 json-graph', function() {
        var model = getModel();

        model.set({
            jsonGraph: {
                1: 'i am 1'
            },
            paths: [
                [1]
            ]
        }).subscribe();


        model.set({
            jsonGraph: {
                2: 'i am 2'
            },
            paths: [
                [2]
            ]
        }).subscribe();

        model.set({
            jsonGraph: {
                3: 'i am 3'
            },
            paths: [
                [3]
            ]
        }).subscribe();

        tripleItem(model);
    });

    it('should promote references on a set.', function() {
        var model = new Model({
            cache: cacheGenerator(0, 1)
        });

        var root = model._root;
        var curr = root[f_head];
        expect(curr[f_key]).to.equals('title');
        expect(curr.value).to.deep.equals('Video 0');

        curr = curr[f_next];
        expect(curr[f_key]).to.equals('item');
        expect(curr.value).to.deep.equals(['videos', '0']);

        curr = curr[f_next];
        expect(curr[f_key]).to.equals('0');
        expect(curr.value).to.deep.equals(['lists', 'A']);

        curr = curr[f_next];
        expect(curr[f_key]).to.equals('lolomo');
        expect(curr.value).to.deep.equals(['lolomos', '1234']);
        expect(curr[f_next]).to.be.not.ok;

        model.
            set({
                path: ['lolomo', '0'],
                value: 'foo'
            }).
            subscribe();

        // new order to the list
        curr = root[f_head];
        expect(curr[f_key]).to.equals('0');
        expect(curr.value).to.deep.equals('foo');

        curr = curr[f_next];
        expect(curr[f_key]).to.equals('lolomo');
        expect(curr.value).to.deep.equals(['lolomos', '1234']);

        curr = curr[f_next];
        expect(curr[f_key]).to.equals('title');
        expect(curr.value).to.deep.equals('Video 0');

        curr = curr[f_next];
        expect(curr[f_key]).to.equals('item');
        expect(curr.value).to.deep.equals(['videos', '0']);
        expect(curr[f_next]).to.be.not.ok;
    });
});
function getModel() {
    var model = new Model();

    return model;
}

function singleItem(model) {
    expect(model._root[f_head].value).to.equal('i am 1');
    expect(model._root[f_head][f_next]).to.be.not.ok;
    expect(model._root[f_head][f_prev]).to.be.not.ok;
}

function doubleItem(model) {
    expect(model._root[f_head].value).to.equal('i am 2');
    expect(model._root[f_tail].value).to.equal('i am 1');
    expect(model._root[f_head][f_next].value).to.equal('i am 1');
    expect(model._root[f_tail][f_prev].value).to.equal('i am 2');
    expect(model._root[f_head][f_prev]).to.be.not.ok;
    expect(model._root[f_tail][f_next]).to.be.not.ok;
}

function tripleItem(model) {
    expect(model._root[f_head].value).to.equal('i am 3');
    expect(model._root[f_tail].value).to.equal('i am 1');
    expect(model._root[f_head][f_next].value).to.equal('i am 2');
    expect(model._root[f_tail][f_prev].value).to.equal('i am 2');
    expect(model._root[f_head][f_next][f_next].value).to.equal('i am 1');
    expect(model._root[f_tail][f_prev][f_prev].value).to.equal('i am 3');
    expect(model._root[f_head][f_prev]).to.be.not.ok;
    expect(model._root[f_tail][f_next]).to.be.not.ok;
}
