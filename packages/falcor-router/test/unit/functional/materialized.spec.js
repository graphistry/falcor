var R = require('../../../src/Router');
var $atom = require('../../../src/support/types').$atom;
var noOp = function() {};
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var falcor = require('@graphistry/falcor');
var $ref = falcor.Model.ref;
var Observable = require('rxjs').Observable;

describe('Materialized Paths.', function() {
    function partialRouter() {
        return new R([{
            route: 'one[{integers:ids}]',
            get: function(aliasMap) {
                return Observable.
                    return({
                        path: ['one', 0],
                        value: $ref(['two', 'be', 956])
                    }).
                    delay(100);
            }
        }, {
            route: 'genreList.new',
            call: function(callPath, args) {
                return args.map(function(ref, index) {
                    return { path: ['genreList', index], value: ref }
                });
            }
        }]);
    }
    describe('#call', function() {
        it('should materialize unhandled refs, suffixes, and thisPaths from call', function(done) {
            var router = partialRouter();
            var onNext = sinon.spy();
            router.call(
                    ['genreList', 'new'],
                    [$ref(['lists', 'abc'])],
                    [['summary']], [['length']]
                ).
                do(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        paths: [
                            ['genreList', 'length'],
                            ['genreList', 0, 'summary']
                        ],
                        jsonGraph: {
                            genreList: {
                                0: $ref(['lists', 'abc']),
                                length: { $type: $atom }
                            },
                            lists: {
                                abc: {
                                    summary: { $type: $atom }
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('#get', function() {
        it('should validate routes that do not return all the paths asked for.', function(done) {
            var router = partialRouter();
            var onNext = sinon.spy();
            router.
                get([['one', [0, 1], 'summary']]).
                do(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        paths: [['one', {from: 0, to: 1}, 'summary']],
                        jsonGraph: {
                            one: {
                                0: $ref(['two', 'be', 956]),
                                1: {
                                    summary: {
                                        $type: $atom
                                    }
                                }
                            },
                            two: {
                                be: {
                                    956: {
                                        summary: {
                                            $type: $atom
                                        }
                                    }
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });

        it('should validate when no route is matched', function(done) {
            var routes = [];
            var router = new R(routes);
            var onNext = sinon.spy();
            router.
                get([['one', [0, 1], 'summary']]).
                do(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        paths: [['one', {from: 0, to: 1}, 'summary']],
                        jsonGraph: {
                            one: {
                                0: {
                                    summary: {
                                        $type: $atom
                                    }
                                },
                                1: {
                                    summary: {
                                        $type: $atom
                                    }
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
});
