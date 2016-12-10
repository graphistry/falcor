var noOp = function() {};
var _ = require('lodash');
var Observable = require('rxjs').Observable;
var R = require('./../../../src/Router');
var $atom = require('./../../../src/support/types').$atom;
var pathValueMerge = require('./../../../src/cache/pathValueMerge');

var Routes = require('./../../data');
var Expected = require('./../../data/expected');
var TestRunner = require('./../../TestRunner');

describe('Call', function() {
    it('should push items onto a collection and return partial values streamed in over time.', function(done) {
        var router = new R([].concat(
                Routes().Genrelists.Ranges(null, 10),
                Routes().Videos.Ranges.Summary(null)
            ),
            { streaming: true }
        );
        var obs = router.call(
            ['genreLists', 'push'],
            [{ $type: 'ref', value: ['videos', 0] },
             { $type: 'ref', value: ['videos', 1] },
             { $type: 'ref', value: ['videos', 2] }],
             [['summary']]
        );

        TestRunner.runStreaming(obs, [
                _.merge(
                    { paths: [[['genreLists', 'videos'], 0, 'summary']] },
                    { jsonGraph: Expected().Genrelists[0].genreLists.jsonGraph },
                    { jsonGraph: Expected().Videos[0].summary.jsonGraph }
                ),
                _.merge(
                    { paths: [[['genreLists', 'videos'], 1, 'summary']] },
                    { jsonGraph: Expected().Genrelists[1].genreLists.jsonGraph },
                    { jsonGraph: Expected().Videos[1].summary.jsonGraph }
                ),
                _.merge(
                    { paths: [[['genreLists', 'videos'], 2, 'summary']] },
                    { jsonGraph: Expected().Genrelists[2].genreLists.jsonGraph },
                    { jsonGraph: Expected().Videos[2].summary.jsonGraph }
                ),
                { invalidated: [['genreLists', 'top-rated']] }
            ]).
            subscribe(noOp, done, done);
    });
    it('should push items onto a collection and return partial values streamed in over time in the order in which they emit.', function(done) {
        var router = new R([].concat(
                Routes().Genrelists.Ranges(null, [50, 10, 1, 25]),
                Routes().Videos.Ranges.Summary(null)
            ),
            { streaming: true }
        );
        var obs = router.call(
            ['genreLists', 'push'],
            [{ $type: 'ref', value: ['videos', 0] },
             { $type: 'ref', value: ['videos', 1] },
             { $type: 'ref', value: ['videos', 2] }],
             [['summary']]
        );

        TestRunner.runStreaming(obs, [
                _.merge(
                    { paths: [[['genreLists', 'videos'], 2, 'summary']] },
                    { jsonGraph: Expected().Genrelists[2].genreLists.jsonGraph },
                    { jsonGraph: Expected().Videos[2].summary.jsonGraph }
                ),
                _.merge(
                    { paths: [[['genreLists', 'videos'], 1, 'summary']] },
                    { jsonGraph: Expected().Genrelists[1].genreLists.jsonGraph },
                    { jsonGraph: Expected().Videos[1].summary.jsonGraph }
                ),
                { invalidated: [['genreLists', 'top-rated']] },
                _.merge(
                    { paths: [[['genreLists', 'videos'], 0, 'summary']] },
                    { jsonGraph: Expected().Genrelists[0].genreLists.jsonGraph },
                    { jsonGraph: Expected().Videos[0].summary.jsonGraph }
                )
            ]).
            subscribe(noOp, done, done);
    });
    it('should push items onto a collection and return partial values streamed in over time followed by a materialized result.', function(done) {
        var router = new R([].concat(
                Routes().Genrelists.Ranges(null, 10),
                Routes().Videos.Ranges.Summary(null)
            ),
            { streaming: true }
        );
        var obs = router.call(
            ['genreLists', 'push'],
            [{ $type: 'ref', value: ['videos', 0] },
             { $type: 'ref', value: ['videos', 1] },
             { $type: 'ref', value: ['videos', 2] }],
             [['summary']]
        );

        TestRunner.runStreaming(obs, [
                _.merge(
                    { paths: [[['genreLists', 'videos'], 0, 'summary']] },
                    { jsonGraph: Expected().Genrelists[0].genreLists.jsonGraph },
                    { jsonGraph: Expected().Videos[0].summary.jsonGraph }
                ),
                _.merge(
                    { paths: [[['genreLists', 'videos'], 1, 'summary']] },
                    { jsonGraph: Expected().Genrelists[1].genreLists.jsonGraph },
                    { jsonGraph: Expected().Videos[1].summary.jsonGraph }
                ),
                _.merge(
                    { paths: [[['genreLists', 'videos'], 2, 'summary']] },
                    { jsonGraph: Expected().Genrelists[2].genreLists.jsonGraph },
                    { jsonGraph: Expected().Videos[2].summary.jsonGraph }
                ),
                { invalidated: [['genreLists', 'top-rated']] }
            ]).
            subscribe(noOp, done, done);
    });
    it('should push items onto a collection and return partial values and invalidations streamed in over time.', function(done) {
        var router = new R([].concat(
                Routes().Videos.Integers.Summary(null, 10)
            ),
            { streaming: true }
        );
        var obs = Observable.concat(
            router.call(['videos', 0, 'update'], ['Some Movie 0']),
            router.call(['videos', 1, 'update'], ['Some Movie 1']),
            router.call(['videos', 2, 'update'], ['Some Movie 2'])
        );

        TestRunner.runStreaming(obs, [
                { invalidated: [['videos', 0, 'summary']] },
                Expected().Videos[0].summary,
                { invalidated: [['videos', 1, 'summary']] },
                Expected().Videos[1].summary,
                { invalidated: [['videos', 2, 'summary']] },
                Expected().Videos[2].summary
            ]).
            subscribe(noOp, done, done);
    });
});
