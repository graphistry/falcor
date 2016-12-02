var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var outputGenerator = require('./../outputGenerator');
var jsonGraph = require('@graphistry/falcor-json-graph');
var atom = jsonGraph.atom;
var _ = require('lodash');
var error = jsonGraph.error;
var expect = require('chai').expect;
var Model = require('./../../falcor.js').Model;
var BoundJSONGraphModelError = require('./../../lib/errors/BoundJSONGraphModelError');
var sinon = require('sinon');
var noOp = function() {};

describe('Deref', function() {
    // PathMap ----------------------------------------
    it('should get a simple value out of the cache', function() {
        getCoreRunner({
            input: [['title']],
            output: {
                json: {
                    title: 'Video 0'
                }
            },
            deref: ['videos', 0],
            referenceContainer: ['lists', 'A', 0, 'item'],
            cache: cacheGenerator(0, 1)
        });
    });
    it('should get multiple arguments out of the cache.', function() {
        var output = outputGenerator.lolomoGenerator([0], [0, 1]).json.lolomo[0];

        // Cheating in how we are creating the output.  'path' key should not exist
        // at the top level of output.
        delete output[f_meta_data];

        getCoreRunner({
            input: [
                [0, 'item', 'title'],
                [1, 'item', 'title']
            ],
            output: {
                json: output
            },
            deref: ['lists', 'A'],
            referenceContainer: ['lolomos', 1234, 0],
            cache: cacheGenerator(0, 2)
        });
    });
    it('should get multiple arguments as missing paths from the cache.', function() {
        getCoreRunner({
            input: [
                ['b', 'c'],
                ['b', 'd']
            ],
            output: { },
            deref: ['a'],
            optimizedMissingPaths: [
                ['a', 'b', 'c'],
                ['a', 'b', 'd']
            ],
            cache: {
                a: {
                    b: {
                        e: '&'
                    }
                }
            }
        });
    });

    it('should throw an error when bound and calling jsonGraph.', function() {
        var model = new Model({
            _path: ['videos', 0],
            cache: cacheGenerator(0, 1)
        });
        var res = model._getPathValuesAsJSONG(model, [['summary']], {});
        expect(BoundJSONGraphModelError.is(res.error), 'expected BoundJSONGraphModelError').to.equal(true);
    });

    it('should ensure that correct parents are produced for non-paths.', function(done) {
        var model = new Model({
            cache: {
                a: {
                    b: {
                        e: '&'
                    }
                }
            }
        });

        var onNext = sinon.spy();
        toObservable(model.
            get(['a', 'b', 'e'])).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                var json = onNext.getCall(0).args[0].json;

                // Top level
                expect(json[f_meta_data][f_meta_abs_path]).to.be.not.ok;

                // a
                var a = json.a;
                expect(a[f_meta_data][f_meta_abs_path]).to.deep.equals(['a']);

                // b
                var b = a.b;
                expect(b[f_meta_data][f_meta_abs_path]).to.deep.equals(['a', 'b']);

                // e
                var e = b.e;
                expect(e).to.equals('&');
            }).
            subscribe(noOp, done, done);
    });

    it('ensures that the sequencial get / deref works correctly.', function(done) {
        var model = new Model({
            cache: {
                a: {
                    b: {
                        e: '&'
                    }
                }
            }
        });

        model.get(['a', 'b', 'e']).subscribe(function(data) {
            model = model.deref(data.json.a);
        });

        model.get(['b', 'e']).subscribe(function(data) {
            model = model.deref(data.json.b);
        });

        var onNext = sinon.spy();
        toObservable(model.
            get(['e'])).
            doAction(onNext, noOp, function() {
                var x = onNext.getCall(0).args[0];
                x.json[f_meta_data] = x.json[f_meta_data];
                expect(onNext.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    json: {
                        [f_meta_data]: {
                            [f_meta_abs_path]:   ['a', 'b'],
                            [f_meta_deref_from]: undefined,
                            [f_meta_deref_to]:   undefined,
                            [f_meta_version]:    0
                        },
                        e: '&'
                    }
                });
            }).
            subscribe(noOp, done, done);
    });
});

