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
                Routes().Genrelists.Ranges(null, 100),
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
                _.merge({ paths: [[
                    ['genreLists', 'videos'], 0, 'summary']]},
                    Expected().Genrelists[0].genreLists,
                    Expected().Videos[0].summary
                ),
                _.merge({ paths: [[
                    ['genreLists', 'videos'], 1, 'summary']]},
                    Expected().Genrelists[1].genreLists,
                    Expected().Videos[1].summary
                ),
                _.merge({ paths: [[
                    ['genreLists', 'videos'], 2, 'summary']]},
                    Expected().Genrelists[2].genreLists,
                    Expected().Videos[2].summary
                ),
                { invalidated: [['genreLists', 'top-rated']] }
            ]).
            subscribe(noOp, done, done);
    });
    it('should push items onto a collection and return partial values streamed in over time in the order in which they emit.', function(done) {
        var router = new R([].concat(
                Routes().Genrelists.Ranges(null, [100, 10, 1, 50]),
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
                _.merge({ paths: [
                    [['genreLists', 'videos'], 2, 'summary']]},
                    Expected().Genrelists[2].genreLists,
                    Expected().Videos[2].summary
                ),
                _.merge({ paths: [
                    [['genreLists', 'videos'], 1, 'summary']]},
                    Expected().Genrelists[1].genreLists,
                    Expected().Videos[1].summary
                ),
                { invalidated: [['genreLists', 'top-rated']] },
                _.merge({ paths: [
                    [['genreLists', 'videos'], 0, 'summary']]},
                    Expected().Genrelists[0].genreLists,
                    Expected().Videos[0].summary
                )
            ]).
            subscribe(noOp, done, done);
    });
});
