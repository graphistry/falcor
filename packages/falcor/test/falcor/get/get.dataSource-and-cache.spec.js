var $ref = require('@graphistry/falcor-json-graph').ref;
var $atom = require('@graphistry/falcor-json-graph').atom;
var Model = require('./../../../falcor.js').Model;
var FalcorJSON = require('./../../../falcor.js').FalcorJSON;
var Rx = require('rx');
var noOp = function() {};
var LocalDataSource = require('../../data/LocalDataSource');
var Observable = Rx.Observable;
var sinon = require('sinon');
var expect = require('chai').expect;
var strip = require('./../../cleanData').stripDerefAndVersionKeys;
var cacheGenerator = require('./../../CacheGenerator');
var jsonGraph = require('@graphistry/falcor-json-graph');
var toFlatBuffer = require('@graphistry/falcor-path-utils').toFlatBuffer;
var computeFlatBufferHash = require('@graphistry/falcor-path-utils').computeFlatBufferHash;

var M = function(m) {
    return cacheGenerator(0, 1);
};
var Cache = function(c) {
    return cacheGenerator(0, 40);
};

describe('DataSource and Cache', function() {
    describe('Preload Functions', function() {
        it('should get multiple arguments.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var onNext = sinon.spy();
            var secondOnNext = sinon.spy();
            toObservable(model.
                preload(['videos', 0, 'title'], ['videos', 1, 'title'])).
                doAction(onNext, noOp, function() {
                    expect(onNext.callCount).to.equal(0);
                }).
                defaultIfEmpty({}).
                flatMap(function() {
                    return model.get(['videos', 0, 'title'], ['videos', 1, 'title']);
                }).
                doAction(secondOnNext, noOp, function() {
                    expect(secondOnNext.calledOnce).to.be.ok;
                    expect(strip(secondOnNext.getCall(0).args[0])).to.deep.equals({
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

        it('should get a complex argument into a single arg.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var onNext = sinon.spy();
            var secondOnNext = sinon.spy();
            toObservable(model.
                preload(['lolomo', 0, {to: 1}, 'item', 'title'])).
                doAction(onNext).
                doAction(noOp, noOp, function() {
                    expect(onNext.callCount).to.equal(0);
                }).
                defaultIfEmpty({}).
                flatMap(function() {
                    return model.get(['lolomo', 0, {to: 1}, 'item', 'title']);
                }).
                doAction(secondOnNext, noOp, function() {
                    expect(secondOnNext.calledOnce).to.be.ok;
                    expect(strip(secondOnNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            lolomo: {
                                0: {
                                    0: {
                                        item: {
                                            title: 'Video 0'
                                        }
                                    },
                                    1: {
                                        item: {
                                            title: 'Video 1'
                                        }
                                    }
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('JSON', function() {
        it('should ensure empty paths do not cause dataSource requests {from:1, to:0}', function(done) {
            var onGet = sinon.spy();
            var model = new Model({
                cache: {
                    a: $ref(['c']),
                    c: {
                        0: $atom('hello')
                    }
                },
                source: {
                    get: onGet
                }
            });

            var modelGet = model.get(['b', {to:0, from:1}]);
            var onNext = sinon.spy();
            toObservable(modelGet).
                doAction(onNext, noOp, function() {
                    expect(onGet.callCount).to.equals(0);
                    expect(onNext.callCount).to.equals(0);
                }).
                subscribe(noOp, done, done);
        });
        it('should ensure empty paths do not cause dataSource requests [].', function(done) {
            var onGet = sinon.spy();
            var model = new Model({
                cache: {
                    a: $ref(['c']),
                    c: {
                        0: $atom('hello')
                    }
                },
                source: {
                    get: onGet
                }
            });

            var modelGet = model.get(['b', []]);
            var onNext = sinon.spy();
            toObservable(modelGet).
                doAction(onNext, noOp, function() {
                    expect(onGet.callCount).to.equals(0);
                    expect(onNext.callCount).to.equals(0);
                }).
                subscribe(noOp, done, done);
        });

        it('should get multiple arguments into a single toJSON response.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var onNext = sinon.spy();
            toObservable(model.
                get(['lolomo', 0, 0, 'item', 'title'], ['lolomo', 0, 1, 'item', 'title'])).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            lolomo: {
                                0: {
                                    0: {
                                        item: {
                                            title: 'Video 0'
                                        }
                                    },
                                    1: {
                                        item: {
                                            title: 'Video 1'
                                        }
                                    }
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });

        it('should get a complex argument into a single arg.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var onNext = sinon.spy();
            toObservable(model.
                get(['lolomo', 0, {to: 1}, 'item', 'title'])).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            lolomo: {
                                0: {
                                    0: {
                                        item: {
                                            title: 'Video 0'
                                        }
                                    },
                                    1: {
                                        item: {
                                            title: 'Video 1'
                                        }
                                    }
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });

        it('should get a complex argument into a single arg and collect to max cache size.', function(done) {
            var model = new Model({
                cache: M(),
                source: new LocalDataSource(Cache()),
                maxSize: 0
            });
            var cache = model._root.cache;
            var onNext = sinon.spy();
            toObservable(model.
                get(['lolomo', 0, {to: 1}, 'item', 'title'])).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            lolomo: {
                                0: {
                                    0: {
                                        item: {
                                            title: 'Video 0'
                                        }
                                    },
                                    1: {
                                        item: {
                                            title: 'Video 1'
                                        }
                                    }
                                }
                            }
                        }
                    });
                }).
                finally(function() {
                    expect(cache['$size']).to.equal(0);
                    done();
                }).
                subscribe(noOp, done, noOp);
        });

        it('should ensure that a response where only materialized atoms come through still onNexts a value if one is present in cache.', function(done) {
            var model = new Model({
                cache: {
                    paths: {
                        0: 'test',
                        1: 'test'
                    }
                },
                source: new LocalDataSource({
                    paths: {
                        2: $atom(undefined),
                        3: $atom(undefined)
                    }
                }, {materialize: true})
            });

            var onNext = sinon.spy();
            toObservable(model.
                get(['paths', {to:3}])).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce, 'onNext called').to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            paths: {
                                0: 'test',
                                1: 'test'
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('_toJSONG', function() {
        it('should get multiple arguments into a single _toJSONG response.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var onNext = sinon.spy();
            toObservable(model.
                get(['lolomo', 0, 0, 'item', 'title'], ['lolomo', 0, 1, 'item', 'title']).
                _toJSONG()).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    var out = strip(onNext.getCall(0).args[0]);
                    var expected = strip({
                        jsonGraph: cacheGenerator(0, 2),
                        paths: [
                            ['lolomo', 0, {from: 0, to: 1}, 'item', 'title']
                        ]
                    });
                    expect(out).to.deep.equals(expected);
                }).
                subscribe(noOp, done, done);
        });

        it('should get a complex argument into a single arg.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var onNext = sinon.spy();
            toObservable(model.
                get(['lolomo', 0, {to: 1}, 'item', 'title']).
                _toJSONG()).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    var out = strip(onNext.getCall(0).args[0]);
                    var expected = strip({
                        jsonGraph: cacheGenerator(0, 2),
                        paths: [
                            ['lolomo', 0, {from: 0, to: 1}, 'item', 'title']
                        ]
                    });
                    expect(out).to.deep.equals(expected);
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('Progressively', function() {
        it('should get multiple arguments with multiple trips to the dataSource into a single toJSON response.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var count = 0;
            toObservable(model.
                get(['lolomo', 0, 0, 'item', 'title'], ['lolomo', 0, 1, 'item', 'title']).
                progressively()).
                doAction(function(x) {
                    count++;
                    if (count === 1) {
                        expect(strip(x)).to.deep.equals({
                            json: {
                                lolomo: {
                                    0: {
                                        0: {
                                            item: {
                                                title: 'Video 0'
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        expect(strip(x)).to.deep.equals({
                            json: {
                                lolomo: {
                                    0: {
                                        0: {
                                            item: {
                                                title: 'Video 0'
                                            }
                                        },
                                        1: {
                                            item: {
                                                title: 'Video 1'
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }, noOp, function() {
                    expect(count).to.equals(2);
                }).
                subscribe(noOp, done, done);
        });

        it('should get complex path with multiple trips to the dataSource into a single toJSON response.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var count = 0;
            toObservable(model.
                get(['lolomo', 0, {to: 1}, 'item', 'title']).
                progressively()).
                doAction(function(x) {
                    count++;
                    if (count === 1) {
                        expect(strip(x)).to.deep.equals({
                            json: {
                                lolomo: {
                                    0: {
                                        0: {
                                            item: {
                                                title: 'Video 0'
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        expect(strip(x)).to.deep.equals({
                            json: {
                                lolomo: {
                                    0: {
                                        0: {
                                            item: {
                                                title: 'Video 0'
                                            }
                                        },
                                        1: {
                                            item: {
                                                title: 'Video 1'
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }, noOp, function() {
                    expect(count).to.equals(2);
                }).
                subscribe(noOp, done, done);
        });

        it('should get different response objects with multiple trips to the dataSource.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var revisions = [];
            toObservable(model.
                get(['lolomo', 0, [0, 1], 'item', 'title']).
                progressively()).
                doAction(function(x) {
                    revisions.push(x);
                }, noOp, function() {
                    expect(revisions.length).to.equals(2);
                    expect(revisions[1]).to.not.equal(revisions[0]);
                    expect(revisions[1].json.lolomo[0]).to.not.equal(revisions[0].json.lolomo[0]);
                    expect(revisions[1].json.lolomo[0][0]).to.equal(revisions[0].json.lolomo[0][0]);
                    expect(revisions[1].json.lolomo[0][1]).to.not.equal(revisions[0].json.lolomo[0][1]);
                }).
                subscribe(noOp, done, done);
        });

    });
    describe('Recycle JSON', function() {
        it('should get multiple arguments with multiple trips to the dataSource into a single toJSON response.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache()), recycleJSON: true});
            var count = 0;
            toObservable(model.
                get(['lolomo', 0, 0, 'item', 'title'], ['lolomo', 0, 1, 'item', 'title'])).
                doAction(function(x) {
                    count++;
                    // x.json[f_meta_data] = x.json[f_meta_data];
                    // x.json['lolomo'][f_meta_data] = x.json['lolomo'][f_meta_data];
                    // x.json['lolomo'][0][f_meta_data] = x.json['lolomo'][0][f_meta_data];
                    // x.json['lolomo'][0][0][f_meta_data] = x.json['lolomo'][0][0][f_meta_data];
                    // x.json['lolomo'][0][1][f_meta_data] = x.json['lolomo'][0][1][f_meta_data];
                    // x.json['lolomo'][0][0]['item'][f_meta_data] = x.json['lolomo'][0][0]['item'][f_meta_data];
                    // x.json['lolomo'][0][1]['item'][f_meta_data] = x.json['lolomo'][0][1]['item'][f_meta_data];
                    expect(x).to.deep.equals({
                        __proto__: FalcorJSON.prototype,
                        json: {
                            __proto__: FalcorJSON.prototype,
                            [f_meta_data]: {
                                '$code':          '350990479',
                                [f_meta_keys]:        { lolomo: true },
                                [f_meta_abs_path]:    undefined,
                                [f_meta_deref_from]:  undefined,
                                [f_meta_deref_to]:    undefined,
                                [f_meta_version]:     1
                            },
                            lolomo: {
                                __proto__: FalcorJSON.prototype,
                                [f_meta_data]: {
                                    '$code':          '1437563678',
                                    [f_meta_keys]:        { 0: true },
                                    [f_meta_abs_path]:    ['lolomos', '1234'],
                                    [f_meta_deref_from]:  undefined,
                                    [f_meta_deref_to]:    undefined,
                                    [f_meta_version]:     1
                                },
                                0: {
                                    __proto__: FalcorJSON.prototype,
                                    [f_meta_data]: {
                                        '$code':          '2823858104',
                                        [f_meta_keys]:        { 0: true, 1: true },
                                        [f_meta_abs_path]:    ['lists', 'A'],
                                        [f_meta_deref_from]:  undefined,
                                        [f_meta_deref_to]:    undefined,
                                        [f_meta_version]:     1
                                    },
                                    0: {
                                        __proto__: FalcorJSON.prototype,
                                        [f_meta_data]: {
                                            '$code':          '3681981706',
                                            [f_meta_keys]:        { item: true },
                                            [f_meta_abs_path]:    ['lists', 'A', '0'],
                                            [f_meta_deref_from]:  undefined,
                                            [f_meta_deref_to]:    undefined,
                                            [f_meta_version]:     0
                                        },
                                        item: {
                                            __proto__: FalcorJSON.prototype,
                                            [f_meta_data]: {
                                                '$code':          '165499941',
                                                [f_meta_keys]:        { title: true },
                                                [f_meta_abs_path]:    ['videos', '0'],
                                                [f_meta_deref_from]:  undefined,
                                                [f_meta_deref_to]:    undefined,
                                                [f_meta_version]:     0
                                            },
                                            title: 'Video 0'
                                        }
                                    },
                                    1: {
                                        __proto__: FalcorJSON.prototype,
                                        [f_meta_data]: {
                                            '$code':          '3681981706',
                                            [f_meta_keys]:        { item: true },
                                            [f_meta_abs_path]:    ['lists', 'A', 1],
                                            [f_meta_deref_from]:  undefined,
                                            [f_meta_deref_to]:    undefined,
                                            [f_meta_version]:     1
                                        },
                                        item: {
                                            __proto__: FalcorJSON.prototype,
                                            [f_meta_data]: {
                                                '$code':          '165499941',
                                                [f_meta_keys]:        { title: true },
                                                [f_meta_abs_path]:    ['videos', '1'],
                                                [f_meta_deref_from]:  undefined,
                                                [f_meta_deref_to]:    undefined,
                                                [f_meta_version]:     1
                                            },
                                            title: 'Video 1'
                                        }
                                    }
                                }
                            }
                        }
                    });
                }, noOp, function() {
                    expect(count).to.equals(1);
                }).
                subscribe(noOp, done, done);
        });
        it('should get a complex keyset where a reference is in the cache but the ref target is loaded from a trip to the dataSource into a single toJSON response.', function(done) {
            var cache = cacheGenerator(0, 2);
            delete cache.videos[1];
            var model = new Model({
                cache: cache,
                recycleJSON: true,
                source: new LocalDataSource(Cache())
            });
            var count = 0;
            toObservable(model.
                // get(['lolomo', 0, { length: 2 }, 'item', 'title'])).
                get(['lolomo', 0, 0, 'item', 'title'], ['lolomo', 0, 1, 'item', 'title'])).
                doAction(function(x) {
                    count++;
                    // x.json[f_meta_data] = x.json[f_meta_data];
                    // x.json['lolomo'][f_meta_data] = x.json['lolomo'][f_meta_data];
                    // x.json['lolomo'][0][f_meta_data] = x.json['lolomo'][0][f_meta_data];
                    // x.json['lolomo'][0][0][f_meta_data] = x.json['lolomo'][0][0][f_meta_data];
                    // x.json['lolomo'][0][1][f_meta_data] = x.json['lolomo'][0][1][f_meta_data];
                    // x.json['lolomo'][0][0]['item'][f_meta_data] = x.json['lolomo'][0][0]['item'][f_meta_data];
                    // x.json['lolomo'][0][1]['item'][f_meta_data] = x.json['lolomo'][0][1]['item'][f_meta_data];
                    expect(x).to.deep.equals({
                        __proto__: FalcorJSON.prototype,
                        json: {
                            __proto__: FalcorJSON.prototype,
                            [f_meta_data]: {
                                '$code':          '350990479',
                                [f_meta_keys]:        { lolomo: true },
                                [f_meta_abs_path]:    undefined,
                                [f_meta_deref_from]:  undefined,
                                [f_meta_deref_to]:    undefined,
                                [f_meta_version]:     1
                            },
                            lolomo: {
                                __proto__: FalcorJSON.prototype,
                                [f_meta_data]: {
                                    '$code':          '1437563678',
                                    [f_meta_keys]:        { 0: true },
                                    [f_meta_abs_path]:    ['lolomos', '1234'],
                                    [f_meta_deref_from]:  undefined,
                                    [f_meta_deref_to]:    undefined,
                                    [f_meta_version]:     0
                                },
                                0: {
                                    __proto__: FalcorJSON.prototype,
                                    [f_meta_data]: {
                                        '$code':          '2823858104',
                                        [f_meta_keys]:        { 0: true, 1: true },
                                        [f_meta_abs_path]:    ['lists', 'A'],
                                        [f_meta_deref_from]:  undefined,
                                        [f_meta_deref_to]:    undefined,
                                        [f_meta_version]:     0
                                    },
                                    0: {
                                        __proto__: FalcorJSON.prototype,
                                        [f_meta_data]: {
                                            '$code':          '3681981706',
                                            [f_meta_keys]:        { item: true },
                                            [f_meta_abs_path]:    ['lists', 'A', '0'],
                                            [f_meta_deref_from]:  undefined,
                                            [f_meta_deref_to]:    undefined,
                                            [f_meta_version]:     0
                                        },
                                        item: {
                                            __proto__: FalcorJSON.prototype,
                                            [f_meta_data]: {
                                                '$code':          '165499941',
                                                [f_meta_keys]:        { title: true },
                                                [f_meta_abs_path]:    ['videos', '0'],
                                                [f_meta_deref_from]:  undefined,
                                                [f_meta_deref_to]:    undefined,
                                                [f_meta_version]:     0
                                            },
                                            title: 'Video 0'
                                        }
                                    },
                                    1: {
                                        __proto__: FalcorJSON.prototype,
                                        [f_meta_data]: {
                                            '$code':          '3681981706',
                                            [f_meta_keys]:        { item: true },
                                            [f_meta_abs_path]:    ['lists', 'A', '1'],
                                            [f_meta_deref_from]:  undefined,
                                            [f_meta_deref_to]:    undefined,
                                            [f_meta_version]:     0
                                        },
                                        item: {
                                            __proto__: FalcorJSON.prototype,
                                            [f_meta_data]: {
                                                '$code':          '165499941',
                                                [f_meta_keys]:        { title: true },
                                                [f_meta_abs_path]:    ['videos', 1],
                                                [f_meta_deref_from]:  undefined,
                                                [f_meta_deref_to]:    undefined,
                                                [f_meta_version]:     1
                                            },
                                            title: 'Video 1'
                                        }
                                    }
                                }
                            }
                        }
                    });
                }, noOp, function() {
                    expect(count).to.equals(1);
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('Error Selector (during merge)', function() {

        function generateErrorSelectorSpy() {
            return sinon.spy(function(path, atom) {

                // Needs to be asserted before mutation.
                expect(atom.$type).to.equal('error');
                expect(atom.value).to.deep.equals({ message:'errormsg' });

                atom.$custom = 'custom';
                atom.value.customtype = 'customtype';

                return atom;
            });
        }

        function assertExpectedErrorPayload(e, expectedPath) {
            var path = e.path;
            var value = e.value;

            // To avoid hardcoding/scrubbing $size, and other internals
            expect(path).to.deep.equals(expectedPath);

            expect(value.$type).to.equal('error');
            expect(value.$custom).to.equal('custom');
            expect(value.value).to.deep.equals({
                message: 'errormsg',
                customtype: 'customtype'
            });
        }

        it('should get invoked with the right arguments for branches in cache', function(done) {

            // Cache has [lolomo,0,0,item]
            var testPath = ['lolomo',0,0,'item','errorPath'];

            var modelCache = M();
            var dataSourceCache = Cache();
            // [lolomo,0,0,item]->[videos,0]
            dataSourceCache.videos[0].errorPath = jsonGraph.error({ message:'errormsg' });

            var onNextSpy = sinon.spy();
            var onErrorSpy = sinon.spy();
            var errorSelectorSpy = generateErrorSelectorSpy();

            var model = new Model({
                cache: modelCache,
                source: new LocalDataSource(dataSourceCache),
                errorSelector: errorSelectorSpy
            });

            toObservable(model.
                boxValues().
                get(testPath)).
                doAction(onNextSpy, onErrorSpy, noOp).
                doAction(null, function(e) {
                    expect(e.length).to.equal(1);
                    expect(onNextSpy.callCount).to.equal(0);
                    expect(onErrorSpy.callCount).to.equal(1);
                    expect(errorSelectorSpy.callCount).to.equal(1);
                    assertExpectedErrorPayload(e[0], ['videos', '0', 'errorPath']);
                })
                .subscribe(
                    done.bind(null, 'onNext should not have been called'),
                    function() { done() },
                    done.bind(null, 'onCompleted should not have been called')
                );
        });

        it('should get invoked with the right arguments for branches not in cache', function(done) {

            // Cache doesn't have [lolomo,1,0,item]
            var testPath = ['lolomo',1,0,'item','errorPath'];

            var modelCache = M();
            var dataSourceCache = Cache();

            // [lolomo,1,0,item]->[videos,10]
            dataSourceCache.videos[10].errorPath = jsonGraph.error({ message:'errormsg' });

            var onNextSpy = sinon.spy();
            var onErrorSpy = sinon.spy();
            var errorSelectorSpy = generateErrorSelectorSpy();

            var model = new Model({
                cache: modelCache,
                source: new LocalDataSource(dataSourceCache),
                errorSelector: errorSelectorSpy
            });

            toObservable(model.
                boxValues().
                get(testPath)).
                doAction(onNextSpy, onErrorSpy, noOp).
                doAction(null, function(e) {
                    expect(e.length).to.equal(1);
                    expect(onNextSpy.callCount).to.equal(0);
                    expect(onErrorSpy.callCount).to.equal(1);
                    expect(errorSelectorSpy.callCount).to.equal(1);
                    assertExpectedErrorPayload(e[0], ['videos', '10', 'errorPath']);
                })
                .subscribe(
                    done.bind(null, 'onNext should not have been called'),
                    function() { done() },
                    done.bind(null, 'onCompleted should not have been called')
                );
        });

        it('should get invoked with the correct error paths for a keyset', function(done) {
            var testPath = ['lolomo',[0,1],0,'item','errorPath'];

            var modelCache = M();
            var dataSourceCache = Cache();

            dataSourceCache.videos[0].errorPath = jsonGraph.error({ message:'errormsg' });
            dataSourceCache.videos[10].errorPath = jsonGraph.error({ message:'errormsg' });

            var onNextSpy = sinon.spy();
            var onErrorSpy = sinon.spy();
            var errorSelectorSpy = generateErrorSelectorSpy();

            var model = new Model({
                cache: modelCache,
                source: new LocalDataSource(dataSourceCache),
                errorSelector: errorSelectorSpy
            });

            toObservable(model.
                boxValues().
                get(testPath)).
                doAction(onNextSpy, onErrorSpy, noOp).
                doAction(null, function(e) {
                    expect(e.length).to.equal(1);
                    expect(onNextSpy.callCount).to.equal(0);
                    expect(onErrorSpy.callCount).to.equal(1);
                    expect(errorSelectorSpy.callCount).to.equal(2);
                    assertExpectedErrorPayload(e[0], ['videos', '0', 'errorPath']);
                    assertExpectedErrorPayload(e[1], ['videos', '10', 'errorPath']);
                })
                .subscribe(
                    done.bind(null, 'onNext should not have been called'),
                    function() { done() },
                    done.bind(null, 'onCompleted should not have been called')
                );
        });
    });
    describe('Cached data with timestamp', function() {
        var t0 = Date.parse('2000/01/01');
        var t1 = t0 + 1;

        function remoteData() {
            return {
                videos: {
                    1: {
                        bookmark: $atom('remote value', {$timestamp: t0})
                    },
                    2: {
                        previous: $ref(['videos', 1])
                    }
                }
            };
        }

        it('should not be replaced by data with an older timestamp', function(done) {
            var cache = {
                videos: {
                    1: {
                        bookmark: $atom('cached value', {$timestamp: t1})
                    }
                }
            };
            var source = new LocalDataSource(remoteData());
            var model = new Model({cache: cache, source: source});
            model.getValue(['videos', 2, 'previous', 'bookmark']).
                then(function(value) {
                    expect(value).to.equal('cached value');
                    done();
                }).
                catch(function(e) {
                    done(e);
                });
        });

        it('when expired should be replaced by data with an older timestamp', function(done) {
            var cache = {
                videos: {
                    1: {
                        bookmark: $atom('cached value', {$timestamp: t1, $expires: t1})
                    }
                }
            };
            var source = new LocalDataSource(remoteData());
            var model = new Model({cache: cache, source: source});
            model.getValue(['videos', 2, 'previous', 'bookmark']).
                then(function(value) {
                    expect(value).to.equal('remote value');
                    done();
                }).
                catch(function(e) {
                    done(e);
                });
        });
    });
});

