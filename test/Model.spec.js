var Rx = require("rx");
var rxjs = require("rxjs");

var falcor = require("../lib");
var Model = falcor.Model;
var $ref = require('@graphistry/falcor-json-graph').ref;
var $atom = require('@graphistry/falcor-json-graph').atom;
var $error = require('@graphistry/falcor-json-graph').error;
var fromPath = require('@graphistry/falcor-path-syntax').fromPath;
var fromPaths = require('@graphistry/falcor-path-syntax').fromPathsOrPathValues;

function ResponseObservable(response) {
    this.response = response;
}

ResponseObservable.prototype = Object.create(Rx.Observable.prototype);

ResponseObservable.prototype._subscribe = function(observer) {
    return this.response.subscribe(observer);
};

ResponseObservable.prototype._toJSONG = function() {
    return new ResponseObservable(this.response._toJSONG.apply(this.response, arguments));
};

ResponseObservable.prototype.progressively = function() {
    return new ResponseObservable(this.response.progressively.apply(this.response, arguments));
};

ResponseObservable.prototype.then = function() {
    return this.response.then.apply(this.response, arguments);
};

ResponseObservable.prototype[Symbol.observable] = function() {
    return this.response[Symbol.observable].apply(this.response, arguments);
};

var modelGet = Model.prototype.get;
var modelSet = Model.prototype.set;
var modelCall = Model.prototype.call;
var modelInvalidate = Model.prototype.invalidate;
var modelGetVersion = Model.prototype.getVersion;
var modelPreload = Model.prototype.preload;
var modelGetValue = Model.prototype.getValue;
var modelSetValue = Model.prototype.setValue;

Model.prototype.get = function() {
    return new ResponseObservable(modelGet.apply(this, fromPaths(Array.prototype.slice.call(arguments))));
};

Model.prototype.set = function() {
    return new ResponseObservable(modelSet.apply(this, fromPaths(Array.prototype.slice.call(arguments))));
};

Model.prototype.call = function(fnPath, fnArgs, refPaths, thisPaths) {
    fnPath = fromPath(fnPath);
    refPaths = refPaths && fromPaths([].concat(refPaths)) || [];
    thisPaths = thisPaths && fromPaths([].concat(thisPaths)) || [];
    return new ResponseObservable(modelCall.call(this, fnPath, fnArgs, refPaths, thisPaths));
};

Model.prototype.invalidate = function() {
    return modelInvalidate.apply(this, fromPaths(Array.prototype.slice.call(arguments)));
};

Model.prototype.getVersion = function() {
    return modelGetVersion.apply(this, fromPaths(Array.prototype.slice.call(arguments)));
};

Model.prototype.preload = function() {
    return new ResponseObservable(modelPreload.apply(this, fromPaths(Array.prototype.slice.call(arguments))));
};

Model.prototype.getValue = function() {
    return new ResponseObservable(modelGetValue.apply(this, fromPaths(Array.prototype.slice.call(arguments))));
};

Model.prototype.setValue = function(path, value) {
    if (typeof path === 'string') {
        path = fromPath(path);
    }
    return new ResponseObservable(modelSetValue.call(this, path, value));
};

var testRunner = require('./testRunner');
var chai = require("chai");
var expect = chai.expect;
var $ref = require('./../lib/types/ref');
var $error = require('./../lib/types/error');
var $atom = require('./../lib/types/atom');
global.toObservable = require('./toObs');

describe("Model", function() {

    it("should construct a new Model", function() {
        new Model();
    });

    it("should construct a new Model when calling the falcor module function", function() {
        expect(falcor() instanceof falcor.Model).to.equal(true);
    });

    xit('should have access to static helper methods.', function() {
        var ref = ['a', 'b', 'c'];
        var err = {ohhh: 'no!'};

        var out = $ref(ref);
        testRunner.compare({$type: $ref, value: ref}, out);

        out = $ref('a.b.c');
        testRunner.compare({$type: $ref, value: ref}, out);

        out = $error(err);
        testRunner.compare({$type: $error, value: err}, out);

        out = $atom(1337);
        testRunner.compare({$type: $atom, value: 1337}, out);
    });

    it('unsubscribing should cancel DataSource request.', function(done) {
        var onNextCalled = 0,
            onErrorCalled = 0,
            onCompletedCalled = 0,
            unusubscribeCalled = 0,
            dataSourceGetCalled = 0;

        var model = new Model({
            cache: {
                list: {
                    0: { name: "test" }
                }
            },
            source: {
                get: function() {
                    return {
                        subscribe: function(observerOrOnNext, onError, onCompleted) {
                            dataSourceGetCalled++;
                            var handle = setTimeout(function() {
                                var response = {
                                    jsonGraph: {
                                        list: {
                                            1: { name: "another test" }
                                        }
                                    },
                                    paths: ["list", 1, "name"]
                                };

                                if (typeof observerOrOnNext === "function") {
                                    observerOrOnNext(response);
                                    onCompleted();
                                }
                                else {
                                    observerOrOnNext.onNext(response);
                                    observerOrOnNext.onCompleted();
                                }
                            });

                            return {
                                dispose: function() {
                                    unusubscribeCalled++;
                                    clearTimeout(handle);
                                }
                            }
                        }
                    }
                }
            }
        });

        var subscription = model.get("list[0,1].name").
            subscribe(
                function(value) {
                    onNextCalled++;
                },
                function(error) {
                    onErrorCalled++;
                },
                function() {
                    onCompletedCalled++;
                });

        subscription.dispose();

        if (dataSourceGetCalled === 1 && !onNextCalled && unusubscribeCalled === 1 && !onErrorCalled && !onCompletedCalled) {
            done()
        }
        else {
            done(new Error("DataSource unsubscribe not called."));
        }
    });

    it('Supports RxJS 5.', function(done) {
        var onNextCalled = 0,
            onErrorCalled = 0,
            onCompletedCalled = 0,
            unusubscribeCalled = 0,
            dataSourceGetCalled = 0;

        var model = new Model({
            cache: {
                list: {
                    0: { name: "test" }
                }
            },
            source: {
                get: function() {
                    return {
                        subscribe: function(observerOrOnNext, onError, onCompleted) {
                            dataSourceGetCalled++;
                            var handle = setTimeout(function() {
                                var response = {
                                    jsonGraph: {
                                        list: {
                                            1: { name: "another test" }
                                        }
                                    },
                                    paths: ["list", 1, "name"]
                                };

                                if (typeof observerOrOnNext === "function") {
                                    observerOrOnNext(response);
                                    onCompleted();
                                }
                                else {
                                    observerOrOnNext.onNext(response);
                                    observerOrOnNext.onCompleted();
                                }
                            });

                            return {
                                dispose: function() {
                                    unusubscribeCalled++;
                                    clearTimeout(handle);
                                }
                            }
                        }
                    }
                }
            }
        });

        var subscription = rxjs.Observable
            .from(modelGet.call(model, fromPath("list[0,1].name")))
            .subscribe(
                function(value) {
                    onNextCalled++;
                },
                function(error) {
                    onErrorCalled++;
                    done(error);
                },
                function() {
                    onCompletedCalled++;
                    if (onNextCalled === 0) {
                        done('onNext wasn\'t called');
                    } else {
                        done();
                    }
                });

        if (dataSourceGetCalled !== 1 || unusubscribeCalled) {
            done(new Error("DataSource unsubscribe was called."));
        }
    });

    describe('JSON-Graph Specification', function() {
        require('./get-core');

        describe("#set", function() {
            require("./set")();
        });

        describe("#invalidate", function() {
            require("./invalidate")();
        });
    });

    require('./lru');
    require('./hardlink');
    require('./falcor');
    require('./internal');

});
