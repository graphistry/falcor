'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = fetchDataUntilSettled;

var _rxjs = require('rxjs');

var _memoizeQueryies = require('./memoizeQueryies');

var _memoizeQueryies2 = _interopRequireDefault(_memoizeQueryies);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var memoizedQuerySyntax = (0, _memoizeQueryies2.default)(100);

function fetchDataUntilSettled(_ref) {
    var data = _ref.data;
    var falcor = _ref.falcor;
    var fragment = _ref.fragment;

    var props = _objectWithoutProperties(_ref, ['data', 'falcor', 'fragment']);

    return _rxjs.Observable.of({
        prev: null, settled: false,
        version: falcor.getVersion(),
        data: data, props: props, falcor: falcor, fragment: fragment
    }).expand(_fetchDataUntilSettled).takeLast(1);
}

function _fetchDataUntilSettled(state) {
    if (state.settled === true) {
        return _rxjs.Observable.empty();
    }
    var falcor = state.falcor;
    var fragment = state.fragment;

    var query = fragment(state.data, state.props);
    if (query !== state.prev || state.version !== falcor.getVersion()) {
        return _rxjs.Observable.from(falcor.get(memoizedQuerySyntax(query))).map(function (_ref2) {
            var json = _ref2.json;
            return (0, _assign2.default)(state, {
                prev: query, data: json, version: falcor.getVersion()
            });
        }).catch(function (error) {
            return _rxjs.Observable.of((0, _assign2.default)(state, {
                error: error, settled: true, version: falcor.getVersion()
            }));
        });
    }
    return _rxjs.Observable.empty();
}
//# sourceMappingURL=fetchDataUntilSettled.js.map