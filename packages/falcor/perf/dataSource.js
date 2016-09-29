var _ = require('lodash');
var benchmark = require('benchmark');
var TriggerDataSource = require("./TriggerDataSource");
var createCacheWith100Videos = require('./createCacheWith100Videos');
var toFlatBuffer = require('@graphistry/falcor-path-utils').toFlatBuffer;
var computeFlatBufferHash = require('@graphistry/falcor-path-utils').computeFlatBufferHash;

var head = require('../lib/internal/head');
var tail = require('../lib/internal/tail');
var next = require('../lib/internal/next');
var prev = require('../lib/internal/prev');

function noop() {}

module.exports = _.zip(
        runTestsWithModel(require('falcor/dist/falcor.browser.min').Model, '@netflix/falcor   '),
        runTestsWithModel(require('../dist/falcor.min').Model,             '@graphistry/falcor')
        // runTestsWithModel(require('../dist/falcor.min').Model,             '@graphistry/falcor', true)
    )
    .reduce(function(suite, tests) {
        return tests.reduce(function(suite, test) {
            return test && suite.add(test.name, test.runner) || suite;
        }, suite);
    }, new benchmark.Suite('DataSource Tests'));

function runTestsWithModel(ModelClass, ModelName, recycleJSON) {

    var dataSource = new TriggerDataSource(function() {
        return { jsonGraph: createCacheWith100Videos() };
    });
    var dataSourceModel = new ModelClass({
        source: dataSource,
        recycleJSON: recycleJSON
    });
    var testNameSuffix = !recycleJSON ? '' : ' recycling the JSON';
    var allTitlesPath = ['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title'];
    var allTitlesJSONPath = allTitlesPath;
    if (recycleJSON) {
        allTitlesJSONPath = computeFlatBufferHash(toFlatBuffer([allTitlesPath]));
    }

    function recycleDataSourceModelState() {
        dataSourceModel._root.cache = {};
        dataSourceModel._root[head] = null;
        dataSourceModel._root[tail] = null;
        dataSourceModel._root.expired = [];
    }

    return [{
        name: ModelName + ' getJSON + setJSONGraph + getJSON - 100 paths from DataSource' + testNameSuffix,
        runner: function() {
            dataSourceModel
                .get(allTitlesJSONPath)
                .subscribe(noop, noop, recycleDataSourceModelState);
            dataSource.trigger();
        }
    }, {
        name: ModelName + ' getJSONGraph + setJSONGraph + getJSONGraph - 100 paths from DataSource' + testNameSuffix,
        runner: function() {
            dataSourceModel
                .get(allTitlesPath)
                ._toJSONG()
                .subscribe(noop, noop, recycleDataSourceModelState);
            dataSource.trigger();
        }
    }];
}
