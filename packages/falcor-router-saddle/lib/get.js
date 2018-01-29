'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

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

exports.get = get;

var _Observable = require('rxjs/Observable');

require('rxjs/add/operator/map');

require('rxjs/add/operator/mergeMap');

require('rxjs/add/observable/defer');

require('rxjs/add/observable/empty');

function _defineProperty(obj, key, value) { if (key in obj) { (0, _defineProperty3.default)(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var typeofNumber = 'number';
var typeofObject = 'object';
var isArray = Array.isArray;
var slice = Array.prototype.slice;

function defaultPropsResolver(routerInstance) {
    var _routerInstance$reque = routerInstance.request,
        request = _routerInstance$reque === undefined ? {} : _routerInstance$reque;
    var _request$query = request.query,
        query = _request$query === undefined ? {} : _request$query;

    return query;
}

function defaultLoader(requestedIds) {
    return _Observable.Observable.empty();
}

function get() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


    var lists = options.lists || [];
    var loader = options.loader || defaultLoader;
    var getInitialProps = options.getInitialProps || defaultPropsResolver;

    return function getHandler(requestedPathSet) {

        var context = _extends({}, getInitialProps(this));

        var listName = void 0,
            index = -1,
            count = lists.length;

        while (++index < count) {
            listName = lists[index];
            context[listName + 'Ids'] = [].concat(requestedPathSet[1 + index * 2]);
        }

        var suffix = slice.call(requestedPathSet, count * 2);
        var loaded = suffix.reduce(function (source, keys, index) {
            return source.mergeMap(function (_ref) {
                var context = _ref.context,
                    rest = _ref.rest;
                return keysetToKeysList(keys);
            }, function (_ref2, key) {
                var _extends2;

                var context = _ref2.context,
                    rest = _ref2.rest;
                return {
                    context: context, rest: _extends({}, rest, (_extends2 = {}, _defineProperty(_extends2, index, key), _defineProperty(_extends2, 'length', index + 1), _extends2))
                };
            });
        }, _Observable.Observable.defer(function () {
            return loader(context, suffix);
        }).map(function (context) {
            return { context: context, rest: { length: 0 } };
        }));

        return loaded.mergeMap(expandValues(lists));
    };
}

function expandValues(lists) {

    return function innerExpandValues(_ref3) {
        var context = _ref3.context,
            rest = _ref3.rest;


        context = context || {};

        var vals = [],
            path = [];
        var key = void 0,
            pathId = -1,
            valsId = -1,
            index = -1,
            count = lists.length,
            value = context[lists[count - 1]] || context;

        while (++index < count) {
            key = lists[index];
            path[++pathId] = key + 'sById';
            path[++pathId] = context[key].id;
        }

        index = 0;
        count = rest.length;

        do {
            if (index === count) {
                vals[++valsId] = { value: value, path: path };
                break;
            } else if (value === undefined) {
                break;
            } else if (!value || typeofObject !== (typeof value === 'undefined' ? 'undefined' : _typeof(value)) || value.$type) {
                vals[++valsId] = { value: value, path: path };
                break;
            }
            key = rest[index];
            value = value[key];
            path[++pathId] = key;
        } while (++index <= count);

        return vals;
    };
}

function keysetToKeysList(keys) {
    if (!keys || typeofObject !== (typeof keys === 'undefined' ? 'undefined' : _typeof(keys))) {
        return [keys];
    } else if (isArray(keys)) {
        return keys;
    }
    var rangeEnd = keys.to;
    var rangeStart = keys.from || 0;
    if (typeofNumber !== (typeof rangeEnd === 'undefined' ? 'undefined' : _typeof(rangeEnd))) {
        rangeEnd = rangeStart + (keys.length || 0) - 1;
    }
    return (0, _from2.default)({ length: rangeEnd - rangeStart }, function (x, index) {
        return index + rangeStart;
    });
}
//# sourceMappingURL=get.js.map