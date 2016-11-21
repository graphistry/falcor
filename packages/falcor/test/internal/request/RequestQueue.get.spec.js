var sinon = require('sinon');
var expect = require('chai').expect;
var Queue = require('./../../../lib/request/Queue');
var TimeoutScheduler = require('./../../../lib/schedulers/TimeoutScheduler');
var ImmediateScheduler = require('./../../../lib/schedulers/ImmediateScheduler');
var Rx = require('rx');
var Model = require('./../../../lib').Model;
var LocalDataSource = require('./../../data/LocalDataSource');
var noOp = function() {};
var zipSpy = require('./../../zipSpy');
function throwError(e) { throw e; }

var cacheGenerator = require('./../../CacheGenerator');
var strip = require('./../../cleanData').stripDerefAndVersionKeys;
var noOp = function() {};
var Cache = function() { return cacheGenerator(0, 2); };

describe('#get', function() {
    var videos0 = ['videos', 0, 'title'];
    var videos1 = ['videos', 1, 'title'];
    it('should make a simple get request.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache());
        var model = new Model({source: source, scheduler: scheduler});
        var queue = new Queue(model._root);
        var callback = sinon.spy();
        var disposable = queue.get(model, [videos0], [videos0]).subscribe({
            onNext: callback,
            onError: throwError,
            onCompleted: noOp
        });

        expect(callback.calledOnce, 'callback should be called once.').to.be.ok;
        var onNext = sinon.spy();
        toObservable(model.
            withoutDataSource().
            get(videos0)).
            doAction(onNext, noOp, function() {
                expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                    json: {
                        videos: {
                            0: {
                                title: 'Video 0'
                            }
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });

    it('should make a couple requests and have them batched together.', function(done) {
        var scheduler = new TimeoutScheduler(16);
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache());
        var model = new Model({source: source, scheduler: scheduler});
        var queue = new Queue(model._root);

        var zip = zipSpy(2, function() {
            expect(queue.subscriptions.length).to.equal(1);
            expect(zip.callCount).to.equal(2);

            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0'
                                },
                                1: {
                                    title: 'Video 1'
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });

        var zipObserver = {
            onNext: zip,
            onError: throwError,
            onCompleted: function() {
                expect(queue.subscriptions.length).to.equal(0);
            }
        };

        var disposable = queue.get(model, [videos0], [videos0]).subscribe(zipObserver);
        var disposable2 = queue.get(model, [videos1], [videos1]).subscribe(zipObserver);

        expect(queue.subscriptions.length).to.equal(1);
        expect(queue.subscriptions[0].active).to.equal(false);
        expect(queue.subscriptions[0].disposable).to.be.ok;
    });

    it('should make a couple requests where the second argument is deduped.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source, scheduler: scheduler});
        var queue = new Queue(model._root);

        var zip = zipSpy(2, function() {
            expect(queue.subscriptions.length).to.equal(1);
            expect(zip.callCount).to.equal(2);

            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0'
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });

        var zipObserver = {
            onNext: zip,
            onError: throwError,
            onCompleted: function() {
                expect(queue.subscriptions.length).to.equal(0);
            }
        };

        var disposable = queue.get(model, [videos0], [videos0]).subscribe(zipObserver);
        expect(queue.subscriptions.length).to.equal(1);
        expect(queue.subscriptions[0].active).to.equal(true);
        expect(queue.subscriptions[0].disposable).to.be.ok;
        var disposable2 = queue.get(model, [videos0], [videos0]).subscribe(zipObserver);
        expect(queue.subscriptions.length).to.equal(1);
        expect(queue.subscriptions[0].active).to.equal(true);
        expect(queue.subscriptions[0].disposable).to.be.ok;
    });

    it('should make a couple requests where only part of the second request is deduped then first request is disposed.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source, scheduler: scheduler});
        var queue = new Queue(model._root);

        var zip = zipSpy(2, function() {

            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(zip.callCount, 'zip should be called twice.').to.equal(2);
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0'
                                },
                                1: {
                                    title: 'Video 1'
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        }, 300);

        var zipObserver = {
            onNext: zip,
            onError: throwError,
            onCompleted: noOp
        };

        var disposable = queue.get(model, [videos0], [videos0]).subscribe(zipObserver);
        expect(queue.subscriptions.length).to.equal(1);
        expect(queue.subscriptions[0].active).to.equal(true);
        expect(queue.subscriptions[0].disposable).to.be.ok;
        var disposable2 = queue.get(model, [videos0, videos1], [videos0, videos1]).subscribe(zipObserver);
        expect(queue.subscriptions.length).to.equal(2);
        expect(queue.subscriptions[0].active).to.equal(true);
        expect(queue.subscriptions[1].active).to.equal(true);
        expect(queue.subscriptions[0].disposable).to.be.ok;
        expect(queue.subscriptions[1].disposable).to.be.ok;

        disposable.dispose();
    });

    it('should make a couple requests where the second request is deduped and the first is disposed.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source, scheduler: scheduler});
        var queue = new Queue(model._root);

        var zip = zipSpy(2, function() {

            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(zip.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0'
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        }, 300);

        var zipObserver = {
            onNext: zip,
            onError: throwError,
            onCompleted: noOp
        };

        var disposable = queue.get(model, [videos0], [videos0]).subscribe(zipObserver);
        expect(queue.subscriptions.length).to.equal(1);
        expect(queue.subscriptions[0].active).to.equal(true);
        expect(queue.subscriptions[0].disposable).to.be.ok;
        var disposable2 = queue.get(model, [videos0], [videos0]).subscribe(zipObserver);
        expect(queue.subscriptions.length).to.equal(1);
        expect(queue.subscriptions[0].active).to.equal(true);
        expect(queue.subscriptions[0].disposable).to.be.ok;

        disposable.dispose();
    });

    it('should make a couple requests where the second argument is deduped and all the requests are disposed.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source, scheduler: scheduler});
        var queue = new Queue(model._root);

        var zip = zipSpy(2, function() {

            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(zip.callCount).to.equal(0);
                    expect(onNext.callCount).to.equal(0);
                }).
                subscribe(noOp, done, done);
        }, 300);

        var zipObserver = {
            onNext: zip,
            onError: throwError,
            onCompleted: noOp
        };

        var disposable = queue.get(model, [videos0], [videos0]).subscribe(zipObserver);
        expect(queue.subscriptions.length).to.equal(1);
        expect(queue.subscriptions[0].active).to.equal(true);
        expect(queue.subscriptions[0].disposable).to.be.ok;
        var disposable2 = queue.get(model, [videos0], [videos0]).subscribe(zipObserver);
        expect(queue.subscriptions.length).to.equal(1);
        expect(queue.subscriptions[0].active).to.equal(true);
        expect(queue.subscriptions[0].disposable).to.be.ok;

        disposable.dispose();
        disposable2.dispose();

        expect(zip.callCount).to.equal(0);
    });

    it('should make a couple requests where only part of the second request is deduped then disposed.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source, scheduler: scheduler});
        var queue = new Queue(model._root);

        var zip = zipSpy(2, function() {

            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(zip.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0'
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        }, 300);

        var zipObserver = {
            onNext: zip,
            onError: throwError,
            onCompleted: noOp
        };

        var disposable = queue.get(model, [videos0], [videos0]).subscribe(zipObserver);
        expect(queue.subscriptions.length).to.equal(1);
        expect(queue.subscriptions[0].active).to.equal(true);
        expect(queue.subscriptions[0].disposable).to.be.ok;
        var disposable2 = queue.get(model, [videos0, videos1], [videos0, videos1]).subscribe(zipObserver);
        expect(queue.subscriptions.length).to.equal(2);
        expect(queue.subscriptions[1].active).to.equal(true);
        expect(queue.subscriptions[1].disposable).to.be.ok;

        disposable2.dispose();
    });

    it('should make a couple requests where only part of the second request is deduped then both are disposed.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source, scheduler: scheduler});
        var queue = new Queue(model._root);

        var zip = zipSpy(2, function() {
            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(zip.callCount).to.equal(0);
                    expect(onNext.callCount).to.equal(0);
                }).
                subscribe(noOp, done, done);
        }, 300);

        var zipObserver = {
            onNext: zip,
            onError: throwError,
            onCompleted: noOp
        };

        var disposable = queue.get(model, [videos0], [videos0]).subscribe(zipObserver);
        expect(queue.subscriptions.length).to.equal(1);
        expect(queue.subscriptions[0].active).to.equal(true);
        expect(queue.subscriptions[0].disposable).to.be.ok;
        var disposable2 = queue.get(model, [videos0, videos1], [videos0, videos1]).subscribe(zipObserver);
        expect(queue.subscriptions.length).to.equal(2);
        expect(queue.subscriptions[1].active).to.equal(true);
        expect(queue.subscriptions[1].disposable).to.be.ok;

        disposable.dispose();
        disposable2.dispose();

        expect(zip.callCount).to.equal(0);
    });
});

function throwExceptions(spy) {
    spy.exceptions.forEach(function(e) {
        if (e) {
            throw e;
        }
    });
}
