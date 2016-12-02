var R = require('../../../src/Router');
var noOp = function() {};
var chai = require('chai');
var expect = chai.expect;
var falcor = require('@graphistry/falcor');
var $ref = falcor.Model.ref;
var $atom = falcor.Model.atom;
var Observable = require('rxjs').Observable;
var sinon = require('sinon');

describe('Messages', function() {

    it('should report all paths when route returns additional path message.', function(done) {
        var router = new R([{
            route: 'genreList.length',
            get: function(path) {
                return [{
                    path: ['genreList', 'length'],
                    value: {
                        $type: 'ref',
                        value: ['otherList', 'length']
                    }
                }, {
                    isMessage: true, path: ['otherList', 'length']
                }];
            }
        }, {
            route: 'otherList.length',
            get: function() {
                return { value: 5, path: ['otherList', 'length'] };
            }
        }]);

        var onNext = sinon.spy();

        router.get([['genreList', 'length']]).
            do(onNext).
            do(noOp, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    paths: [
                        [['genreList', 'otherList'], 'length']
                    ],
                    jsonGraph: {
                        genreList: {
                            length: {
                                $type: 'ref',
                                value: ['otherList', 'length']
                            }
                        },
                        otherList: {
                            length: 5
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });

});
