var _ = require('lodash');
var benchmark = require('benchmark');
var TriggerDataSource = require("./TriggerDataSource");
var createCacheWith100Videos = require('./createCacheWith100Videos');
var toFlatBuffer = require('@graphistry/falcor-path-utils').toFlatBuffer;
var computeFlatBufferHash = require('@graphistry/falcor-path-utils').computeFlatBufferHash;

function noop() {}

module.exports = _.zip(
        runTestsWithModel(require('falcor/dist/falcor.browser.min').Model, '@netflix/falcor   '),
        runTestsWithModel(require('../dist/falcor.min').Model,             '@graphistry/falcor'),
        runTestsWithModel(require('../dist/falcor.min').Model,             '@graphistry/falcor', true)
    )
    .reduce(function(suite, tests) {
        return tests.reduce(function(suite, test) {
            return test && suite.add(test.name, test.runner) || suite;
        }, suite);
    }, new benchmark.Suite('Get Tests'));

function runTestsWithModel(ModelClass, ModelName, recycleJSON) {

    var seed = [{}];
    var memoizedModel = new ModelClass({
        recycleJSON: recycleJSON,
        cache: createCacheWith100Videos()
    });
    var testNameSuffix = !recycleJSON ? '' : ' recycling the JSON';
    var allTitlesPath = ['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title'];
    var allTitlesPaths = !recycleJSON ?
        [allTitlesPath] :
        computeFlatBufferHash(toFlatBuffer([allTitlesPath]));

    // hard-link all refs in the memoized Model's cache.
    memoizedModel.get(allTitlesPath).subscribe(noop, noop, noop);

    if (recycleJSON) {
        seed[0] = memoizedModel._seed;
    }

    var tests = [{
        name: ModelName + ' getJSON - 100 paths from cache' + testNameSuffix,
        runner: function() {
            memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, seed);
        }
    }];

    return tests;
}
