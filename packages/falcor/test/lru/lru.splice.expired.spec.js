var falcor = require('./../../falcor.js');
var Model = falcor.Model;
var Rx = require('rx');
var chai = require('chai');
var expect = chai.expect;
var noOp = function() {};
var sinon = require('sinon');

describe('Expired', function() {
    it('should ensure that get avoids expired items', function(done) {
        var model = new Model({cache: {
            'expireSoon': {
                '$size': 51,
                'summary': {
                    '$size': 51,
                    '$expires': Date.now() + 50,
                    '$type': 'atom',
                    'value': 'sad panda'
                }
            }
        }});

        expect(model._root[f_head].value).to.equal('sad panda');

        var onNext = sinon.spy();
        Rx.Observable.
            timer(100).
            flatMap(function() {
                return model.get(['expireSoon', 'summary']);
            }).
            doAction(onNext, noOp, function() {
                expect(onNext.callCount).to.equal(0);
                expect(model._root[f_head]).to.be.not.ok;
                expect(model._root[f_tail]).to.be.not.ok;
            }).
            subscribe(noOp, done, done);
    });
});

