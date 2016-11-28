var getJSON = require('../get/json');
var getJSONGraph = require('../get/jsonGraph');

module.exports = { json: json, jsonGraph: jsonGraph };

function json(model, _args, data, progressive) {
    var hasValue = false;
    if (!_args) {
        return { missing: false, hasValue: false };
    }
    args = [].concat(_args[1] || []);
    suffixes = [].concat(_args[2] || []);
    thisPaths = [].concat(_args[3] || []);
    path = (model._path || []).concat(_args[0] || []);
    if (progressive && thisPaths && thisPaths.length) {
        hasValue =  getJSON(model, thisPaths, data, progressive, true).hasValue;
    }
    return {
        args: null,
        data: data,
        missing: [],
        relative: [],
        hasValue: hasValue,
        fragments: [
            path, args, suffixes, thisPaths
        ]
    };
}

function jsonGraph(model, _args, data, progressive) {
    var hasValue = false;
    if (!_args) {
        return { missing: false, hasValue: false };
    }
    args = [].concat(_args[1] || []);
    suffixes = [].concat(_args[2] || []);
    thisPaths = [].concat(_args[3] || []);
    path = (model._path || []).concat(_args[0] || []);
    if (progressive && thisPaths && thisPaths.length) {
        hasValue = getJSONGraph({
            _root: model._root,
            _boxed: model._boxed,
            _materialized: model._materialized,
            _treatErrorsAsValues: model._treatErrorsAsValues
        }, thisPaths, data, true, true).hasValue;
    }
    return {
        args: null,
        data: data,
        missing: [],
        relative: [],
        hasValue: hasValue,
        fragments: [
            path, args, suffixes, thisPaths
        ]
    };
}
