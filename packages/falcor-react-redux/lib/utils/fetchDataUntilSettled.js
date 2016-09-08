'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = fetchDataUntilSettled;

var _rxjs = require('rxjs');

var _memoizeQueryies = require('./memoizeQueryies');

var _memoizeQueryies2 = _interopRequireDefault(_memoizeQueryies);

var _mergeIntoFalcorJSON = require('./mergeIntoFalcorJSON');

var _mergeIntoFalcorJSON2 = _interopRequireDefault(_mergeIntoFalcorJSON);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var memoizedQuerySyntax = (0, _memoizeQueryies2.default)(100);

function fetchDataUntilSettled(_ref) {
    var data = _ref.data;
    var falcor = _ref.falcor;
    var fragment = _ref.fragment;

    var props = _objectWithoutProperties(_ref, ['data', 'falcor', 'fragment']);

    return _rxjs.Observable.of({
        prev: null, settled: false,
        data: data, falcor: falcor, fragment: fragment, props: props
    }).expand(_fetchDataUntilSettled).takeLast(1);
}

function _fetchDataUntilSettled(state) {
    if (state.settled === true) {
        return _rxjs.Observable.empty();
    }
    var data = state.data;
    var props = state.props;
    var prev = state.prev;
    var falcor = state.falcor;
    var fragment = state.fragment;

    var query = fragment(data, props);
    if (query !== prev) {
        return _rxjs.Observable.from(falcor.get.apply(falcor, _toConsumableArray(memoizedQuerySyntax(query)))).map(function (_ref2) {
            var json = _ref2.json;
            return (0, _assign2.default)(state, {
                prev: query, data: (0, _mergeIntoFalcorJSON2.default)(data, json)
            });
        }).catch(function (error) {
            return _rxjs.Observable.of((0, _assign2.default)(state, {
                error: error, settled: true
            }));
        });
    }
    return _rxjs.Observable.empty();
}
//# sourceMappingURL=fetchDataUntilSettled.js.map