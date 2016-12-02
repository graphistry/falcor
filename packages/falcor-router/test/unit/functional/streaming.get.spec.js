var noOp = function() {};
var _ = require('lodash');
var Observable = require('rxjs').Observable;
var R = require('./../../../src/Router');
var $atom = require('./../../../src/support/types').$atom;
var pathValueMerge = require('./../../../src/cache/pathValueMerge');

var Routes = require('./../../data');
var Expected = require('./../../data/expected');
var TestRunner = require('./../../TestRunner');

describe('Get', function() {
    describe('Simple', function() {
        it('should get partial values streamed in over time.', function(done) {
            var router = new R(
                Routes().Videos.Ranges.Summary(function(pathSet) {
                    TestRunner.comparePath(['videos', [{from:0, to:2}], 'summary'], pathSet);
                }, 10),
                { streaming: true }
            );
            var obs = router.
                get([['videos', {from: 0, to: 2}, 'summary']]);

            TestRunner.runStreaming(obs, [
                    _.merge(
                        { paths: [['videos', 0, 'summary']] },
                        { jsonGraph: Expected().Videos[0].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 1, 'summary']] },
                        { jsonGraph: Expected().Videos[1].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 2, 'summary']] },
                        { jsonGraph: Expected().Videos[2].summary.jsonGraph })
                ]).
                subscribe(noOp, done, done);
        });
        it('should get partial values streamed in over time in the order in which they emit.', function(done) {
            var router = new R(
                Routes().Videos.Ranges.Summary(function(pathSet) {
                    TestRunner.comparePath(['videos', [{from:0, to:2}], 'summary'], pathSet);
                }, [25, 10, 1]),
                { streaming: true }
            );
            var obs = router.
                get([['videos', {from: 0, to: 2}, 'summary']]);

            TestRunner.runStreaming(obs, [
                    _.merge(
                        { paths: [['videos', 2, 'summary']] },
                        { jsonGraph: Expected().Videos[2].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 1, 'summary']] },
                        { jsonGraph: Expected().Videos[1].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 0, 'summary']] },
                        { jsonGraph: Expected().Videos[0].summary.jsonGraph })
                ]).
                subscribe(noOp, done, done);
        });
        it('should get partial values streamed in over time followed by a materialized result.', function(done) {
            var router = new R(
                Routes().Videos.Ranges.Summary(function(pathSet) {
                    TestRunner.comparePath(['videos', [{from:0, to:2}], 'summary'], pathSet);
                }, 10),
                { streaming: true }
            );
            var obs = router.
                get([
                    ['videos', {from: 0, to: 2}, 'summary'],
                    ['videos', 'missing', 'summary']
                ]);

            TestRunner.runStreaming(obs, [
                    _.merge(
                        { paths: [['videos', 0, 'summary']] },
                        { jsonGraph: Expected().Videos[0].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 1, 'summary']] },
                        { jsonGraph: Expected().Videos[1].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 2, 'summary']] },
                        { jsonGraph: Expected().Videos[2].summary.jsonGraph }),
                    {
                        paths: [['videos', 'missing', 'summary']],
                        jsonGraph: {
                            videos: {
                                missing: {
                                    summary: { $type: $atom }
                                }
                            }
                        }
                    }
                ]).
                subscribe(noOp, done, done);
        });
        it('should get partial values streamed in over time followed by an unhandled response result.', function(done) {

            var router = new R(
                Routes().Videos.Ranges.Summary(function(pathSet) {
                    TestRunner.comparePath(['videos', [{from:0, to:2}], 'summary'], pathSet);
                }, 10),
                { streaming: true }
            )
            .routeUnhandledPathsTo({
                get: function convert(paths) {
                    return Observable.of(
                        paths.reduce(function(jsonGraph, path) {
                            pathValueMerge(jsonGraph.jsonGraph, {
                                path: path, value: 'missing'
                            });
                            return jsonGraph;
                        }, { paths: paths, jsonGraph: {} })
                    ).delay(350);
                }
            });

            var obs = router.
                get([
                    ['videos', {from: 0, to: 2}, 'summary'],
                    ['videos', 'missing', 'summary']
                ]);

            TestRunner.runStreaming(obs, [
                    _.merge(
                        { paths: [['videos', 0, 'summary']] },
                        { jsonGraph: Expected().Videos[0].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 1, 'summary']] },
                        { jsonGraph: Expected().Videos[1].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 2, 'summary']] },
                        { jsonGraph: Expected().Videos[2].summary.jsonGraph }),
                    {
                        paths: [['videos', 'missing', 'summary']],
                        jsonGraph: {
                            videos: {
                                missing: {
                                    summary: 'missing'
                                }
                            }
                        }
                    }
                ]).
                subscribe(noOp, done, done);
        });
        it('should get partial values streamed in over time followed by a streaming unhandled response result.', function(done) {

            var router = new R(
                Routes().Videos.Ranges.Summary(function(pathSet) {
                    TestRunner.comparePath(['videos', [{from:0, to:2}], 'summary'], pathSet);
                }, 10),
                { streaming: true }
            )
            .routeUnhandledPathsTo({
                get: function convert(paths) {
                    return Observable.from(paths).mergeMap(function(path) {
                        return Observable
                            .from(TestRunner.rangeToArray([path[2]]))
                            .concatMap(function(id) {
                                var jsonGraph = {};
                                var _path = path.slice(0);
                                _path[2] = id;
                                pathValueMerge(jsonGraph, {
                                    path: _path,
                                    value: 'missing ' + id
                                });
                                return Observable.of({
                                    paths: [_path], jsonGraph: jsonGraph
                                }).delay(100)
                            });
                    });
                }
            });

            var obs = router.
                get([
                    ['videos', {from: 0, to: 2}, 'summary'],
                    ['videos', 'missing', 0, 'summary'],
                    ['videos', 'missing', 1, 'summary']
                ]);

            TestRunner.runStreaming(obs, [
                    _.merge(
                        { paths: [['videos', 0, 'summary']] },
                        { jsonGraph: Expected().Videos[0].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 1, 'summary']] },
                        { jsonGraph: Expected().Videos[1].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 2, 'summary']] },
                        { jsonGraph: Expected().Videos[2].summary.jsonGraph }),
                    {
                        paths: [['videos', 'missing', 0, 'summary']],
                        jsonGraph: {videos: {missing: {0: { summary: 'missing 0' }}}}
                    },
                    {
                        paths: [['videos', 'missing', 1, 'summary']],
                        jsonGraph: {videos: {missing: {1: { summary: 'missing 1' }}}}
                    }
                ]).
                subscribe(noOp, done, done);
        });
    });
    describe('References', function() {
        it('should get partial values streamed in over time.', function(done) {
            var router = new R([].concat(
                    Routes().Genrelists.Ranges(null, 10),
                    Routes().Videos.Ranges.Summary(null)
                ),
                { streaming: true }
            );
            var obs = router.
                get([['genreLists', {from: 0, to: 2}, 'summary']]);

            TestRunner.runStreaming(obs, [
                    _.merge(
                        { paths: [['genreLists', '0'], ['videos', 0, 'summary']]},
                        { jsonGraph: Expected().Genrelists[0].genreLists.jsonGraph },
                        { jsonGraph: Expected().Videos[0].summary.jsonGraph }),
                    _.merge(
                        { paths: [['genreLists', '1'], ['videos', 1, 'summary']]},
                        { jsonGraph: Expected().Genrelists[1].genreLists.jsonGraph },
                        { jsonGraph: Expected().Videos[1].summary.jsonGraph }),
                    _.merge(
                        { paths: [['genreLists', '2'], ['videos', 2, 'summary']]},
                        { jsonGraph: Expected().Genrelists[2].genreLists.jsonGraph },
                        { jsonGraph: Expected().Videos[2].summary.jsonGraph })
                ]).
                subscribe(noOp, done, done);
        });
        it('should get partial values streamed in over time in the order in which they emit.', function(done) {
            var router = new R([].concat(
                    Routes().Genrelists.Ranges(null, [25, 10, 1]),
                    Routes().Videos.Ranges.Summary(null)
                ),
                { streaming: true }
            );
            var obs = router.
                get([['genreLists', {from: 0, to: 2}, 'summary']]);

            TestRunner.runStreaming(obs, [
                    _.merge(
                        { paths: [['genreLists', '2'], ['videos', 2, 'summary']]},
                        { jsonGraph: Expected().Genrelists[2].genreLists.jsonGraph },
                        { jsonGraph: Expected().Videos[2].summary.jsonGraph }),
                    _.merge(
                        { paths: [['genreLists', '1'], ['videos', 1, 'summary']]},
                        { jsonGraph: Expected().Genrelists[1].genreLists.jsonGraph },
                        { jsonGraph: Expected().Videos[1].summary.jsonGraph }),
                    _.merge(
                        { paths: [['genreLists', '0'], ['videos', 0, 'summary']]},
                        { jsonGraph: Expected().Genrelists[0].genreLists.jsonGraph },
                        { jsonGraph: Expected().Videos[0].summary.jsonGraph })
                ]).
                subscribe(noOp, done, done);
        });
        it('should get partial values streamed in over time followed by a materialized result.', function(done) {
            var router = new R([].concat(
                    Routes().Genrelists.Ranges(null, 10),
                    Routes().Videos.Ranges.Summary(null)
                ),
                { streaming: true }
            );
            var obs = router.
                get([
                    ['genreLists', {from: 0, to: 2}, 'summary'],
                    ['videos', 'missing', 'summary']
                ]);

            TestRunner.runStreaming(obs, [
                    _.merge(
                        { paths: [['genreLists', '0'], ['videos', 0, 'summary']]},
                        { jsonGraph: Expected().Genrelists[0].genreLists.jsonGraph },
                        { jsonGraph: Expected().Videos[0].summary.jsonGraph }),
                    _.merge(
                        { paths: [['genreLists', '1'], ['videos', 1, 'summary']]},
                        { jsonGraph: Expected().Genrelists[1].genreLists.jsonGraph },
                        { jsonGraph: Expected().Videos[1].summary.jsonGraph }),
                    _.merge(
                        { paths: [['genreLists', '2'], ['videos', 2, 'summary']]},
                        { jsonGraph: Expected().Genrelists[2].genreLists.jsonGraph },
                        { jsonGraph: Expected().Videos[2].summary.jsonGraph }),
                    {
                        paths: [['videos', 'missing', 'summary']],
                        jsonGraph: {
                            videos: {
                                missing: {
                                    summary: { $type: $atom }
                                }
                            }
                        }
                    }
                ]).
                subscribe(noOp, done, done);
        });
        it('should get partial values streamed in over time followed by an unhandled response result.', function(done) {

            var router = new R([].concat(
                    Routes().Genrelists.Ranges(null, 10),
                    Routes().Videos.Ranges.Summary(null)
                ),
                { streaming: true }
            )
            .routeUnhandledPathsTo({
                get: function convert(paths) {
                    return Observable.of(
                        paths.reduce(function(jsonGraph, path) {
                            pathValueMerge(jsonGraph.jsonGraph, {
                                path: path,
                                value: 'missing'
                            });
                            return jsonGraph;
                        }, { paths: paths, jsonGraph: {} })
                    ).delay(350);
                }
            });

            var obs = router.
                get([
                    ['genreLists', {from: 0, to: 2}, 'summary'],
                    ['videos', 'missing', 'summary']
                ]);

            TestRunner.runStreaming(obs, [
                    _.merge(
                        { paths: [['genreLists', '0'], ['videos', 0, 'summary']]},
                        { jsonGraph: Expected().Genrelists[0].genreLists.jsonGraph },
                        { jsonGraph: Expected().Videos[0].summary.jsonGraph }),
                    _.merge(
                        { paths: [['genreLists', '1'], ['videos', 1, 'summary']]},
                        { jsonGraph: Expected().Genrelists[1].genreLists.jsonGraph },
                        { jsonGraph: Expected().Videos[1].summary.jsonGraph }),
                    _.merge(
                        { paths: [['genreLists', '2'], ['videos', 2, 'summary']]},
                        { jsonGraph: Expected().Genrelists[2].genreLists.jsonGraph },
                        { jsonGraph: Expected().Videos[2].summary.jsonGraph }),
                    {
                        paths: [['videos', 'missing', 'summary']],
                        jsonGraph: {
                            videos: {
                                missing: {
                                    summary: 'missing'
                                }
                            }
                        }
                    }
                ]).
                subscribe(noOp, done, done);
        });
    });
});
