var noOp = function() {};
var _ = require('lodash');
var falcor = require('@graphistry/falcor');
var Observable = require('rxjs').Observable;
var R = require('./../../src/Router');
var Routes = require('./../data');
var Expected = require('./../data/expected');
var TestRunner = require('./../TestRunner');

describe('Get Progressively', function() {
    generateTests(false);
});

describe('Get Progressively (recycle JSON)', function() {
    generateTests(true);
});

function generateTests(recycleJSON) {
    describe('Simple', function() {
        it('should get partial values streamed in over time.', function(done) {
            var router = new R(
                Routes().Videos.Ranges.Summary(function(pathSet) {
                    TestRunner.comparePath(['videos', [{from:0, to:2}], 'summary'], pathSet);
                }, 100),
                { streaming: true }
            );

            var model = new falcor.Model({ source: router, recycleJSON: recycleJSON });
            var obs = Observable.from(model.
                    get(['videos', {from: 0, to: 2}, 'summary']).
                    progressively()
                )
                .map(toJSON);

            TestRunner.runStreaming(obs, [
                    _.merge(
                        Expected().Videos[0].summary
                    ),
                    _.merge(
                        Expected().Videos[0].summary,
                        Expected().Videos[1].summary
                    ),
                    _.merge(
                        Expected().Videos[0].summary,
                        Expected().Videos[1].summary,
                        Expected().Videos[2].summary
                    )
                ].map(toJSONEnv)).
                subscribe(noOp, done, done);
        });
        it('should get partial buffered values streamed in over time.', function(done) {
            var router = new R(
                Routes().Videos.Ranges.Summary(function(pathSet) {
                    TestRunner.comparePath(['videos', [{from:0, to:2}], 'summary'], pathSet);
                }, 100),
                { streaming: true, bufferTime: 250 }
            );

            var model = new falcor.Model({ source: router, recycleJSON: recycleJSON });
            var obs = Observable.from(model.
                    get(['videos', {from: 0, to: 2}, 'summary']).
                    progressively()
                )
                .map(toJSON);

            TestRunner.runStreaming(obs, [
                    _.merge(
                        Expected().Videos[0].summary,
                        Expected().Videos[1].summary
                    ),
                    _.merge(
                        Expected().Videos[0].summary,
                        Expected().Videos[1].summary,
                        Expected().Videos[2].summary
                    )
                ].map(toJSONEnv)).
                subscribe(noOp, done, done);
        });
        it('should get partial values streamed in over time in the order in which they emit.', function(done) {
            var router = new R(
                Routes().Videos.Ranges.Summary(function(pathSet) {
                    TestRunner.comparePath(['videos', [{from:0, to:2}], 'summary'], pathSet);
                }, [100, 10, 1]),
                { streaming: true }
            );

            var model = new falcor.Model({ source: router, recycleJSON: recycleJSON });
            var obs = Observable.from(model.
                    get(['videos', {from: 0, to: 2}, 'summary']).
                    progressively()
                )
                .map(toJSON);

            TestRunner.runStreaming(obs, [
                    _.merge(
                        Expected().Videos[2].summary
                    ),
                    _.merge(
                        Expected().Videos[2].summary,
                        Expected().Videos[1].summary
                    ),
                    _.merge(
                        Expected().Videos[2].summary,
                        Expected().Videos[1].summary,
                        Expected().Videos[0].summary
                    )
                ].map(toJSONEnv)).
                subscribe(noOp, done, done);
        });
    });
    describe('References', function() {
        it('should get partial values streamed in over time.', function(done) {
            var router = new R([].concat(
                    Routes().Genrelists.Ranges(null, 100),
                    Routes().Videos.Ranges.Summary(null)
                ),
                { streaming: true }
            );

            var model = new falcor.Model({ source: router, recycleJSON: recycleJSON });
            var obs = Observable.from(model.
                    get(['genreLists', {from: 0, to: 2}, 'summary']).
                    progressively()
                )
                .map(toJSON);

            TestRunner.runStreaming(obs, [
                    _.merge(
                        Expected().Genrelists[0].genreLists,
                        Expected().Videos[0].summary
                    ),
                    _.merge(
                        Expected().Genrelists[0].genreLists,
                        Expected().Genrelists[1].genreLists,
                        Expected().Videos[0].summary,
                        Expected().Videos[1].summary
                    ),
                    _.merge(
                        Expected().Genrelists[0].genreLists,
                        Expected().Genrelists[1].genreLists,
                        Expected().Genrelists[2].genreLists,
                        Expected().Videos[0].summary,
                        Expected().Videos[1].summary,
                        Expected().Videos[2].summary
                    )
                ]
                .map(toJSONEnv)
                .map(toGenreListsJSON)).
                subscribe(noOp, done, done);
        });
        it('should get partial values streamed in over time in the order in which they emit.', function(done) {
            var router = new R([].concat(
                    Routes().Genrelists.Ranges(null, [100, 10, 1]),
                    Routes().Videos.Ranges.Summary(null)
                ),
                { streaming: true }
            );

            var model = new falcor.Model({ source: router, recycleJSON: recycleJSON });
            var obs = Observable.from(model.
                    get(['genreLists', {from: 0, to: 2}, 'summary']).
                    progressively()
                )
                .map(toJSON);

            TestRunner.runStreaming(obs, [

                    _.merge(
                        Expected().Genrelists[2].genreLists,
                        Expected().Videos[2].summary
                    ),

                    _.merge(
                        Expected().Genrelists[2].genreLists,
                        Expected().Genrelists[1].genreLists,
                        Expected().Videos[2].summary,
                        Expected().Videos[1].summary
                    ),

                    _.merge(
                        Expected().Genrelists[2].genreLists,
                        Expected().Genrelists[1].genreLists,
                        Expected().Genrelists[0].genreLists,
                        Expected().Videos[2].summary,
                        Expected().Videos[1].summary,
                        Expected().Videos[0].summary
                    )
                ]
                .map(toJSONEnv)
                .map(toGenreListsJSON)).
                subscribe(noOp, done, done);
        });
    });
}

function toJSON(x) {
    return JSON.parse(JSON.stringify(x));
}

function toJSONEnv(jsonGraphEnv) {
    return { json: jsonGraphEnv.jsonGraph };
}

function toGenreListsJSON(jsonEnv) {
    var videos = jsonEnv.json.videos;
    var genreLists = jsonEnv.json.genreLists;
    delete jsonEnv.json.videos;
    for (var x in genreLists) {
        genreLists[x] = videos[x];
    }
    return jsonEnv;
}
