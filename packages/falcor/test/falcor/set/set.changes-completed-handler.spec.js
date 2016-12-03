var falcor = require('./../../../falcor.js');
var Model = falcor.Model;
var expect = require('chai').expect;
var Rx = require('rx');

describe('root onChangesCompleted handler', function () {
    it('is called only once per transaction and before the subscription is disposed.', function () {

        var changes = 0;
        var changesCompleted = 0;
        var calledBeforeDispose = false;
        var model = new falcor.Model({
            onChange: function() {
                changes++;
            },
            onChangesCompleted: function () {
                changesCompleted++;
            },
            source: {
                set: function(jsonGraphEnvelope) {
                    return Rx.Observable.return(
                        { jsonGraph: { a: { b: { c: 'foo' }}}}
                    );
                }
            }
        });

        toObservable(model
            .set({
                path: ['a', 'b', 'c'],
                value: 'foo'
            })).
            finally(function() {
                if(changesCompleted > 0) {
                    calledBeforeDispose = true;
                }
            }).
            subscribe();

        expect(changes, 'onChange should have been called once').to.equal(1);
        expect(changesCompleted, 'onChangesCompleted should have been called once').to.equal(1);
        expect(calledBeforeDispose, 'onChangesCompleted wasn\'t called before the subscription was disposed.').to.be.ok;
    });
});
