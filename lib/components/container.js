'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj; };

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _compose = require('recompose/compose');

var _compose2 = _interopRequireDefault(_compose);

var _toClass = require('recompose/toClass');

var _toClass2 = _interopRequireDefault(_toClass);

var _mapProps = require('recompose/mapProps');

var _mapProps2 = _interopRequireDefault(_mapProps);

var _lifecycle = require('recompose/lifecycle');

var _lifecycle2 = _interopRequireDefault(_lifecycle);

var _setStatic = require('recompose/setStatic');

var _setStatic2 = _interopRequireDefault(_setStatic);

var _withProps = require('recompose/withProps');

var _withProps2 = _interopRequireDefault(_withProps);

var _getContext = require('recompose/getContext');

var _getContext2 = _interopRequireDefault(_getContext);

var _withContext = require('recompose/withContext');

var _withContext2 = _interopRequireDefault(_withContext);

var _shallowEqual = require('recompose/shallowEqual');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _shouldUpdate = require('recompose/shouldUpdate');

var _shouldUpdate2 = _interopRequireDefault(_shouldUpdate);

var _mapPropsStream = require('recompose/mapPropsStream');

var _mapPropsStream2 = _interopRequireDefault(_mapPropsStream);

var _setDisplayName = require('recompose/setDisplayName');

var _setDisplayName2 = _interopRequireDefault(_setDisplayName);

var _wrapDisplayName = require('recompose/wrapDisplayName');

var _wrapDisplayName2 = _interopRequireDefault(_wrapDisplayName);

var _mapToFalcorJSON = require('../utils/mapToFalcorJSON');

var _mapToFalcorJSON2 = _interopRequireDefault(_mapToFalcorJSON);

var _bindActionCreators = require('../utils/bindActionCreators');

var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

var _mergeIntoFalcorJSON = require('../utils/mergeIntoFalcorJSON');

var _mergeIntoFalcorJSON2 = _interopRequireDefault(_mergeIntoFalcorJSON);

var _setObservableConfig = require('recompose/setObservableConfig');

var _setObservableConfig2 = _interopRequireDefault(_setObservableConfig);

var _invalidateFalcorJSON = require('../utils/invalidateFalcorJSON');

var _invalidateFalcorJSON2 = _interopRequireDefault(_invalidateFalcorJSON);

var _rxjsObservableConfig = require('recompose/rxjsObservableConfig');

var _rxjsObservableConfig2 = _interopRequireDefault(_rxjsObservableConfig);

var _falcorQuerySyntax = require('@graphistry/falcor-query-syntax');

var _falcorQuerySyntax2 = _interopRequireDefault(_falcorQuerySyntax);

var _rxjs = require('rxjs');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var contextTypes = {
    falcor: _react.PropTypes.object,
    version: _react.PropTypes.number,
    dispatch: _react.PropTypes.func
};

var containerBase = (0, _compose2.default)((0, _getContext2.default)(contextTypes), (0, _shouldUpdate2.default)(function (props, nextProps) {
    var thisVersion = props.version;
    var nextVersion = nextProps.version;

    if (thisVersion !== nextVersion) {
        return true;
    }
    var thisJSON = props.data;
    var nextJSON = nextProps.data;

    if (!thisJSON || !nextJSON || thisJSON.$__hash !== nextJSON.$__hash) {
        return true;
    }
    return !(0, _shallowEqual2.default)(props, nextProps);
}), (0, _mapPropsStream2.default)(function (props) {
    return props.map(function (_ref) {
        var data = _ref.data;
        var falcor = _ref.falcor;

        var rest = _objectWithoutProperties(_ref, ['data', 'falcor']);

        data = (0, _invalidateFalcorJSON2.default)((0, _mapToFalcorJSON2.default)(data, falcor));
        return _extends({}, rest, { data: data,
            falcor: data && data.$__path && data.$__path.length && falcor.deref(data) || falcor
        });
    }).switchMap(function (_ref2) {
        var data = _ref2.data;
        var falcor = _ref2.falcor;
        var version = _ref2.version;
        var getFragment = _ref2.getFragment;

        var rest = _objectWithoutProperties(_ref2, ['data', 'falcor', 'version', 'getFragment']);

        return _rxjs.Observable.of({
            prev: null, settled: false,
            data: data, falcor: falcor, getFragment: getFragment, rest: rest
        }).expand(loadContainerDataUntilSettled).takeLast(1);
    }, function (_ref3, _ref4) {
        var data = _ref3.data;
        var falcor = _ref3.falcor;
        var version = _ref3.version;
        var getFragment = _ref3.getFragment;

        var rest = _objectWithoutProperties(_ref3, ['data', 'falcor', 'version', 'getFragment']);

        var d2 = _ref4.data;
        var error = _ref4.error;
        return _extends({
            falcor: falcor }, rest, { data: d2, error: error
        });
    });
}), (0, _withContext2.default)(contextTypes, function (_ref5) {
    var data = _ref5.data;
    var falcor = _ref5.falcor;
    return {
        falcor: falcor, version: data && data.$__version || falcor.getVersion()
    };
}));

function loadContainerDataUntilSettled(state) {
    if (state.settled === true) {
        return _rxjs.Observable.empty();
    }
    var data = state.data;
    var rest = state.rest;
    var prev = state.prev;
    var falcor = state.falcor;
    var getFragment = state.getFragment;

    var query = getFragment(data, rest);
    if (query !== prev) {
        return falcor.get.apply(falcor, _toConsumableArray(_falcorQuerySyntax2.default.call(null, query))).map(function (_ref6) {
            var json = _ref6.json;
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

var defaultMapFragmentToProps = function defaultMapFragmentToProps(data) {
    return data;
};
var defaultMapDispatchToProps = function defaultMapDispatchToProps(dispatch, props, falcor) {
    return {};
};
var defaultMergeProps = function defaultMergeProps(stateProps, dispatchProps, parentProps) {
    return _extends({}, parentProps, stateProps, dispatchProps);
};

var container = function container(getFragment) {
    var mapFragment = arguments.length <= 1 || arguments[1] === undefined ? defaultMapFragmentToProps : arguments[1];
    var mapDispatch = arguments.length <= 2 || arguments[2] === undefined ? defaultMapDispatchToProps : arguments[2];
    var mergeFragmentAndProps = arguments.length <= 3 || arguments[3] === undefined ? defaultMergeProps : arguments[3];

    if (typeof mapDispatch !== 'function') {
        if (mapDispatch && (typeof mapDispatch === 'undefined' ? 'undefined' : _typeof(mapDispatch)) !== 'object') {
            mapDispatch = defaultMapDispatchToProps;
        } else {
            mapDispatch = function (actionCreators) {
                return function (dispatch, mappedFragment, falcor) {
                    return (0, _bindActionCreators2.default)(actionCreators, dispatch, falcor);
                };
            }(mapDispatch);
        }
    }
    return function (BaseComponent) {
        return (0, _compose2.default)((0, _setStatic2.default)('fragment', getFragment), (0, _setDisplayName2.default)((0, _wrapDisplayName2.default)(BaseComponent, 'Container')), _toClass2.default, (0, _withProps2.default)({ getFragment: getFragment }), containerBase, (0, _mapProps2.default)(function (_ref7) {
            var data = _ref7.data;
            var error = _ref7.error;
            var falcor = _ref7.falcor;
            var version = _ref7.version;
            var loading = _ref7.loading;
            var dispatch = _ref7.dispatch;
            var getFragment = _ref7.getFragment;

            var rest = _objectWithoutProperties(_ref7, ['data', 'error', 'falcor', 'version', 'loading', 'dispatch', 'getFragment']);

            var mappedFragment = mapFragment(data, _extends({ error: error }, rest));
            var mappedDispatch = mapDispatch(dispatch, mappedFragment, falcor);
            var allMergedProps = mergeFragmentAndProps(mappedFragment, mappedDispatch, rest);
            return allMergedProps;
        }))(BaseComponent);
    };
};

exports.default = container;
//# sourceMappingURL=container.js.map