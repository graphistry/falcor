var get = require('./../lib/cache/get');
var Model = require('./../falcor.js');
var expect = require('chai').expect;
var clean = require('./cleanData').clean;
var convertKey = require('./cleanData').convertKey;
var getCachePosition = require('./../lib/cache/getCachePosition');

module.exports = function(testConfig) {
    var isJSONG = testConfig.isJSONG;

    // Gets the expected output, if its a
    // function, then call the function to get it.
    var expectedOutput = testConfig.output;
    if (typeof expectedOutput === 'function') {
        expectedOutput = expectedOutput();
    }
    var requestedMissingPaths = testConfig.requestedMissingPaths;
    var optimizedMissingPaths = testConfig.optimizedMissingPaths;
    var errors = testConfig.errors;
    var type = testConfig.input && testConfig.input[0] ||
        testConfig.inputs[0][0];
    var isJSONInput = !Array.isArray(type);
    var fn = get[isJSONG ? 'jsonGraph' : 'json'];
    var cache = testConfig.cache;
    if (typeof cache === 'function') {
        cache = cache();
    }
    var model;
    var source = testConfig.source;
    if (typeof source === 'undefined') {
        source = true;
    }
    if (testConfig.model) {
        model = testConfig.model;
    }
    else {
        model = new Model({
            cache: cache,
            source: source,
            recycleJSON: testConfig.recycleJSON,
            branchSelector: testConfig.branchSelector
        });
    }

    // It only make sense to have one of these on at a time. but
    // you can have both on, fromWhenceYouCame will always win.
    if (testConfig.fromWhenceYouCame) {
        model = model._fromWhenceYouCame(true);
    }

    if (testConfig.treatErrorsAsValues) {
        model = model.treatErrorsAsValues();
    }

    if (testConfig.boxValues) {
        model = model.boxValues();
    }

    // TODO: This is cheating, but its intentional for testing
    if (testConfig.deref) {
        model._path = testConfig.deref;

        // add the reference container to the model as well if there is one.
        if (testConfig.referenceContainer) {
            model._referenceContainer =
                getCachePosition(model._root.cache, testConfig.referenceContainer);
        }
    }

    if (testConfig.materialize) {
        model = model._materialize();
    }

    var out;

    if (testConfig.input) {
        out = fn(model, testConfig.input, {}, true, true);
    }

    else {
        testConfig.inputs.forEach(function(input) {
            out = fn(model, input, {}, true, true);
        });
    }

    var valueNode = out.data;
    var stripMetadataKeys = testConfig.stripMetadata === false ? [] : [f_meta_data];

    if (testConfig.stripMetadata === false) {
        valueNode = convertKey(valueNode, {
            [f_meta_data]: function(x) { return x; }
        });
    } else if (testConfig.recycleJSON === true) {
        valueNode = JSON.parse(JSON.stringify(valueNode));
    }

    // $size is stripped out of basic core tests.
    // We have to strip out parent as well from the output since it will produce
    // infinite recursion.
    valueNode = clean(valueNode, {strip: ['$size'].concat(stripMetadataKeys)});
    expectedOutput = clean(expectedOutput, {strip: ['$size'].concat(stripMetadataKeys)});

    if (expectedOutput) {
        expect(valueNode).to.deep.equals(expectedOutput);
    }
    if (requestedMissingPaths) {
        expect(out.requested).to.deep.equals(requestedMissingPaths);
    }
    if (optimizedMissingPaths) {
        expect(out.missing).to.deep.equals(optimizedMissingPaths);
    }
    if (errors) {
        expect(out.errors).to.deep.equals(errors);
    }
};
