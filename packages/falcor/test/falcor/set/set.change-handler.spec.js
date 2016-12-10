var falcor = require('./../../../falcor.js');
var Model = falcor.Model;
var expect = require('chai').expect;
var Rx = require('rx');

describe('root onChange handler', function () {
    it('is called when the root\'s version changes but before the subscription is disposed.', function () {
        var changes = 0;
        var calledBeforeDispose = false;
        var model = new Model({
            onChange: function () {
                changes++;
            }
        });

        toObservable(model.
            set({
                path: ['a', 'b', 'c'],
                value: 'foo'
            })).
            finally(function() {
                if(changes > 0) {
                    calledBeforeDispose = true;
                }
            }).
            subscribe();

        expect(changes, 'onChange should have been called once').to.equal(1);
        expect(calledBeforeDispose, 'onChange wasn\'t called before the subscription was disposed.').to.be.ok;
    });
    it('is called once when the datasource echos the same data back.', function () {

        var changes = 0;
        var calledBeforeDispose = false;
        var model = new Model({
            onChange: function () {
                changes++;
            },
            source: {
                set: function(jsonGraphEnvelope) {
                    return Rx.Observable.return(
                        { jsonGraph: { a: { b: { c: 'foo' }}}}
                    );
                }
            }
        });

        toObservable(model.
            set({
                path: ['a', 'b', 'c'],
                value: 'foo'
            })).
            finally(function() {
                if(changes > 0) {
                    calledBeforeDispose = true;
                }
            }).
            subscribe();

        expect(changes, 'onChange should have been called once').to.equal(1);
        expect(calledBeforeDispose, 'onChange wasn\'t called before the subscription was disposed.').to.be.ok;
    });
});
