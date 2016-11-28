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
    var head = require('../internalKeyDefinitions')()['ƒ_head'];
    var tail = require('../internalKeyDefinitions')()['ƒ_tail'];
    var Model = require('../dist/falcor.min').Model;
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
    var head = require('../internalKeyDefinitions')()['ƒ_head'];
    var tail = require('../internalKeyDefinitions')()['ƒ_tail'];
    var Model = require('../dist/falcor.min').Model;
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

/*


// function noop() {}
function noop(x) {
    debugger
    // console.log(JSON.stringify(x));
}

if (require.main === module) {
    var runner = runTestsWithModel(
        require('../dist/falcor').Model,             '@graphistry/falcor', false, '..'
    )[0].runner;
    debugger
    runner();
    debugger
    runner();
    debugger
    runner();
}

module.exports = _.zip(
        [0],
        // runTestsWithModel(require('falcor/dist/falcor.browser.min').Model, '@netflix/falcor   ', false, 'falcor'),
        runTestsWithModel(require('../dist/falcor.min').Model,             '@graphistry/falcor', false, '..')
        // runTestsWithModel(require('../dist/falcor.min').Model,             '@graphistry/falcor', true, '..')
    )
    .reduce(function(suite, tests) {
        return tests.reduce(function(suite, test) {
            return test && suite.add(test.name, test.runner) || suite;
        }, suite);
    }, new benchmark.Suite('DataSource Tests'));

function runTestsWithModel(ModelClass, ModelName, recycleJSON, packagePath) {

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

    var head = require(packagePath + '/lib/internal/head');
    var tail = require(packagePath + '/lib/internal/tail');

    function resetDataSourceModelCache() {
        debugger
        dataSourceModel._root.cache = {};
        dataSourceModel._root[head] = null;
        dataSourceModel._root[tail] = null;
        dataSourceModel._root.expired = [];
    }

    return [{
        name: ModelName + ' getJSON + setJSONGraph + getJSON - 100 paths from DataSource' + testNameSuffix,
        runner: function() {
            Rx.Observable.from(dataSourceModel
                .get(allTitlesJSONPath))
                .finally(resetDataSourceModelCache)
                .subscribe(noop, noop, noop);
            dataSource.trigger();
        }
    }, {
        name: ModelName + ' getJSONGraph + setJSONGraph + getJSONGraph - 100 paths from DataSource' + testNameSuffix,
        runner: function() {
            Rx.Observable.from(dataSourceModel
                .get(allTitlesPath)
                ._toJSONG())
                .finally(resetDataSourceModelCache)
                .subscribe(noop, noop, noop);
            dataSource.trigger();
        }
    }];
}
*/
