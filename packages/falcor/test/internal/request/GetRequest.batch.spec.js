var sinon = require('sinon');
var expect = require('chai').expect;
var Request = require('./../../../lib/request/Request');
var TimeoutScheduler = require('./../../../lib/schedulers/TimeoutScheduler');
var ImmediateScheduler = require('./../../../lib/schedulers/ImmediateScheduler');
var Rx = require('rx');
var Model = require('./../../../falcor.js').Model;
var LocalDataSource = require('./../../data/LocalDataSource');
var zipSpy = require('./../../zipSpy');

var cacheGenerator = require('./../../CacheGenerator');
var strip = require('./../../cleanData').stripDerefAndVersionKeys;
var noOp = function() {};
function throwError(e) { throw e; }
var Cache = function() { return cacheGenerator(0, 2); };

var toFlatBuffer = require('@graphistry/falcor-path-utils/lib/toFlatBuffer');
var flatBufferToPaths = require('@graphistry/falcor-path-utils/lib/flatBufferToPaths');

describe('#batch', function() {
    describe('with Paths', function() {
        runTestsWithOptions(false);
    });
    describe('with FlatBuffers', function() {
        runTestsWithOptions(true);
    });
});

function runTestsWithOptions(recycleJSON) {

    var videos0 = ['videos', 0, 'title'];
    var videos1 = ['videos', 1, 'title'];
    var videos0Path = ['videos', 0, 'title'];
    var videos1Path = ['videos', 1, 'title'];

    function toPaths(maybePaths) {
        return flatBufferToPaths(toFlatBuffer(maybePaths, {}));
    }

    function toPathsOrFB(maybePaths) {
        return !recycleJSON ?
            toPaths(maybePaths) : [
            toFlatBuffer(maybePaths, {})];
    }

    if (recycleJSON) {
        videos0 = toFlatBuffer([videos0], {});
        videos1 = toFlatBuffer([videos1], {});
    }

    it('should make a request to the dataSource with an immediate scheduler', function(done) {
        var inlineBoolean = true;
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        var model = new Model({ source: source, recycleJSON: recycleJSON });
        var request = new Request('get', {
            remove: function() { },
            modelRoot: model._root
        }, model._source, scheduler);

        var disposable = request.batch(
            toPathsOrFB([videos0]),
            toPaths([videos0])
        ).subscribe({
            onCompleted: noOp,
            onError: throwError,
            onNext: function() {
                var onNext = sinon.spy();
                toObservable(model.
                    withoutDataSource().
                    get(videos0)).
                    doAction(onNext, noOp, function() {
                        expect(inlineBoolean).to.be.ok;
                        expect(getSpy.calledOnce).to.be.ok;
                        expect(getSpy.getCall(0).args[1]).to.deep.equals([videos0Path]);
                        expect(onNext.calledOnce).to.be.ok;
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
            }
        });
        request.connect();
        inlineBoolean = false;
    });

    it('should make a request to the dataSource with an async scheduler.', function(done) {
        var inlineBoolean = true;
        var scheduler = new TimeoutScheduler(16);
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        var model = new Model({ source: source, recycleJSON: recycleJSON });
        var request = new Request('get', {
            remove: function() { },
            modelRoot: model._root
        }, model._source, scheduler);
        var callback = sinon.spy(function() {
            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0)).
                doAction(onNext, noOp, function() {
                    expect(inlineBoolean).to.not.be.ok;
                    expect(getSpy.calledOnce).to.be.ok;
                    expect(getSpy.getCall(0).args[1]).to.deep.equals([videos0Path]);
                    expect(onNext.calledOnce).to.be.ok;
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

        var disposable = request.batch(
            toPathsOrFB([videos0]),
            toPaths([videos0])
        ).subscribe({
            onNext: callback,
            onError: throwError,
            onCompleted: noOp
        });
        request.connect();
        inlineBoolean = false;
    });

    it('should batch some requests together.', function(done) {
        var scheduler = new TimeoutScheduler(16);
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        var model = new Model({ source: source, recycleJSON: recycleJSON });
        var request = new Request('get', {
            remove: function() { },
            modelRoot: model._root
        }, model._source, scheduler);

        var zip = zipSpy(1, function() {
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
            onCompleted: noOp
        };
        var disposable1 = request.batch(
            toPathsOrFB([videos0]),
            toPaths([videos0])
        ).subscribe(zipObserver);
        var disposable2 = request.batch(
            toPathsOrFB([videos1]),
            toPaths([videos1])
        ).subscribe(zipObserver);
        request.connect();
    });

    it('should batch some requests together and dispose the first one.', function(done) {
        var scheduler = new TimeoutScheduler(16);
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        var model = new Model({ source: source, recycleJSON: recycleJSON });
        var request = new Request('get', {
            remove: function() { },
            modelRoot: model._root
        }, model._source, scheduler);

        var zip = zipSpy(1, function() {
            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(zip.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
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
        var disposable1 = request.batch(
            toPathsOrFB([videos0]),
            toPaths([videos0])
        ).subscribe(zipObserver);
        var disposable2 = request.batch(
            toPathsOrFB([videos1]),
            toPaths([videos1])
        ).subscribe(zipObserver);
        request.connect();
        disposable1.dispose();
    });

    it('should batch some requests together and dispose the second one.', function(done) {
        var scheduler = new TimeoutScheduler(16);
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        var model = new Model({ source: source, recycleJSON: recycleJSON });
        var request = new Request('get', {
            remove: function() { },
            modelRoot: model._root
        }, model._source, scheduler);

        var zip = zipSpy(1, function() {
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
        var disposable1 = request.batch(
            toPathsOrFB([videos0]),
            toPaths([videos0])
        ).subscribe(zipObserver);

        var disposable2 = request.batch(
            toPathsOrFB([videos1]),
            toPaths([videos1])
        ).subscribe(zipObserver);

        request.connect();

        disposable2.dispose();
    });
}
