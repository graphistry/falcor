var _ = require('lodash');
var Benchmark = require('benchmark');

module.exports = _.zip(
        netflixSetSuiteDescription(),
        graphistrySetSuiteDescription()
    )
    .reduce(function(suite, tests) {
        return tests.reduce(function(suite, test) {
            return test && suite.add(test) || suite;
        }, suite);
    }, new Benchmark.Suite('Set Tests', { async: false }));

function netflixSetSuiteDescription() {

    var head = require('falcor/lib/internal/head');
    var tail = require('falcor/lib/internal/tail');
    var Model = require('falcor/dist/falcor.browser.min').Model;
    var TriggerDataSource = require("./TriggerDataSource");
    var createCacheWith100Videos = require('./createCacheWith100Videos');
    var memoizedModel = new Model({ cache: createCacheWith100Videos() });
    var allTitlesPaths = [['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title']];

    // hard-link all refs in the memoized Model's cache.
    memoizedModel._root.cache.videos = {};
    memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, [{}]);

    function resetModelVideosState() {
        memoizedModel._root.cache.videos = {};
        memoizedModel._root[head] = null;
        memoizedModel._root[tail] = null;
        memoizedModel._root.expired = [];
    }

    return [{
        async: false,
        name: '   @netflix/falcor setJSONGraph - 100 paths into Cache',
        fn: function() {
            resetModelVideosState();
            memoizedModel._setJSONGs(memoizedModel, [{
                paths: allTitlesPaths,
                jsonGraph: createCacheWith100Videos().videos
            }]);
        }
    }, {
        async: false,
        name: '   @netflix/falcor setPathMaps - 100 paths into Cache',
        fn: function() {
            resetModelVideosState();
            memoizedModel._setPathMaps(memoizedModel, [{
                json: createCacheWith100Videos().videos
            }]);
        }
    }, {
        async: false,
        name: '   @netflix/falcor setPathValues - 100 paths into Cache',
        fn: function() {
            resetModelVideosState();
            memoizedModel._setPathValues(memoizedModel,
                create100VideoPathValues());
        }
    }];
}

function graphistrySetSuiteDescription() {

    var head = require('../internalKeyDefinitions')()['ƒ_head'];
    var tail = require('../internalKeyDefinitions')()['ƒ_tail'];
    var Model = require('../dist/falcor.min').Model;
    var TriggerDataSource = require("./TriggerDataSource");
    var createCacheWith100Videos = require('./createCacheWith100Videos');
    var memoizedModel = new Model({ cache: createCacheWith100Videos() });
    var allTitlesPaths = [['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title']];

    // hard-link all refs in the memoized Model's cache.
    memoizedModel._root.cache.videos = {};
    memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, {}, false, true);

    function resetModelVideosState() {
        memoizedModel._root.cache.videos = {};
        memoizedModel._root[head] = null;
        memoizedModel._root[tail] = null;
        memoizedModel._root.expired = [];
    }

    return [{
        async: false,
        name: '@graphistry/falcor setJSONGraph - 100 paths into Cache',
        fn: function() {
            resetModelVideosState();
            memoizedModel._setJSONGs(memoizedModel, [{
                paths: allTitlesPaths,
                jsonGraph: createCacheWith100Videos().videos
            }]);
        }
    }, {
        async: false,
        name: '@graphistry/falcor setPathMaps - 100 paths into Cache',
        fn: function() {
            resetModelVideosState();
            memoizedModel._setPathMaps(memoizedModel, [{
                json: createCacheWith100Videos().videos
            }]);
        }
    }, {
        async: false,
        name: '@graphistry/falcor setPathValues - 100 paths into Cache',
        fn: function() {
            resetModelVideosState();
            memoizedModel._setPathValues(memoizedModel,
                create100VideoPathValues());
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
