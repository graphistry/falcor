'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _defineProperty2 = require('babel-runtime/core-js/object/define-property');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = set;

var _Observable = require('rxjs/Observable');

require('rxjs/add/observable/of');

require('rxjs/add/observable/from');

require('rxjs/add/observable/defer');

require('rxjs/add/observable/empty');

var _extractPathTemplateFromRoute = require('./extractPathTemplateFromRoute');

var _extractPathTemplateFromRoute2 = _interopRequireDefault(_extractPathTemplateFromRoute);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { (0, _defineProperty3.default)(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var isArray = Array.isArray;
var slice = Array.prototype.slice;

function set(route, displayName) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var mapValue = arguments[3];


    if (typeof options === 'function') {
        options = { service: options };
    }

    if (!options.mapValue && 'function' === typeof mapValue) {
        options.mapValue = mapValue;
    }

    var service = options.service || defaultService;
    var getInitialState = options.getInitialState || defaultGetInitialState;
    var pathTemplate = (0, _extractPathTemplateFromRoute2.default)(route, options);

    return function setHandler(incomingJSON) {

        var context = getListIds(_extends({}, getInitialState(this)), pathTemplate, 0, incomingJSON);

        var values = _Observable.Observable.defer(function () {
            return service(context);
        }).mergeMap(expandAndMapValues(incomingJSON, pathTemplate, options));

        return values;
    };
}

function getListIds(context, pathTemplate, depth, json) {

    if (!json || json.$type || depth === pathTemplate.length || 'object' !== (typeof json === 'undefined' ? 'undefined' : _typeof(json))) {
        return context;
    } else {

        var keyIdx = -1;
        var x = pathTemplate[depth];
        var node = json[x.list];
        var keys = context[x.ids] || (context[x.ids] = []);

        for (var key in node) {
            getListIds(context, pathTemplate, depth + 1, node[keys[++keyIdx] = key]);
        }
    }

    return context;
}

function expandAndMapValues(incomingJSON, pathTemplate) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var _options$valueKeys = options.valueKeys,
        valueKeys = _options$valueKeys === undefined ? {} : _options$valueKeys;


    return function innerExpandValues(context) {

        var path = [];

        var json = incomingJSON,
            pathId = -1,
            value = void 0,
            index = -1,
            count = pathTemplate.length;

        while (++index < count) {
            var x = pathTemplate[index];
            value = context[x.name];
            json = json[path[x.listIndex] = x.list];
            json = json[path[pathId = x.idsIndex] = value.id];
        }

        return _Observable.Observable.from(expandValues(json, pathId + 1, { path: path }, valueKeys)).mergeMap(mapEachValue(context, pathTemplate, options));
    };
}

function expandValues(json, index, expansionState) {
    var valueKeys = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


    if (!json || 'object' !== (typeof json === 'undefined' ? 'undefined' : _typeof(json)) || json.$type) {
        return [expansionState];
    }

    var length = index + 1;
    var path = expansionState.path;


    return mergeMapArray((0, _keys2.default)(json), function (key) {
        var _extends2;

        var nextExpansionState = {
            value: json[key],
            path: _extends({}, path, (_extends2 = {}, _defineProperty(_extends2, index, key), _defineProperty(_extends2, 'length', length), _extends2))
        };
        if (valueKeys.hasOwnProperty(key)) {
            return [nextExpansionState];
        }
        return expandValues(json[key], length, nextExpansionState, valueKeys);
    });
}

function mapEachValue(context, pathTemplate, options) {

    var mapValue = options.mapValue || defaultValueMapper;
    var _options$unboxRefs = options.unboxRefs,
        unboxRefs = _options$unboxRefs === undefined ? false : _options$unboxRefs,
        _options$unboxAtoms = options.unboxAtoms,
        unboxAtoms = _options$unboxAtoms === undefined ? true : _options$unboxAtoms,
        _options$unboxErrors = options.unboxErrors,
        unboxErrors = _options$unboxErrors === undefined ? true : _options$unboxErrors;

    var unboxTypes = { ref: unboxRefs, atom: unboxAtoms, error: unboxErrors };

    return function innerMapJSONValues(_ref) {
        var path = _ref.path,
            value = _ref.value;


        path = slice.call(path);

        var _pathTemplate = pathTemplate[pathTemplate.length - 1],
            index = _pathTemplate.idsIndex,
            name = _pathTemplate.name;


        var valueIndex = path.length - 1;
        var key = void 0,
            node = context[name] || context;

        do {
            key = path[++index];
            if (index < valueIndex) {
                node = node[key] || (node[key] = {});
                continue;
            }
            break;
        } while (true);

        if (!(!value || 'object' !== (typeof value === 'undefined' ? 'undefined' : _typeof(value)))) {
            value = unboxTypes[value.$type] ? value.value : value;
        }

        value = mapValue(node, key, value, path, context);

        if (!value || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object') {
            value = [{ path: path, value: value }];
        } else if (!isArray(value) && 'function' !== typeof value.subscribe) {
            if (!value.path) {
                value = { path: path, value: value };
            }
            value = [value];
        }
        return value;
    };
}

function mergeMapArray(xs, fn) {
    var ix = -1;
    var list = [];
    var length = xs.length;

    while (++ix < length) {
        list.push.apply(list, fn(xs[ix]));
    }
    return list;
}

function defaultGetInitialState(routerInstance) {
    var _routerInstance$reque = routerInstance.request,
        request = _routerInstance$reque === undefined ? {} : _routerInstance$reque;
    var _request$query = request.query,
        query = _request$query === undefined ? {} : _request$query;

    return query;
}

function defaultValueMapper(node, key, value, path, context) {
    return _Observable.Observable.of({ path: path, value: node[key] = value });
}

function defaultService(requestedIds) {
    return _Observable.Observable.empty();
}
//# sourceMappingURL=set.js.map