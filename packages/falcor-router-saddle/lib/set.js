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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.set = set;

var _Observable = require('rxjs/Observable');

require('rxjs/add/observable/of');

require('rxjs/add/observable/from');

require('rxjs/add/observable/defer');

require('rxjs/add/observable/empty');

function _defineProperty(obj, key, value) { if (key in obj) { (0, _defineProperty3.default)(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var typeofNumber = 'number';
var typeofObject = 'object';
var typeofFunction = 'function';
var isArray = Array.isArray;
var slice = Array.prototype.slice;

function defaultPropsResolver(routerInstance) {
    var _routerInstance$reque = routerInstance.request,
        request = _routerInstance$reque === undefined ? {} : _routerInstance$reque;
    var _request$query = request.query,
        query = _request$query === undefined ? {} : _request$query;

    return query;
}

function defaultValueMapper(node, key, value, path, context) {
    return _Observable.Observable.of({ path: path, value: node[key] = value });
}

function defaultLoader(requestedIds) {
    return _Observable.Observable.empty();
}

function set() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


    var lists = options.lists || [];
    var loader = options.loader || defaultLoader;
    var getInitialProps = options.getInitialProps || defaultPropsResolver;

    return function setHandler(incomingJSON) {

        var context = getListIds(_extends({}, getInitialProps(this)), lists, 0, incomingJSON);

        var values = _Observable.Observable.defer(function () {
            return loader(context);
        }).mergeMap(expandAndMapValues(incomingJSON, options));

        return values;
    };
}

function getListIds(context, lists, depth, json) {

    if (!json || json.$type || depth === lists.length || typeofObject !== (typeof json === 'undefined' ? 'undefined' : _typeof(json))) {
        return context;
    } else {

        var list = lists[depth] + 'Ids';
        var byId = lists[depth] + 'sById';
        var node = json[byId];

        var keyIdx = -1;
        var keys = context[list] || (context[list] = []);

        for (var key in node) {
            getListIds(context, lists, depth + 1, node[keys[++keyIdx] = key]);
        }
    }

    return context;
}

function expandAndMapValues(incomingJSON) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


    var lists = options.lists || [];
    var _options$valueKeys = options.valueKeys,
        valueKeys = _options$valueKeys === undefined ? {} : _options$valueKeys;


    return function innerExpandValues(context) {

        var path = [];

        var json = incomingJSON,
            key = void 0,
            type = void 0,
            index = -1,
            count = lists.length,
            pathLen = 0,
            listId = -1,
            valsId = -1;

        while (++index < count) {
            key = lists[index];
            listId = path[pathLen++] = key + 'sById';
            valsId = path[pathLen++] = context[key].id;
            json = json[listId][valsId];
        }

        return _Observable.Observable.from(expandValues(json, pathLen, { path: path }, valueKeys)).mergeMap(mapEachValue(context, options));
    };
}

function expandValues(json, index, expansionState) {
    var valueKeys = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


    if (!json || typeofObject !== (typeof json === 'undefined' ? 'undefined' : _typeof(json)) || json.$type) {
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

function mapEachValue(context, options) {

    var lists = options.lists || [];
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

        var count = path.length;
        var key = void 0,
            index = lists.length * 2;
        var node = context[lists[lists.length - 1]] || context;

        while (++index < count) {

            key = path[index];

            if (index < count - 1) {
                node = node[key] || (node[key] = {});
                continue;
            }

            if (!(!value || typeofObject !== (typeof value === 'undefined' ? 'undefined' : _typeof(value)))) {
                value = unboxTypes[value.$type] ? value.value : value;
            }

            value = mapValue(node, key, value, path, context);
        }

        if (!value || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== typeofObject) {
            value = [{ path: path, value: value }];
        } else if (!isArray(value) && typeofFunction !== _typeof(value.subscribe)) {
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
//# sourceMappingURL=set.js.map