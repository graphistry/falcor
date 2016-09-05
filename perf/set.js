var _ = require('lodash');
var benchmark = require('benchmark');
var TriggerDataSource = require("./TriggerDataSource");
var createCacheWith100Videos = require('./createCacheWith100Videos');
var head = require('../lib/internal/head');
var tail = require('../lib/internal/tail');
var next = require('../lib/internal/next');
var prev = require('../lib/internal/prev');

function noop() {}

module.exports = _.zip(
        runTestsWithModel(require('falcor/dist/falcor.browser.min').Model, '@netflix/falcor   '),
        runTestsWithModel(require('../dist/falcor.min').Model,             '@graphistry/falcor')
    )
    .reduce(function(suite, tests) {
        return tests.reduce(function(suite, test) {
            return test && suite.add(test.name, test.runner) || suite;
        }, suite);
    }, new benchmark.Suite('Set Tests'));

function runTestsWithModel(ModelClass, ModelName) {

    var memoizedModel = new ModelClass({ cache: createCacheWith100Videos() });
    var allTitlesPath = ['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title'];

    // hard-link all refs in the memoized Model's cache.
    memoizedModel._root.cache.videos = {};
    memoizedModel.get(allTitlesPath).subscribe(noop, noop, noop);

    function resetModelVideosState() {
        memoizedModel._root.cache.videos = {};
        memoizedModel._root[head] = null;
        memoizedModel._root[tail] = null;
        memoizedModel._root.expired = [];
    }

    return [{
        name: ModelName + ' setCache - cache with 100 videos',
        runner: function() {
            new ModelClass({ cache: createCacheWith100Videos() });
        }
    }, {
        name: ModelName + ' setJSONGraph - 100 paths into Cache',
        runner: function() {
            resetModelVideosState();
            memoizedModel._setJSONGs(memoizedModel, [{
                paths: [allTitlesPath],
                jsonGraph: createCacheWith100Videos().videos
            }]);
        }
    }];
}
