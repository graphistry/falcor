var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var jsonGraph = require('@graphistry/falcor-json-graph');
var atom = jsonGraph.atom;
var ref = jsonGraph.ref;
var _ = require('lodash');
var expect = require('chai').expect;
var sinon = require('sinon');
var CircularReferenceError = require('./../../lib/errors/CircularReferenceError');

describe('References', function() {

    function addRefChainToCache(cache, refsCount, toRef) {
        var refsIndex = -1;
        while (++refsIndex < refsCount) {
            cache['ref-' + refsIndex] = ref(['ref-' + (refsIndex + 1)]);
        }
        cache['ref-' + refsCount] = ref(toRef);
        return cache;
    }

    var referenceCache = function() {
        return {
            toReference: ref(['to', 'reference']),
            short: ref(['toShort', 'next']),
            circular: ref(['circular', 'next']),
            referencesSelf: ref(['referencesSelf']),
            expired: {
                title: atom('Expired Title', { $expires: 0 })
            },
            toExpiredTitle: ref(['expired', 'title']),
            to: {
                reference: ref(['too']),
                toValue: ref(['too', 'title']),
                title: 'Title'
            },
            too: {
                title: 'Title'
            },
            toShort: 'Short'
        };
    };

    it('should follow a reference to a value', function() {
        getCoreRunner({
            input: [['to', 'reference', 'title']],
            output: {
                json: {
                    to: {
                        reference: {
                            title: 'Title'
                        }
                    }
                }
            },
            cache: referenceCache
        });
    });

    it('should report a value when a reference short-circuits', function() {
        getCoreRunner({
            input: [['short', 'title']],
            output: {
                json: {
                    short: 'Short'
                }
            },
            cache: referenceCache
        });
        getCoreRunner({
            isJSONG: true,
            input: [['short', 'title']],
            output: {
                paths: [['short', null]],
                jsonGraph: {
                    short: ref(['toShort', 'next']),
                    toShort: 'Short'
                }
            },
            cache: referenceCache
        });
    });

    it('should follow a reference to a reference', function() {
        // Should be the second references reference not
        // toReferences reference.
        getCoreRunner({
            stripMetadata: false,
            input: [['toReference', 'title']],
            output: {
                json: {
                    [f_meta_data]: {
                        [f_meta_abs_path]:    undefined,
                        [f_meta_deref_from]:  undefined,
                        [f_meta_deref_to]:    undefined,
                        [f_meta_version]:     0
                    },
                    toReference: {
                        [f_meta_data]: {
                            [f_meta_abs_path]:    ['too'],
                            [f_meta_deref_from]:  undefined,
                            [f_meta_deref_to]:    undefined,
                            [f_meta_version]:     0
                        },
                        title: 'Title'
                    }
                }
            },
            cache: referenceCache
        });
        getCoreRunner({
            isJSONG: true,
            input: [['toReference', 'title']],
            output: {
                paths: [['toReference', 'title']],
                jsonGraph: {
                    toReference: ref(['to', 'reference']),
                    to: {
                        reference: ref(['too'])
                    },
                    too: {
                        title: 'Title'
                    }
                }
            },
            cache: referenceCache
        });
    });

    it('should never follow inner references.', function() {
        getCoreRunner({
            input: [['circular', 'title']],
            output: {
                json: {
                    circular: ['circular', 'next']
                }
            },
            cache: referenceCache
        });
        getCoreRunner({
            isJSONG: true,
            input: [['circular', 'title']],
            output: {
                paths: [['circular', null]],
                jsonGraph: {
                    circular: ref(['circular', 'next'])
                }
            },
            cache: referenceCache
        });
    });

    it('should follow a reference to an expired value and report a missing path', function() {
        getCoreRunner({
            input: [['toExpiredTitle', null]],
            output: { },
            cache: referenceCache,
            optimizedMissingPaths: [['expired', 'title']],
            requestedMissingPaths: [['toExpiredTitle', null]]
        });
        getCoreRunner({
            isJSONG: true,
            input: [['toExpiredTitle', null]],
            output: {
                jsonGraph: {
                    toExpiredTitle: ref(['expired', 'title'])
                }
            },
            cache: referenceCache,
            optimizedMissingPaths: [['expired', 'title']],
            requestedMissingPaths: [['toExpiredTitle', null]]
        });
    });

    it('should throw an error if a reference points to itself', function() {
        var error;
        try {
            getCoreRunner({
                input: [['referencesSelf', 'title']],
                output: { },
                cache: referenceCache
            });
        } catch (e) {
            error = e;
        } finally {
            expect(error instanceof CircularReferenceError).to.be.ok;
        }
    });

    it('should throw an error getting jsonGraph if a reference points to itself', function() {
        var error;
        try {
            getCoreRunner({
                isJSONG: true,
                input: [['referencesSelf', 'title']],
                output: {
                    jsonGraph: {
                        referencesSelf: ref('referencesSelf')
                    }
                },
                cache: referenceCache
            });
        } catch (e) {
            error = e;
        } finally {
            expect(error instanceof CircularReferenceError).to.be.ok;
        }
    });

    it('should ensure that values are followed correctly through references when previous paths have longer lengths to litter the requested path.', function() {
        getCoreRunner({
            stripMetadata: false,
            input: [
                ['to', ['reference', 'toValue'], 'title'],
            ],
            output: {
                json: {
                    [f_meta_data]: {
                        [f_meta_abs_path]:    undefined,
                        [f_meta_deref_from]:  undefined,
                        [f_meta_deref_to]:    undefined,
                        [f_meta_version]:     0
                    },
                    to: {
                        [f_meta_data]: {
                            [f_meta_abs_path]:    ['to'],
                            [f_meta_deref_from]:  undefined,
                            [f_meta_deref_to]:    undefined,
                            [f_meta_version]:     0
                        },
                        reference: {
                            [f_meta_data]: {
                                [f_meta_abs_path]:    ['too'],
                                [f_meta_deref_from]:  undefined,
                                [f_meta_deref_to]:    undefined,
                                [f_meta_version]:     0
                            },
                            title: 'Title'
                        },
                        toValue: 'Title'
                    }
                }
            },
            cache: referenceCache
        });
    });

    it('should validate that _fromWhenceYouCame does correctly pluck the paths for references.', function() {
        getCoreRunner({
            input: [
                ['lolomo', 0, 0, 'item', 'title'],
            ],
            stripMetadata: false,
            fromWhenceYouCame: true,
            output: {
                json: {
                    [f_meta_data]: {
                        [f_meta_abs_path]:    undefined,
                        [f_meta_deref_from]:  undefined,
                        [f_meta_deref_to]:    undefined,
                        [f_meta_version]:     0
                    },
                    lolomo: {
                        [f_meta_data]: {
                            [f_meta_abs_path]:    ['lolomos', 1234],
                            [f_meta_deref_from]:  ['lolomo'],
                            [f_meta_deref_to]:    ['lolomos', 1234],
                            [f_meta_version]:     0
                        },
                        0: {
                            [f_meta_data]: {
                                [f_meta_abs_path]:    ['lists', 'A'],
                                [f_meta_deref_from]:  ['lolomos', 1234, 0],
                                [f_meta_deref_to]:    ['lists', 'A'],
                                [f_meta_version]:     0
                            },
                            0: {
                                [f_meta_data]: {
                                    [f_meta_abs_path]:    ['lists', 'A', 0],
                                    [f_meta_deref_from]:  ['lolomos', 1234, 0],
                                    [f_meta_deref_to]:    ['lists', 'A'],
                                    [f_meta_version]:     0
                                },
                                item: {
                                    [f_meta_data]: {
                                        [f_meta_abs_path]:    ['videos', 0],
                                        [f_meta_deref_from]:  ['lists', 'A', 0, 'item'],
                                        [f_meta_deref_to]:    ['videos', 0],
                                        [f_meta_version]:     0
                                    },
                                    title: 'Video 0'
                                }
                            }
                        }
                    }
                }
            },
            cache: cacheGenerator(0, 1)
        });
    });
});

