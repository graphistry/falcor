var R = require('../../../src/Router');
var noOp = function() {};
var chai = require('chai');
var expect = chai.expect;
var Observable = require('rxjs').Observable;
var sinon = require('sinon');

describe('Precedence Matching', function() {
    it('should properly precedence match with different lengths.', function(done) {
        var shortGet = sinon.spy(function() {
            return Observable.empty();
        });
        var longerGet = sinon.spy(function() {
            return Observable.empty();
        });
        var router = new R([{
            route: 'get[{integers}][{keys}]',
            get: shortGet
        }, {
            route: 'get[{integers}][{keys}][{keys}]',
            get: longerGet
        }]);

        router.
            get([['get', 11, 'six']]).
            do(noOp, noOp, function() {
                expect(longerGet.callCount).to.equals(0);
                expect(shortGet.callCount).to.equals(1);
            }).
            subscribe(noOp, done, done);
    });

    it('should properly precedence match with different lengths from call', function(done) {
        var refCalled = 0;
        var leafCalled = 0;
        var router = new R([{
            route: 'init',
            call: function(path) {
                return {
                    path: ['init'],
                    value: {
                        $type: 'ref',
                        value: ['get']
                    }
                }
            }
        }, {
            route: 'get.refs',
            get: function(path) {
                refCalled++;
                return {
                    path: ['get', 'refs'],
                    value: {
                        $type: 'ref',
                        value: ['get', ['foos', 'bars']]
                    }
                }
            }
        }, {
            route: 'get[{keys}][{keys}]',
            get: function(path) {
                var leaf = path[2][0];
                var branch = path[1];
                leafCalled++;
                return branch.map(function (branch) {
                    expect(branch).to.not.equal('refs');
                    return {
                        path: ['get', branch, leaf],
                        value: 'leaf value'
                    };
                });
            }
        }]);

        router.
            call(['init'], [], [['refs', 'value']]).
            do(noOp, noOp, function() {
                expect(leafCalled > refCalled);
            }).
            subscribe(noOp, done, done);
    });
});
