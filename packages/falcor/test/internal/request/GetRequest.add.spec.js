var sinon = require('sinon');
var expect = require('chai').expect;
var Request = require('./../../../lib/request/Request');
var ImmediateScheduler = require('./../../../lib/schedulers/ImmediateScheduler');
var Rx = require('rx');
var Model = require('./../../../falcor.js').Model;
var LocalDataSource = require('./../../data/LocalDataSource');
var cacheGenerator = require('./../../CacheGenerator');
var strip = require('./../../cleanData').stripDerefAndVersionKeys;
var noOp = function() {};
function throwError(e) { throw e; }

var Cache = function() { return cacheGenerator(0, 2); };

var toFlatBuffer = require('@graphistry/falcor-path-utils/lib/toFlatBuffer');
var flatBufferToPaths = require('@graphistry/falcor-path-utils/lib/flatBufferToPaths');

describe('#add', function() {
    describe('with Paths', function() {
        runTestsWithOptions(false);
    });
    describe('with FlatBuffers', function() {
        runTestsWithOptions(true);
    });
});

function runTestsWithOptions(recycleJSON) {

    function zipSpy(count, cb) {
        return sinon.spy(function() {
            --count;
            if (count === 0) {
                cb();
            }
        });
    }

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

    it('should send a request and dedupe another.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy,
            wait: 100
        });
        var model = new Model({ source: source, recycleJSON: recycleJSON });

        var request = new Request('get', {
            remove: function() { },
            modelRoot: model._root
        }, model._source, scheduler);

        var requested = [videos0];
        var optimized = [videos0];
        var requestedExpected = !recycleJSON ? [videos1Path] : toPathsOrFB([videos0, videos1]);

        var zip = zipSpy(1, function() {
            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(getSpy.calledOnce).to.be.ok;
                    expect(getSpy.getCall(0).args[1]).to.deep.equals([videos0Path]);
                    expect(onNext.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0',
                                }
                            }
                        }
                    });

                    expect(optimized).to.deep.equals([videos1Path]);
                    expect(requested).to.deep.equals(requestedExpected);
                }).
                subscribe(noOp, done, done);
        });

        var zipObserver = {
            onNext: zip,
            onError: throwError,
            onCompleted: noOp
        };

        var disposable1 = request.batch(
            toPathsOrFB(requested),
            toPaths(optimized)
        ).subscribe(zipObserver);

        request.connect();

        expect(request.active, 'request should be active').to.be.ok;

        if (!request.batch(
            toPathsOrFB([videos0, videos1]),
            toPaths([videos0, videos1]),
            requested = [], optimized = []
        )) {
            throw new Error('Batch complement failed');
        } else {
            request.subscribe(zipObserver);
        }
    });

    it('should send a request and dedupe another when dedupe is in second position.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy,
            wait: 100
        });
        var model = new Model({ source: source, recycleJSON: recycleJSON });
        var request = new Request('get', {
            remove: function() { },
            modelRoot: model._root
        }, model._source, scheduler);

        var requested = [videos0];
        var optimized = [videos0];
        var requestedExpected = !recycleJSON ? [videos1Path] : toPathsOrFB([videos1, videos0]);

        var zip = zipSpy(2, function() {
            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(getSpy.calledOnce).to.be.ok;
                    expect(getSpy.getCall(0).args[1]).to.deep.equals([videos0Path]);
                    expect(onNext.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0',
                                }
                            }
                        }
                    });

                    expect(requested).to.deep.equals(requestedExpected);
                    expect(optimized).to.deep.equals([videos1Path]);
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

        request.connect();

        expect(request.active, 'request should be active').to.be.ok;

        if (!request.batch(
            toPathsOrFB([videos1, videos0]),
            toPaths([videos1, videos0]),
            requested = [], optimized = []
        )) {
            throw new Error('Batch complement failed');
        } else {
            request.subscribe(zipObserver);
        }
    });

    it('should send a request and dedupe another and dispose of original.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy,
            wait: 100
        });
        var model = new Model({ source: source, recycleJSON: recycleJSON });
        var request = new Request('get', {
            remove: function() { },
            modelRoot: model._root
        }, model._source, scheduler);

        var requested = [videos0];
        var optimized = [videos0];
        var requestedExpected = !recycleJSON ? [videos1Path] : toPathsOrFB([videos1, videos0]);

        var zip = zipSpy(2, function() {
            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(getSpy.calledOnce, 'dataSource get').to.be.ok;
                    expect(getSpy.getCall(0).args[1]).to.deep.equals([videos0Path]);
                    expect(onNext.calledOnce, 'onNext get').to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0',
                                }
                            }
                        }
                    });

                    expect(requested).to.deep.equals(requestedExpected);
                    expect(optimized).to.deep.equals([videos1Path]);
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

        request.connect();

        expect(request.active, 'request should be active').to.be.ok;

        if (!request.batch(
            toPathsOrFB([videos1, videos0]),
            toPaths([videos1, videos0]),
            requested = [], optimized = []
        )) {
            throw new Error('Batch complement failed');
        } else {
            request.subscribe(zipObserver);
            zip();
            disposable1.dispose();
        }
    });

    it('should send a request and dedupe another and dispose of deduped.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy,
            wait: 100
        });
        var model = new Model({ source: source, recycleJSON: recycleJSON });
        var request = new Request('get', {
            remove: function() { },
            modelRoot: model._root
        }, model._source, scheduler);

        var requested = [videos0];
        var optimized = [videos0];
        var requestedExpected = !recycleJSON ? [videos1Path] : toPathsOrFB([videos1, videos0]);

        var zip = zipSpy(2, function() {
            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(getSpy.calledOnce, 'dataSource get').to.be.ok;
                    expect(getSpy.getCall(0).args[1]).to.deep.equals([videos0Path]);
                    expect(onNext.calledOnce, 'onNext get').to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0',
                                }
                            }
                        }
                    });

                    expect(requested).to.deep.equals(requestedExpected);
                    expect(optimized).to.deep.equals([videos1Path]);
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

        request.connect();

        expect(request.active, 'request should be active').to.be.ok;

        if (!request.batch(
            toPathsOrFB([videos1, videos0]),
            toPaths([videos1, videos0]),
            requested = [], optimized = []
        )) {
            throw new Error('Batch complement failed');
        } else {
            request.subscribe(zipObserver).dispose();
            zip();
        }
    });
}
