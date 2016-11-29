var falcor = require('./../../falcor.js');
var Model = falcor.Model;
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');
var get = require('./../../lib/cache/get');
var getWithPathsAsPathMap = get.json;
var getWithPathsAsJSONGraph = get.jsonGraph;
var cacheGenerator = require('./../CacheGenerator');

describe('Get', function () {
    describe('getPaths', function () {
        it('should promote the get item to the head _toJSONG.', function() {
            var model = new Model();
            model.set({json: {1: 'I am 1'}}).subscribe();
            model.set({json: {2: 'I am 2'}}).subscribe();
            model.set({json: {3: 'I am 3'}}).subscribe();

            getWithPathsAsJSONGraph(model, [['1']], [{}]);
            expect(model._root[f_head].value).to.equal('I am 1');
        });
        it('should promote the get item to the head toJSON.', function() {
            var model = new Model();
            model.set({json: {1: 'I am 1'}}).subscribe();
            model.set({json: {2: 'I am 2'}}).subscribe();
            model.set({json: {3: 'I am 3'}}).subscribe();

            getWithPathsAsPathMap(model, [['1']], [{}]);
            expect(model._root[f_head].value).to.equal('I am 1');
        });
    });
    it('should promote references on a get.', function() {
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

        model.get(['lolomo', 0]).subscribe();

        // new order to the list
        curr = root[f_head];
        expect(curr[f_key]).to.equals('0');
        expect(curr.value).to.deep.equals(['lists', 'A']);

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
describe('Multiple Gets', function () {
    it('should promote the get item to the head toJSON.', function() {
        var model = new Model();
        model.set({json: {1: 'I am 1'}}).subscribe();
        model.set({json: {2: 'I am 2'}}).subscribe();
        model.set({json: {3: 'I am 3'}}).subscribe();

        expect(model._root[f_head].value).to.equal('I am 3');
        expect(model._root[f_head][f_next].value).to.equal('I am 2');
        expect(model._root[f_head][f_next][f_next].value).to.equal('I am 1');
        getWithPathsAsPathMap(model, [['2']], [{}]);
        getWithPathsAsPathMap(model, [['1']], [{}]);
        var current = model._root[f_head];
        expect(current.value).to.equal('I am 1');
        current = current[f_next];
        expect(current.value).to.equal('I am 2');
        current = current[f_next];
        expect(current.value).to.equal('I am 3');
        expect(current[f_next]).to.equal(undefined);
        current = current[f_prev];
        expect(current.value).to.equal('I am 2');
        current = current[f_prev];
        expect(current.value).to.equal('I am 1');
        expect(current[f_prev]).to.equal(undefined);
    });
    it('should promote the get item to the head _toJSONG.', function() {
        var model = new Model();
        model.set({json: {1: 'I am 1'}}).subscribe();
        model.set({json: {2: 'I am 2'}}).subscribe();
        model.set({json: {3: 'I am 3'}}).subscribe();

        expect(model._root[f_head].value).to.equal('I am 3');
        expect(model._root[f_head][f_next].value).to.equal('I am 2');
        expect(model._root[f_head][f_next][f_next].value).to.equal('I am 1');
        getWithPathsAsJSONGraph(model, [['2']], [{}]);
        getWithPathsAsJSONGraph(model, [['1']], [{}]);
        var current = model._root[f_head];
        expect(current.value).to.equal('I am 1');
        current = current[f_next];
        expect(current.value).to.equal('I am 2');
        current = current[f_next];
        expect(current.value).to.equal('I am 3');
        expect(current[f_next]).to.equal(undefined);
        current = current[f_prev];
        expect(current.value).to.equal('I am 2');
        current = current[f_prev];
        expect(current.value).to.equal('I am 1');
        expect(current[f_prev]).to.equal(undefined);
    });

    it('should promote references on a get.', function() {
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

        model.get(['lolomo', 0]).subscribe();

        // new order to the list
        curr = root[f_head];
        expect(curr[f_key]).to.equals('0');
        expect(curr.value).to.deep.equals(['lists', 'A']);

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
