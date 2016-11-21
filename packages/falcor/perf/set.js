var _ = require('lodash');
var benchmark = require('benchmark');
var TriggerDataSource = require("./TriggerDataSource");
var createCacheWith100Videos = require('./createCacheWith100Videos');

function noop() {}

module.exports = _.zip(
        runTestsWithModel(require('falcor/dist/falcor.browser.min').Model, '@netflix/falcor   ', 'falcor'),
        runTestsWithModel(require('../dist/falcor.min').Model,             '@graphistry/falcor', '..')
    )
    .reduce(function(suite, tests) {
        return tests.reduce(function(suite, test) {
            return test && suite.add(test.name, test.runner) || suite;
        }, suite);
    }, new benchmark.Suite('Set Tests'));

function runTestsWithModel(ModelClass, ModelName, packagePath) {

    var memoizedModel = new ModelClass({ cache: createCacheWith100Videos() });
    var allTitlesPath = ['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title'];

    // hard-link all refs in the memoized Model's cache.
    memoizedModel._root.cache.videos = {};
    memoizedModel.get(allTitlesPath).subscribe(noop, noop, noop);

    var head = require(packagePath + '/lib/internal/head');
    var tail = require(packagePath + '/lib/internal/tail');

    function resetModelVideosState() {
        memoizedModel._root.cache.videos = {};
        memoizedModel._root[head] = null;
        memoizedModel._root[tail] = null;
        memoizedModel._root.expired = [];
    }

    return [{
        name: ModelName + ' setJSONGraph - 100 paths into Cache',
        runner: function() {
            resetModelVideosState();
            memoizedModel._setJSONGs(memoizedModel, [{
                paths: [allTitlesPath],
                jsonGraph: createCacheWith100Videos().videos
            }]);
        }
    }, {
        name: ModelName + ' setPathMaps - 100 paths into Cache',
        runner: function() {
            resetModelVideosState();
            memoizedModel._setPathMaps(memoizedModel, [{
                json: createCacheWith100Videos().videos
            }]);
        }
    }, {
        name: ModelName + ' setPathValues - 100 paths into Cache',
        runner: function() {
            resetModelVideosState();
            memoizedModel._setPathValues(memoizedModel, create100VideoPathValues());
        }
    }];
}

function create100VideoPathValues() {
    var i = 0;
    var arr = new Array(100);
    do {
        arr[i] = {
            path: ['videos', i, 'title'],
            value: {
                $type: 'atom',
                value: 'Video ' + i
            }
        };
    } while(++i < 100);
    return arr;
}
