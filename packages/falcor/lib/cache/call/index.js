var getJSON = require('../get/json');
var getJSONGraph = require('../get/jsonGraph');

module.exports = { json: json, jsonGraph: jsonGraph };

function json(model, _args, data, progressive) {
    if (!_args) {
        return {};
    }
    var hasValue = false;
    args = _args[1] || [];
    suffixes = _args[2] || [];
    thisPaths = _args[3] || [];
    path = (model._path || []).concat(_args[0] || []);
    if (progressive && thisPaths && thisPaths.length) {
        var get = getJSON(model, thisPaths, data, progressive)
        hasValue =  get.hasValue;
        thisPaths =  get.relative;
    }
    return {
        args: null,
        data: data,
        hasValue: hasValue,
        relative: thisPaths,
        missing: [thisPaths],
        fragments: [
            path, args, suffixes, thisPaths
        ]
    };
}

function jsonGraph(model, _args, data, progressive) {
    if (!_args) {
        return {};
    }
    var hasValue = false;
    args = _args[1] || [];
    suffixes = _args[2] || [];
    thisPaths = _args[3] || [];
    path = (model._path || []).concat(_args[0] || []);
    if (progressive && thisPaths && thisPaths.length) {
        var get = getJSONGraph({
            _root: model._root,
            _boxed: model._boxed,
            _materialized: model._materialized,
            _treatErrorsAsValues: model._treatErrorsAsValues
        }, thisPaths, data)
        hasValue = get.hasValue;
        thisPaths = get.requested;
    }
    return {
        args: null,
        data: data,
        hasValue: hasValue,
        relative: thisPaths,
        missing: [thisPaths],
        fragments: [
            path, args, suffixes, thisPaths
        ]
    };
}
