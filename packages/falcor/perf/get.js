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
    }, new Benchmark.Suite('Get Tests', { async: true }));

function netflixGetSuiteDescription() {
    var Model = require('falcor/dist/falcor.browser.min').Model;
    var createCacheWith100Videos = require('./createCacheWith100Videos');
    var memoizedModel = new Model({
        allowFromWhenceYouCame: true,
        cache: createCacheWith100Videos() });
    var memoizedBoundModel = memoizedModel.deref({ $__path: ['lists', 'A', '0'] });
    var allTitlesPaths = [['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title']];
    // hard-link all refs in the memoized Model's cache.
    memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, []);
    return [{
        async: true,
        name: '   @netflix/falcor getJSON - 100 paths from cache',
        fn: function() {
            memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, [{}]);
        }
    }, {
        async: true,
        name: '   @netflix/falcor getJSONGraph - 100 paths from cache',
        fn: function() {
            memoizedModel._getPathValuesAsJSONG(memoizedModel, allTitlesPaths, [{}]);
        }
    }, {
        async: true,
        name: '   @netflix/falcor getVersion',
        fn: function() {
            memoizedBoundModel.getVersion();
        }
    }];
}

function graphistryGetSuiteDescription() {
    var Model = require('../dist/falcor.all.min').Model;
    var f_meta_data = require('../lib/internal/f_meta_data');
    var FalcorJSON = require('../dist/falcor.all.min').FalcorJSON;
    var createCacheWith100Videos = require('./createCacheWith100Videos');
    var memoizedModel = new Model({
        allowFromWhenceYouCame: true,
        cache: createCacheWith100Videos() });
    var memoizedBoundModel = memoizedModel.deref({ [f_meta_data]: { abs_path: ['lists', 'A', '0'] }});
    var allTitlesPaths = [['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title']];
    var seed = { __proto__: FalcorJSON.prototype };
    // hard-link all refs in the memoized Model's cache.
    memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, null, false, true);
    return [{
        async: true,
        name: '@graphistry/falcor getJSON - 100 paths from cache',
        fn: function() {
            memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, seed, false, true);
        }
    }, {
        async: true,
        name: '@graphistry/falcor getJSONGraph - 100 paths from cache',
        fn: function() {
            memoizedModel._getPathValuesAsJSONG(memoizedModel, allTitlesPaths, {}, false, true);
        }
    }, {
        async: true,
        name: '@graphistry/falcor getVersion',
        fn: function() {
            memoizedBoundModel.getVersion();
        }
    }];
}

function graphistryGetRecycledSuiteDescription() {
    var Model = require('../dist/falcor.all.min').Model;
    var createCacheWith100Videos = require('./createCacheWith100Videos');
    var toFlatBuffer = require('@graphistry/falcor-path-utils/lib/toFlatBuffer');
    var computeFlatBufferHash = require('@graphistry/falcor-path-utils/lib/computeFlatBufferHash');
    var memoizedModel = new Model({
        recycleJSON: true,
        allowFromWhenceYouCame: true,
        cache: createCacheWith100Videos() });
    var allTitlesPaths = [['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title']];
    // hard-link all refs in the memoized Model's cache.
    memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, null, false, true);
    memoizedModel._recycleJSON = true;
    memoizedModel._treatErrorsAsValues = true;
    var seed = memoizedModel._seed;
    allTitlesPaths = [computeFlatBufferHash(toFlatBuffer(allTitlesPaths))];
    return [{
        async: true,
        name: '@graphistry/falcor getJSON - 100 paths from cache',
        suffix: ' (recycled JSON)',
        fn: function() {
            memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, seed, false, true);
        }
    }];
}
