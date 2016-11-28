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

    it('should follow a reference to reference', function() {
        // Should be the second references reference not
        // toReferences reference.
        getCoreRunner({
            stripMetadata: false,
            input: [['toReference', 'title']],
            output: {
                json: {
                    [ƒ_meta]: {
                        [ƒm_abs_path]:    undefined,
                        [ƒm_deref_from]:  undefined,
                        [ƒm_deref_to]:    undefined,
                        [ƒm_version]:     0
                    },
                    toReference: {
                        [ƒ_meta]: {
                            [ƒm_abs_path]:    ['too'],
                            [ƒm_deref_from]:  undefined,
                            [ƒm_deref_to]:    undefined,
                            [ƒm_version]:     0
                        },
                        title: 'Title'
                    }
                }
            },
            cache: referenceCache
        });
    });

    it('should follow a reference to value', function() {
        getCoreRunner({
            input: [['short', 'title']],
            output: {
                json: {
                    short: 'Short'
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

    xit('should warn in debug mode if we follow at least 50 references', function() {

        runTestWithConsoleFn(null, false);
        runTestWithConsoleFn('log', true);
        runTestWithConsoleFn('warn', true);

        function runTestWithConsoleFn(reportFnName, hasConsole) {

            var realConsole = console;

            if (!hasConsole) {
                global.console = undefined;
            } else {
                var realConsoleLog = console.log;
                var realConsoleWarn = console.warn;
                console.log = console.warn = undefined;

                var reportSpy = sinon.spy();
                console[reportFnName] = reportSpy;
            }

            // It only warns in debug mode
            global.DEBUG = true;

            getCoreRunner({
                stripMetadata: false,
                input: [['ref-0', 'title']],
                output: {
                    json: {
                        [ƒ_meta]: {
                            [ƒm_abs_path]:    undefined,
                            [ƒm_deref_from]:  undefined,
                            [ƒm_deref_to]:    undefined,
                            [ƒm_version]:     0
                        },
                        'ref-0': {
                            [ƒ_meta]: {
                                [ƒm_abs_path]:    ['too'],
                                [ƒm_deref_from]:  undefined,
                                [ƒm_deref_to]:    undefined,
                                [ƒm_version]:     0
                            },
                            title: 'Title'
                        }
                    }
                },
                cache: addRefChainToCache(referenceCache(), 50, ['toReference'])
            });

            global.DEBUG = false;

            if (!hasConsole) {
                global.console = realConsole;
            } else {
                console.log = realConsoleLog;
                console.warn = realConsoleWarn;

                expect(reportSpy.callCount).to.equal(1);
                expect(reportSpy.getCall(0).args[0]).to.equal(new Error(
                    "Followed 50 references. " +
                    "This might indicate the presence of an indirect " +
                    "circular reference chain."
                ).toString());
            }
        }
    });

    xit('should warn getting JSONGraph in debug mode if we follow at least 50 references', function() {

        runTestWithConsoleFn(null, false);
        runTestWithConsoleFn('log', true);
        runTestWithConsoleFn('warn', true);

        function runTestWithConsoleFn(reportFnName, hasConsole) {

            var realConsole = console;

            if (!hasConsole) {
                global.console = undefined;
            } else {
                var realConsoleLog = console.log;
                var realConsoleWarn = console.warn;
                console.log = console.warn = undefined;

                var reportSpy = sinon.spy();
                console[reportFnName] = reportSpy;
            }

            // It only warns in debug mode
            global.DEBUG = true;

            getCoreRunner({
                isJSONG: true,
                input: [['ref-0', 'title']],
                output: {
                    paths: [['ref-0', 'title']],
                    jsonGraph: addRefChainToCache({
                        toReference: ref(['to', 'reference']),
                        to: {
                            reference: ref(['too'])
                        },
                        too: {
                            title: 'Title'
                        }
                    }, 50, ['toReference'])
                },
                cache: addRefChainToCache(referenceCache(), 50, ['toReference'])
            });

            global.DEBUG = false;

            if (!hasConsole) {
                global.console = realConsole;
            } else {
                console.log = realConsoleLog;
                console.warn = realConsoleWarn;

                expect(reportSpy.callCount).to.equal(1);
                expect(reportSpy.getCall(0).args[0]).to.equal(new Error(
                    "Followed 50 references. " +
                    "This might indicate the presence of an indirect " +
                    "circular reference chain."
                ).toString());
            }
        }
    });

    it('should ensure that values are followed correctly when through references and previous paths have longer lengths to litter the requested path.', function() {
        getCoreRunner({
            stripMetadata: false,
            input: [
                ['to', ['reference', 'toValue'], 'title'],
            ],
            output: {
                json: {
                    [ƒ_meta]: {
                        [ƒm_abs_path]:    undefined,
                        [ƒm_deref_from]:  undefined,
                        [ƒm_deref_to]:    undefined,
                        [ƒm_version]:     0

                    },
                    to: {
                        [ƒ_meta]: {
                            [ƒm_abs_path]:    ['to'],
                            [ƒm_deref_from]:  undefined,
                            [ƒm_deref_to]:    undefined,
                            [ƒm_version]:     0
                        },
                        reference: {
                            [ƒ_meta]: {
                                [ƒm_abs_path]:    ['too'],
                                [ƒm_deref_from]:  undefined,
                                [ƒm_deref_to]:    undefined,
                                [ƒm_version]:     0
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
                    [ƒ_meta]: {
                        [ƒm_abs_path]:    undefined,
                        [ƒm_deref_from]:  undefined,
                        [ƒm_deref_to]:    undefined,
                        [ƒm_version]:     0
                    },
                    lolomo: {
                        [ƒ_meta]: {
                            [ƒm_abs_path]:    ['lolomos', 1234],
                            [ƒm_deref_from]:  ['lolomo'],
                            [ƒm_deref_to]:    ['lolomos', 1234],
                            [ƒm_version]:     0
                        },
                        0: {
                            [ƒ_meta]: {
                                [ƒm_abs_path]:    ['lists', 'A'],
                                [ƒm_deref_from]:  ['lolomos', 1234, 0],
                                [ƒm_deref_to]:    ['lists', 'A'],
                                [ƒm_version]:     0
                            },
                            0: {
                                [ƒ_meta]: {
                                    [ƒm_abs_path]:    ['lists', 'A', 0],
                                    [ƒm_deref_from]:  ['lolomos', 1234, 0],
                                    [ƒm_deref_to]:    ['lists', 'A'],
                                    [ƒm_version]:     0
                                },
                                item: {
                                    [ƒ_meta]: {
                                        [ƒm_abs_path]:    ['videos', 0],
                                        [ƒm_deref_from]:  ['lists', 'A', 0, 'item'],
                                        [ƒm_deref_to]:    ['videos', 0],
                                        [ƒm_version]:     0
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

