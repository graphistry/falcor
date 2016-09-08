var _ = require('lodash');
var benchmark = require('benchmark');
var TriggerDataSource = require("./TriggerDataSource");
var createCacheWith100Videos = require('./createCacheWith100Videos');

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

function runTestsWithModel(ModelClass, ModelName, JSONWithHashCodes) {

    var seed = [{}];
    var memoizedModel = new ModelClass({
        cache: createCacheWith100Videos(),
        JSONWithHashCodes: JSONWithHashCodes
    });
    var testNameSuffix = !JSONWithHashCodes ? '' : ' with hash codes';
    var allTitlesPath = ['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title'];
    var allTitlesPaths = [allTitlesPath];

    // hard-link all refs in the memoized Model's cache.
    memoizedModel.get(allTitlesPath).subscribe(noop, noop, noop);

    var tests = [{
        name: ModelName + ' getJSON - 100 paths from Cache reusing the JSON seed' + testNameSuffix,
        runner: function() {
            memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, seed);
        }
    }, {
        name: ModelName + ' getJSON - 100 paths from Cache with a new JSON seed each time' + testNameSuffix,
        runner: function() {
            memoizedModel._getPathValuesAsPathMap(memoizedModel, allTitlesPaths, [{}]);
        }
    }];

    if (!JSONWithHashCodes) {
        tests.push({
            name: ModelName + ' getJSONGraph - 100 paths from Cache with a new JSON seed each time' + testNameSuffix,
            runner: function() {
                memoizedModel._getPathValuesAsJSONG(memoizedModel, allTitlesPaths, [{}]);
            }
        });
    }

    return tests;
}
