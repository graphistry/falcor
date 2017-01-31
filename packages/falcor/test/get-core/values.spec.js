var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var outputGenerator = require('./../outputGenerator');
var jsonGraph = require('@graphistry/falcor-json-graph');
var Model = require('./../../falcor.js').Model;
var FalcorJSON = require('./../../falcor.js').FalcorJSON;
var atom = jsonGraph.atom;
var ref = jsonGraph.ref;
var _ = require('lodash');
var expect = require('chai').expect;
var InvalidKeySetError = require('./../../lib/errors/InvalidKeySetError');
var toFlatBuffer = require('@graphistry/falcor-path-utils/lib/toFlatBuffer');
var computeFlatBufferHash = require('@graphistry/falcor-path-utils/lib/computeFlatBufferHash');

describe('Values', function() {
    // PathMap ----------------------------------------
    it('should get a simple value out of the cache', function() {
        getCoreRunner({
            input: [['videos', 0, 'title']],
            output: outputGenerator.videoGenerator([0]),
            cache: cacheGenerator(0, 1)
        });
    });
    it('should get a value through a reference.', function() {
        getCoreRunner({
            input: [['lolomo', 0, 0, 'item', 'title']],
            output: outputGenerator.lolomoGenerator([0], [0]),
            cache: cacheGenerator(0, 1)
        });
    });
    it('should get branches to undefined values in materialized mode.', function() {
        getCoreRunner({
            input: [['videos', {to:2}, 'title']],
            materialize: true,
            stripMetadata: false,
            output: {
                json: {
                    [f_meta_data]: {
                        [f_meta_abs_path]: undefined,
                        [f_meta_version]: 0,
                        [f_meta_status]: 'pending'
                    },
                    videos: {
                        [f_meta_data]: {
                            [f_meta_abs_path]: ['videos'],
                            [f_meta_version]: 0,
                            [f_meta_status]: 'pending'
                        },
                        0: {
                            [f_meta_data]: {
                                [f_meta_abs_path]: ['videos', 0],
                                [f_meta_version]: 0,
                                [f_meta_status]: 'resolved'
                            },
                            title: undefined
                        },
                        1: {
                            [f_meta_data]: {
                                [f_meta_abs_path]: ['videos', 1],
                                [f_meta_version]: 0,
                                [f_meta_status]: 'resolved'
                            },
                            title: undefined
                        },
                        2: {
                            [f_meta_data]: {
                                [f_meta_abs_path]: ['videos', 2],
                                [f_meta_version]: 0,
                                [f_meta_status]: 'resolved'
                            },
                            title: undefined
                        }
                    }
                }
            },
            cache: {
                jsonGraph: {
                    videos: {
                        0: {
                            title: {$type: 'atom'}
                        },
                        1: {
                            title: {$type: 'atom'}
                        }
                    }
                },
                paths: [
                    ['videos', {to: 1}, 'title']
                ]
            }
        });
    });
    it('should get a value of type atom when in boxed and materialized mode.', function() {
        getCoreRunner({
            input: [['videos', {to:2}, 'title']],
            boxValues: true,
            materialize: true,
            stripMetadata: false,
            output: {
                json: {
                    [f_meta_data]: {
                        [f_meta_abs_path]: undefined,
                        [f_meta_version]: 0,
                        [f_meta_status]: 'pending'
                    },
                    videos: {
                        [f_meta_data]: {
                            [f_meta_abs_path]: ['videos'],
                            [f_meta_version]: 0,
                            [f_meta_status]: 'pending'
                        },
                        0: {
                            [f_meta_data]: {
                                [f_meta_abs_path]: ['videos', 0],
                                [f_meta_version]: 0,
                                [f_meta_status]: 'resolved'
                            },
                            title: {$type: 'atom'}
                        },
                        1: {
                            [f_meta_data]: {
                                [f_meta_abs_path]: ['videos', 1],
                                [f_meta_version]: 0,
                                [f_meta_status]: 'resolved'
                            },
                            title: {$type: 'atom'}
                        },
                        2: {
                            [f_meta_data]: {
                                [f_meta_abs_path]: ['videos', 2],
                                [f_meta_version]: 0,
                                [f_meta_status]: 'resolved'
                            },
                            title: {$type: 'atom'}
                        }
                    }
                }
            },
            cache: {
                jsonGraph: {
                    videos: {
                        0: {
                            title: {$type: 'atom'}
                        },
                        1: {
                            title: {$type: 'atom'}
                        }
                    }
                },
                paths: [
                    ['videos', {to: 1}, 'title']
                ]
            }
        });
    });
    it('should get a value through references with complex pathSet.', function() {
        getCoreRunner({
            input: [['lolomo', {to: 1}, {length: 2}, 'item', 'title']],
            output: outputGenerator.lolomoGenerator([0, 1], [0, 1]),
            cache: cacheGenerator(0, 30)
        });
    });
    it('should throw if a KeySet includes another KeySet.', function() {
        var error;
        try {
            getCoreRunner({
                input: [['lolomo', [[{ to: 1}]], {length: 2}, 'item', 'title']],
                output: outputGenerator.lolomoGenerator([0, 1], [0, 1]),
                cache: cacheGenerator(0, 30)
            });
        } catch (e) {
            error = e;
        } finally {
            expect(error instanceof InvalidKeySetError).to.be.ok;
        }
    });
    it('should allow for multiple arguments with different length paths.', function() {
        getCoreRunner({
            stripMetadata: false,
            input: [
                ['lolomo', 0, 'length'],
                ['lolomo', 'length']
            ],
            output: {
                json: {
                    [f_meta_data]: {
                        [f_meta_abs_path]: undefined,
                        [f_meta_version]: 0,
                        [f_meta_status]: 'resolved'
                    },
                    lolomo: {
                        [f_meta_data]: {
                            [f_meta_abs_path]: ['lolomo'],
                            [f_meta_version]: 0,
                            [f_meta_status]: 'resolved'
                        },
                        length: 1,
                        0: {
                            [f_meta_data]: {
                                [f_meta_abs_path]: ['lolomo', '0'],
                                [f_meta_version]: 0,
                                [f_meta_status]: 'resolved'
                            },
                            length: 1337
                        }
                    }
                }
            },
            cache: {
                lolomo: {
                    length: 1,
                    0: {
                        length: 1337
                    }
                }
            }
        });
    });
    it('should allow for a null at the end to get a value behind a reference.', function() {
        getCoreRunner({
            input: [['lolomo', null]],
            output: {
                json: {
                    lolomo: 'value'
                }
            },
            cache: {
                lolomo: jsonGraph.ref(['test', 'value']),
                test: {
                    value: atom('value')
                }
            }
        });
    });
    it('should not get the value after the reference.', function() {
        getCoreRunner({
            input: [['lolomo']],
            output: {
                json: {
                    lolomo: ['test', 'value']
                }
            },
            cache: {
                lolomo: jsonGraph.ref(['test', 'value']),
                test: {
                    value: atom('value')
                }
            }
        });
    });
    it('should have no output for empty paths.', function() {
        getCoreRunner({
            input: [['lolomo', 0, [], 'item', 'title']],
            output: {},
            cache: cacheGenerator(0, 1)
        });
    });
    it('should use the branchSelector to build JSON branches if provided', function() {
        getCoreRunner({
            input: [['videos', [0, 1], 'title']],
            cache: cacheGenerator(0, 2),
            stripMetadata: false,

            // branchSelector = (json) => Object
            branchSelector: function(json) {
                return Object.assign({}, json, { $__userGenerated: true });
            },
            output: {
                json: {
                    [f_meta_data]: {
                        [f_meta_abs_path]: undefined,
                        [f_meta_version]: 0,
                        [f_meta_status]: 'resolved'
                    },
                    $__userGenerated: true,
                    videos: {
                        [f_meta_data]: {
                            [f_meta_abs_path]: ['videos'],
                            [f_meta_version]: 0,
                            [f_meta_status]: 'resolved'
                        },
                        $__userGenerated: true,
                        0: {
                            [f_meta_data]: {
                                [f_meta_abs_path]: ['videos', 0],
                                [f_meta_version]: 0,
                                [f_meta_status]: 'resolved'
                            },
                            $__userGenerated: true,
                            title: 'Video 0'
                        },
                        1: {
                            [f_meta_data]: {
                                [f_meta_abs_path]: ['videos', 1],
                                [f_meta_version]: 0,
                                [f_meta_status]: 'resolved'
                            },
                            $__userGenerated: true,
                            title: 'Video 1'
                        }
                    }
                }
            }
        });
    });
    it('should not create JSON output but should still hardlink when called with a null seed', function() {

        var model = new Model({
            materialized: true,
            cache: cacheGenerator(0, 2)
        });

        var lhs = model._root.cache.lolomo;
        var rhs = model._root.cache.lolomos[1234];

        expect(lhs[f_context]).to.equal(undefined);
        expect(lhs[f_ref_index]).to.equal(undefined);
        expect(rhs[f_refs_length]).to.equal(undefined);

        var results = model._getPathValuesAsPathMap(
            model, [['lolomo', 0, 0, 'title']], null, false, true
        );

        expect(results.data).to.equal(null);
        expect(results.hasValue).to.equal(false);

        expect(lhs[f_context]).to.equal(rhs);
        expect(lhs[f_ref_index]).to.equal(0);
        expect(rhs[f_refs_length]).to.equal(1);
        expect(rhs[f_ref + lhs[f_ref_index]]).to.equal(lhs);
    });
    it('should not create JSON output but should still hardlink when called with a null seed if recycleJSON is true', function() {

        var model = new Model({
            recycleJSON: true,
            cache: cacheGenerator(0, 2)
        });

        var lhs = model._root.cache.lolomo;
        var rhs = model._root.cache.lolomos[1234];

        expect(lhs[f_context]).to.equal(undefined);
        expect(lhs[f_ref_index]).to.equal(undefined);
        expect(rhs[f_refs_length]).to.equal(undefined);

        var results = model._getPathValuesAsPathMap(
            model,
            [
                toFlatBuffer([
                ['lolomo', 0, 0, 'title']]),
                ['lolomo', 0, 0, 'title']
            ],
            null, false, true
        );

        expect(results.data).to.equal(null);
        expect(results.hasValue).to.equal(false);

        expect(lhs[f_context]).to.equal(rhs);
        expect(lhs[f_ref_index]).to.equal(0);
        expect(rhs[f_refs_length]).to.equal(1);
        expect(rhs[f_ref + lhs[f_ref_index]]).to.equal(lhs);
    });
    it('should build json output with flatBuffers if recycleJSON is true', function() {

        var model = new Model({
            recycleJSON: true,
            cache: cacheGenerator(0, 2)
        });

        var seed = { __proto__: FalcorJSON.prototype };

        model._getPathValuesAsPathMap(
            model,
            [
                toFlatBuffer([
                ['videos', [0, { from: 1, length: 1 }], 'title']]),
                ['videos', [0, { from: 1, length: 1 }], 'title']
            ],
            seed, false, true
        );

        expect(JSON.parse(seed.toString(true, true))).to.deep.equals({
            json: {
                [f_meta_data]: {
                    '$code': '15293993',
                    [f_meta_status]: 'resolved'
                },
                videos: {
                    [f_meta_data]: {
                        '$code': '1236527484',
                        [f_meta_abs_path]: ['videos'],
                        [f_meta_status]: 'resolved'
                    },
                    0: {
                        [f_meta_data]: {
                            '$code': '165499941',
                            [f_meta_abs_path]: ['videos', '0'],
                            [f_meta_status]: 'resolved'
                        },
                        title: 'Video 0'
                    },
                    1: {
                        [f_meta_data]: {
                            '$code': '165499941',
                            [f_meta_abs_path]: ['videos', '1'],
                            [f_meta_status]: 'resolved'
                        },
                        title: 'Video 1'
                    }
                }
            }
        });

        expect(seed.json.$__hash).to.equal('15293993');
        expect(seed.json.videos.$__hash).to.equal('1236527484');
        expect(seed.json.videos[0].$__hash).to.equal('165499941');
        expect(seed.json.videos[1].$__hash).to.equal('165499941');
    });

    it('should remove keys not re-requested when recycleJSON is true', function() {

        var model = new Model({
            recycleJSON: true,
            cache: cacheGenerator(0, 2)
        });

        var seed = { __proto__: FalcorJSON.prototype };

        model._getPathValuesAsPathMap(
            model,
            [['videos', [0, {from: 1, length: 1}], 'title']],
            seed, false, true
        );

        model._getPathValuesAsPathMap(
            model,
            [['videos', 0, 'title']],
            seed, false, true
        );

        expect(seed.json.videos[0]).to.be.ok;
        expect(seed.json.videos[1]).to.equal(undefined);

        expect(JSON.parse(seed.toString(true, true))).to.deep.equals({
            json: {
                [f_meta_data]: {
                    '$code': '580640226',
                    [f_meta_status]: 'resolved'
                },
                videos: {
                    [f_meta_data]: {
                        '$code': '1405226223',
                        [f_meta_abs_path]: ['videos'],
                        [f_meta_status]: 'resolved'
                    },
                    0: {
                        [f_meta_data]: {
                            '$code': '165499941',
                            [f_meta_abs_path]: ['videos', '0'],
                            [f_meta_status]: 'resolved'
                        },
                        title: 'Video 0'
                    }
                }
            }
        });

        expect(seed.json.$__hash).to.equal('580640226');
        expect(seed.json.videos.$__hash).to.equal('1405226223');
        expect(seed.json.videos[0].$__hash).to.equal('165499941');
    });

    // JSONGraph ----------------------------------------
    it('should get JSONGraph for a single value out, modelCreated', function() {
        getCoreRunner({
            input: [['videos', 0, 'title']],
            isJSONG: true,
            output: {
                jsonGraph: {
                    videos: {
                        0: {
                            title: 'Video 0'
                        }
                    }
                },
                paths: [['videos', 0, 'title']]
            },
            cache: cacheGenerator(0, 1, undefined, true)
        });
    });
    it('should get JSONGraph for a single value out, !modelCreated', function() {
        getCoreRunner({
            input: [['videos', 0, 'title']],
            isJSONG: true,
            output: {
                jsonGraph: {
                    videos: {
                        0: {
                            title: atom('Video 0')
                        }
                    }
                },
                paths: [['videos', 0, 'title']]
            },
            cache: cacheGenerator(0, 1, undefined, false)
        });
    });
    it('should allow for multiple arguments with different length paths as JSONGraph.', function() {
        getCoreRunner({
            input: [
                ['lolomo', 0, 'length'],
                ['lolomo', 'length']
            ],
            output: {
                jsonGraph: {
                    lolomo: {
                        length: 1,
                        0: {
                            length: 1337
                        }
                    }
                },
                paths: [
                    ['lolomo', 0, 'length'],
                    ['lolomo', 'length']
                ]
            },
            isJSONG: true,
            cache: {
                lolomo: {
                    length: 1,
                    0: {
                        length: 1337
                    }
                }
            }
        });
    });
    it('should get JSONGraph through references.', function() {
        getCoreRunner({
            input: [['lolomo', 0, 0, 'item', 'title']],
            isJSONG: true,
            output: {
                jsonGraph: cacheGenerator(0, 1),
                paths: [['lolomo', 0, 0, 'item', 'title']]
            },
            cache: cacheGenerator(0, 10)
        });
    });
    it('should get JSONGraph through references with complex pathSet.', function() {
        getCoreRunner({
            input: [['lolomo', {to: 1}, {length: 2}, 'item', 'title']],
            isJSONG: true,
            output: {
                jsonGraph: _.merge(cacheGenerator(0, 2), cacheGenerator(10, 2, undefined, false)),
                paths: [
                    ['lolomo', 0, 0, 'item', 'title'],
                    ['lolomo', 0, 1, 'item', 'title'],
                    ['lolomo', 1, 0, 'item', 'title'],
                    ['lolomo', 1, 1, 'item', 'title']
                ]
            },
            cache: cacheGenerator(0, 30)
        });
    });
    it('should throw getting JSONGraph if a KeySet includes another KeySet.', function() {
        var error;
        try {
            getCoreRunner({
                isJSONG: true,
                input: [['lolomo', [[{ to: 1}]], {length: 2}, 'item', 'title']],
                output: outputGenerator.lolomoGenerator([0, 1], [0, 1]),
                cache: cacheGenerator(0, 30)
            });
        } catch (e) {
            error = e;
        } finally {
            expect(error instanceof InvalidKeySetError).to.be.ok;
        }
    });
});

