var noOp = function() {};
var _ = require('lodash');
var expect = require('chai').expect;
var Observable = require('rxjs').Observable;
var R = require('./../../../src/Router');
var $atom = require('./../../../src/support/types').$atom;
var pathValueMerge = require('./../../../src/cache/pathValueMerge');

var Routes = require('./../../data');
var Expected = require('./../../data/expected');
var TestRunner = require('./../../TestRunner');

describe('Set', function() {
    describe('Simple', function() {
        it('should set partial values streamed in over time.', function(done) {
            var router = new R(
                Routes().Videos.Ranges.Summary(null, 10),
                { streaming: true }
            );
            var obs = router.
                set(_.merge({
                    paths: [
                        ['videos', 0, 'summary'],
                        ['videos', 1, 'summary'],
                        ['videos', 2, 'summary']
                    ]},
                    { jsonGraph: Expected().Videos.summary(0).jsonGraph },
                    { jsonGraph: Expected().Videos.summary(1).jsonGraph },
                    { jsonGraph: Expected().Videos.summary(2).jsonGraph }
                ));

            TestRunner.runStreaming(obs, [
                    _.merge(
                        { paths: [['videos', 0, 'summary']]},
                        { jsonGraph: Expected().Videos[0].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 1, 'summary']]},
                        { jsonGraph: Expected().Videos[1].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 2, 'summary']]},
                        { jsonGraph: Expected().Videos[2].summary.jsonGraph })
                ]).
                subscribe(noOp, done, done);
        });
        it('should set partial values streamed in over time in the order in which they emit.', function(done) {
            var router = new R(
                Routes().Videos.Ranges.Summary(null, [50, 10, 1]),
                { streaming: true }
            );
            var obs = router.
                set(_.merge({
                    paths: [
                        ['videos', 0, 'summary'],
                        ['videos', 1, 'summary'],
                        ['videos', 2, 'summary']
                    ]},
                    { jsonGraph: Expected().Videos.summary(0).jsonGraph },
                    { jsonGraph: Expected().Videos.summary(1).jsonGraph },
                    { jsonGraph: Expected().Videos.summary(2).jsonGraph }
                ));

            TestRunner.runStreaming(obs, [
                    _.merge(
                        { paths: [['videos', 2, 'summary']]},
                        { jsonGraph: Expected().Videos[2].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 1, 'summary']]},
                        { jsonGraph: Expected().Videos[1].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 0, 'summary']]},
                        { jsonGraph: Expected().Videos[0].summary.jsonGraph })
                ]).
                subscribe(noOp, done, done);
        });
        it('should set partial values streamed in over time followed by a materialized result.', function(done) {
            var router = new R(
                Routes().Videos.Ranges.Summary(null, 10),
                { streaming: true }
            );
            var obs = router.
                set(_.merge({
                    paths: [
                        ['videos', 0, 'summary'],
                        ['videos', 1, 'summary'],
                        ['videos', 2, 'summary'],
                        ['videos', 'summary']
                    ]},
                    { jsonGraph: Expected().Videos.summary(0).jsonGraph },
                    { jsonGraph: Expected().Videos.summary(1).jsonGraph },
                    { jsonGraph: Expected().Videos.summary(2).jsonGraph }
                ));

            TestRunner.runStreaming(obs, [
                    _.merge(
                        { paths: [['videos', 0, 'summary']]},
                        { jsonGraph: Expected().Videos[0].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 1, 'summary']]},
                        { jsonGraph: Expected().Videos[1].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 2, 'summary']]},
                        { jsonGraph: Expected().Videos[2].summary.jsonGraph }),
                    {
                        paths: [['videos', 'summary']],
                        jsonGraph: {
                            videos: {
                                summary: { $type: $atom }
                            }
                        }
                    }
                ]).
                subscribe(noOp, done, done);
        });
        it('should set partial values streamed in over time followed by an unhandled response result.', function(done) {

            var router = new R(
                Routes().Videos.Ranges.Summary(null, 10),
                { streaming: true }
            )
            .routeUnhandledPathsTo({
                set: function (jsonGraphEnv) {
                    expect(jsonGraphEnv).to.deep.equals({
                        paths: [['videos', 'summary']],
                        jsonGraph: {
                            videos: {
                                summary: 'missing'
                            }
                        }
                    });
                    return Observable.of(
                        jsonGraphEnv.paths.reduce(function(jsonGraph, path) {
                            pathValueMerge(jsonGraph.jsonGraph, {
                                path: path,
                                value: 'unhandled missing'
                            });
                            return jsonGraph;
                        }, {
                            jsonGraph: {},
                            paths: jsonGraphEnv.paths
                        })
                    ).delay(350);
                }
            });

            var obs = router.
                set(_.merge({
                    paths: [
                        ['videos', 0, 'summary'],
                        ['videos', 1, 'summary'],
                        ['videos', 2, 'summary'],
                        ['videos', 'summary']
                    ]},
                    { jsonGraph: Expected().Videos.summary(0).jsonGraph },
                    { jsonGraph: Expected().Videos.summary(1).jsonGraph },
                    { jsonGraph: Expected().Videos.summary(2).jsonGraph },
                    {
                        jsonGraph: {
                            videos: {
                                summary: 'missing'
                            }
                        }
                    }
                ));

            TestRunner.runStreaming(obs, [
                    _.merge(
                        { paths: [['videos', 0, 'summary']]},
                        { jsonGraph: Expected().Videos[0].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 1, 'summary']]},
                        { jsonGraph: Expected().Videos[1].summary.jsonGraph }),
                    _.merge(
                        { paths: [['videos', 2, 'summary']]},
                        { jsonGraph: Expected().Videos[2].summary.jsonGraph }),
                    {
                        paths: [['videos', 'summary']],
                        jsonGraph: {
                            videos: {
                                summary: 'unhandled missing'
                            }
                        }
                    }
                ]).
                subscribe(noOp, done, done);
        });
    });
    // describe('References', function() {
    //     it('should get partial values streamed in over time.', function(done) {
    //         var router = new R([].concat(
    //                 Routes().Genrelists.Ranges(null, 10),
    //                 Routes().Videos.Ranges.Summary(null)
    //             ),
    //             { streaming: true }
    //         );
    //         var obs = router.
    //             get([['genreLists', {from: 0, to: 2}, 'summary']]);

    //         TestRunner.runStreaming(obs, [
    //                 _.merge(Expected().Genrelists[0].genreLists, Expected().Videos[0].summary),
    //                 _.merge(Expected().Genrelists[1].genreLists, Expected().Videos[1].summary),
    //                 _.merge(Expected().Genrelists[2].genreLists, Expected().Videos[2].summary)
    //             ]).
    //             subscribe(noOp, done, done);
    //     });
    //     it('should get partial values streamed in over time in the order in which they emit.', function(done) {
    //         var router = new R([].concat(
    //                 Routes().Genrelists.Ranges(null, [50, 10, 1]),
    //                 Routes().Videos.Ranges.Summary(null)
    //             ),
    //             { streaming: true }
    //         );
    //         var obs = router.
    //             get([['genreLists', {from: 0, to: 2}, 'summary']]);

    //         TestRunner.runStreaming(obs, [
    //                 _.merge(Expected().Genrelists[2].genreLists, Expected().Videos[2].summary),
    //                 _.merge(Expected().Genrelists[1].genreLists, Expected().Videos[1].summary),
    //                 _.merge(Expected().Genrelists[0].genreLists, Expected().Videos[0].summary)
    //             ]).
    //             subscribe(noOp, done, done);
    //     });
    //     it('should get partial values streamed in over time followed by a materialized result.', function(done) {
    //         var router = new R([].concat(
    //                 Routes().Genrelists.Ranges(null, 10),
    //                 Routes().Videos.Ranges.Summary(null)
    //             ),
    //             { streaming: true }
    //         );
    //         var obs = router.
    //             get([
    //                 ['genreLists', {from: 0, to: 2}, 'summary'],
    //                 ['videos', 'missing', 'summary']
    //             ]);

    //         TestRunner.runStreaming(obs, [
    //                 _.merge(Expected().Genrelists[0].genreLists, Expected().Videos[0].summary),
    //                 _.merge(Expected().Genrelists[1].genreLists, Expected().Videos[1].summary),
    //                 _.merge(Expected().Genrelists[2].genreLists, Expected().Videos[2].summary),
    //                 {
    //                     jsonGraph: {
    //                         videos: {
    //                             missing: {
    //                                 summary: { $type: $atom }
    //                             }
    //                         }
    //                     }
    //                 }
    //             ]).
    //             subscribe(noOp, done, done);
    //     });
    //     it('should get partial values streamed in over time followed by an unhandled response result.', function(done) {

    //         var router = new R([].concat(
    //                 Routes().Genrelists.Ranges(null, 10),
    //                 Routes().Videos.Ranges.Summary(null)
    //             ),
    //             { streaming: true }
    //         )
    //         .routeUnhandledPathsTo({
    //             get: function convert(paths) {
    //                 return Observable.of(
    //                     paths.reduce(function(jsonGraph, path) {
    //                         pathValueMerge(jsonGraph.jsonGraph, {
    //                             path: path,
    //                             value: 'missing'
    //                         });
    //                         return jsonGraph;
    //                     }, { jsonGraph: {} })
    //                 ).delay(350);
    //             }
    //         });

    //         var obs = router.
    //             get([
    //                 ['genreLists', {from: 0, to: 2}, 'summary'],
    //                 ['videos', 'missing', 'summary']
    //             ]);

    //         TestRunner.runStreaming(obs, [
    //                 _.merge(Expected().Genrelists[0].genreLists, Expected().Videos[0].summary),
    //                 _.merge(Expected().Genrelists[1].genreLists, Expected().Videos[1].summary),
    //                 _.merge(Expected().Genrelists[2].genreLists, Expected().Videos[2].summary),
    //                 {
    //                     jsonGraph: {
    //                         videos: {
    //                             missing: {
    //                                 summary: 'missing'
    //                             }
    //                         }
    //                     }
    //                 }
    //             ]).
    //             subscribe(noOp, done, done);
    //     });
    // });
});
