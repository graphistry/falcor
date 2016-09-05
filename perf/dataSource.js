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
        return suite
            .add(tests[0].name, tests[0].runner)
            .add(tests[1].name, tests[1].runner);
    }, new benchmark.Suite('DataSource Tests'));

function runTestsWithModel(ModelClass, ModelName) {

    var dataSource = new TriggerDataSource(function() {
        return { jsonGraph: createCacheWith100Videos() };
    });
    var dataSourceModel = new ModelClass({ source: dataSource });
    var allTitlesPath = ['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title'];

    function recycleDataSourceModelState() {
        dataSourceModel._root.cache = {};
        dataSourceModel._root[head] = null;
        dataSourceModel._root[tail] = null;
        dataSourceModel._root.expired = [];
    }

    return [{
        name: ModelName + ' getJSON + setJSONGraph + getJSON - 100 paths from DataSource',
        runner: function() {
            dataSourceModel
                .get(allTitlesPath)
                .subscribe(noop, noop, recycleDataSourceModelState);
            dataSource.trigger();
        }
    }, {
        name: ModelName + ' getJSONGraph + setJSONGraph + getJSONGraph - 100 paths from DataSource',
        runner: function() {
            dataSourceModel
                .get(allTitlesPath)
                ._toJSONG()
                .subscribe(noop, noop, recycleDataSourceModelState);
            dataSource.trigger();
        }
    }];
}
