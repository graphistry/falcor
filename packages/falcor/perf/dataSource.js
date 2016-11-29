var Rx = require("rxjs");
var _ = require('lodash');
var Benchmark = require('benchmark');

module.exports = _.zip(
        netflixGetDataSourceSuiteDescription(),
        graphistryGetDataSourceSuiteDescription(),
        graphistryGetDataSourceRecycledSuiteDescription()
    )
    .reduce(function(suite, tests) {
        return tests.reduce(function(suite, test) {
            return test && suite.add(test) || suite;
        }, suite);
    }, new Benchmark.Suite('DataSource Tests', { async: false }));

function netflixGetDataSourceSuiteDescription() {

    var noop = function() {};
    var head = require('falcor/lib/internal/head');
    var tail = require('falcor/lib/internal/tail');
    var Model = require('falcor/dist/falcor.browser.min').Model;
    var TriggerDataSource = require('./TriggerDataSource');
    var createCacheWith100Videos = require('./createCacheWith100Videos');
    var dataSource = new TriggerDataSource(function() {
        return { jsonGraph: createCacheWith100Videos() };
    });
    var dataSourceModel = new Model({ source: dataSource });
    var allTitlesPath = ['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title'];

    function resetDataSourceModelCache() {
        dataSourceModel._root.cache = {};
        dataSourceModel._root[head] = null;
        dataSourceModel._root[tail] = null;
        dataSourceModel._root.expired = [];
        dataSourceModel._root.version = 0;
    }

    return [{
        async: false,
        name: '   @netflix/falcor getJSON + setJSONGraph + getJSON - 100 paths from DataSource',
        fn: function() {
            Rx.Observable
                .from(dataSourceModel.get(allTitlesPath))
                .finally(resetDataSourceModelCache)
                .subscribe(noop, noop, noop);
            dataSource.trigger();
        }
    }, {
        async: false,
        name: '   @netflix/falcor getJSONGraph + setJSONGraph + getJSONGraph - 100 paths from DataSource',
        fn: function() {
            Rx.Observable
                .from(dataSourceModel.get(allTitlesPath)._toJSONG())
                .finally(resetDataSourceModelCache)
                .subscribe(noop, noop, noop);
            dataSource.trigger();
        }
    }];
}

function graphistryGetDataSourceSuiteDescription() {

    var noop = function() {};
    var head = require('../lib/internal/f_head');
    var tail = require('../lib/internal/f_tail');
    var Model = require('../dist/falcor.all.min').Model;
    var TriggerDataSource = require('./TriggerDataSource');
    var createCacheWith100Videos = require('./createCacheWith100Videos');
    var dataSource = new TriggerDataSource(function() {
        return { jsonGraph: createCacheWith100Videos() };
    });
    var dataSourceModel = new Model({ source: dataSource });
    var allTitlesPath = ['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title'];

    function resetDataSourceModelCache() {
        dataSourceModel._root.cache = {};
        dataSourceModel._root[head] = null;
        dataSourceModel._root[tail] = null;
        dataSourceModel._root.expired = [];
        dataSourceModel._root.version = 0;
    }

    return [{
        async: false,
        name: '@graphistry/falcor getJSON + setJSONGraph + getJSON - 100 paths from DataSource',
        fn: function() {
            Rx.Observable
                .from(dataSourceModel.get(allTitlesPath))
                .finally(resetDataSourceModelCache)
                .subscribe(noop, noop, noop);
            dataSource.trigger();
        }
    }, {
        async: false,
        name: '@graphistry/falcor getJSONGraph + setJSONGraph + getJSONGraph - 100 paths from DataSource',
        fn: function() {
            Rx.Observable
                .from(dataSourceModel.get(allTitlesPath)._toJSONG())
                .finally(resetDataSourceModelCache)
                .subscribe(noop, noop, noop);
            dataSource.trigger();
        }
    }];
}

function graphistryGetDataSourceRecycledSuiteDescription() {

    var noop = function() {};
    var head = require('../lib/internal/f_head');
    var tail = require('../lib/internal/f_tail');
    var Model = require('../dist/falcor.all.min').Model;
    var TriggerDataSource = require('./TriggerDataSource');
    var createCacheWith100Videos = require('./createCacheWith100Videos');
    var toFlatBuffer = require('@graphistry/falcor-path-utils/lib/toFlatBuffer');
    var computeFlatBufferHash = require('@graphistry/falcor-path-utils/lib/computeFlatBufferHash');
    var dataSource = new TriggerDataSource(function() {
        return { jsonGraph: createCacheWith100Videos() };
    });
    var dataSourceModel = new Model({ source: dataSource, recycleJSON: true });
    var allTitlesPath = computeFlatBufferHash(toFlatBuffer(
        [['lolomo', {from: 0, to: 9}, {from: 0, to: 9}, 'item', 'title']]
    ));

    function resetDataSourceModelCache() {
        dataSourceModel._seed = {};
        dataSourceModel._root.cache = {};
        dataSourceModel._root[head] = null;
        dataSourceModel._root[tail] = null;
        dataSourceModel._root.expired = [];
        dataSourceModel._root.version = 0;
    }

    return [{
        async: false,
        name: '@graphistry/falcor getJSON + setJSONGraph + getJSON - 100 paths from DataSource',
        suffix: ' (recycled JSON)',
        fn: function() {
            Rx.Observable
                .from(dataSourceModel.get(allTitlesPath))
                .finally(resetDataSourceModelCache)
                .subscribe(noop, noop, noop);
            dataSource.trigger();
        }
    }];
}
