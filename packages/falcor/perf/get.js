var _ = require('lodash');
var Benchmark = require('benchmark');

module.exports = _.zip(
        netflixGetSuiteDescription(),
        graphistryGetSuiteDescription(),
        graphistryGetRecycledSuiteDescription()
    )
    .reduce(function(suite, tests) {
        return tests.reduce(function(suite, test) {
            return test && suite.add(test) || suite;
        }, suite);
    }, new Benchmark.Suite('Get Tests', { async: false }));

function netflixGetSuiteDescription() {
    var Model = require('falcor/dist/falcor.browser.min').Model;
    var createCacheWith100Videos = require('./createCacheWith100Videos');
    var memoizedModel = new Model({ cache: createCacheWith100Videos() });
    var memoizedBoundModel = memoizedModel.deref({ $__path: ['lists', 'A', '0'] });
    var allTitlesPaths = [['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title']];
    // hard-link all refs in the memoized Model's cache.
    memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, [{}]);
    return [{
        async: false,
        name: '   @netflix/falcor getJSON - 100 paths from cache',
        fn: function() {
            memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, [{}]);
        }
    }, {
        async: false,
        name: '   @netflix/falcor getJSONGraph - 100 paths from cache',
        fn: function() {
            memoizedModel._getPathValuesAsJSONG(memoizedModel, allTitlesPaths, [{}]);
        }
    }, {
        async: false,
        name: '   @netflix/falcor getVersion',
        fn: function() {
            memoizedBoundModel.getVersion();
        }
    }];
}

function graphistryGetSuiteDescription() {
    var jsonSeed = {};
    var jsonGraphSeed = {};
    var f_meta = require('../lib/internal/f_meta_data');
    var Model = require('../dist/falcor.all.min').Model;
    var createCacheWith100Videos = require('./createCacheWith100Videos');
    var memoizedModel = new Model({ cache: createCacheWith100Videos() });
    var memoizedBoundModel = memoizedModel.deref({ [f_meta]: { abs_path: ['lists', 'A', '0'] }});
    var allTitlesPaths = [['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title']];
    // hard-link all refs in the memoized Model's cache.
    memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, {}, false, true);
    return [{
        async: false,
        name: '@graphistry/falcor getJSON - 100 paths from cache',
        fn: function() {
            memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, jsonSeed, false, true);
        }
    }, {
        async: false,
        name: '@graphistry/falcor getJSONGraph - 100 paths from cache',
        fn: function() {
            memoizedModel._getPathValuesAsJSONG(memoizedModel, allTitlesPaths, jsonGraphSeed, false, true);
        }
    }, {
        async: false,
        name: '@graphistry/falcor getVersion',
        fn: function() {
            memoizedBoundModel.getVersion();
        }
    }];
}

function graphistryGetRecycledSuiteDescription() {
    var jsonSeed = {};
    var Model = require('../dist/falcor.all.min').Model;
    var createCacheWith100Videos = require('./createCacheWith100Videos');
    var toFlatBuffer = require('@graphistry/falcor-path-utils/lib/toFlatBuffer');
    var computeFlatBufferHash = require('@graphistry/falcor-path-utils/lib/computeFlatBufferHash');
    var memoizedModel = new Model({ cache: createCacheWith100Videos() });
    var allTitlesPaths = [['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title']];
    // hard-link all refs in the memoized Model's cache.
    memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, {}, false, true);
    memoizedModel._seed = jsonSeed;
    memoizedModel._recycleJSON = true;
    allTitlesPaths = [computeFlatBufferHash(toFlatBuffer(allTitlesPaths))];
    return [{
        async: false,
        name: '@graphistry/falcor getJSON - 100 paths from cache',
        suffix: ' (recycled JSON)',
        fn: function() {
            memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, jsonSeed, false, true);
        }
    }];
}
