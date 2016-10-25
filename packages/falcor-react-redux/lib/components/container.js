'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _setPrototypeOf = require('babel-runtime/core-js/object/set-prototype-of');

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = container;

var _rxjs = require('rxjs');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _hoistStatics = require('recompose/hoistStatics');

var _hoistStatics2 = _interopRequireDefault(_hoistStatics);

var _shallowEqual = require('recompose/shallowEqual');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _mapToFalcorJSON = require('../utils/mapToFalcorJSON');

var _mapToFalcorJSON2 = _interopRequireDefault(_mapToFalcorJSON);

var _wrapDisplayName = require('recompose/wrapDisplayName');

var _wrapDisplayName2 = _interopRequireDefault(_wrapDisplayName);

var _bindActionCreators = require('../utils/bindActionCreators');

var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

var _fetchDataUntilSettled = require('../utils/fetchDataUntilSettled');

var _fetchDataUntilSettled2 = _interopRequireDefault(_fetchDataUntilSettled);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass; }

var contextTypes = {
    falcor: _react.PropTypes.object,
    dispatch: _react.PropTypes.func
};

var FalcorContainer = function (_React$Component) {
    _inherits(FalcorContainer, _React$Component);

    function FalcorContainer(props, context) {
        _classCallCheck(this, FalcorContainer);

        var _this = _possibleConstructorReturn(this, (FalcorContainer.__proto__ || (0, _getPrototypeOf2.default)(FalcorContainer)).call(this, props, context));

        var data = props.data;
        var falcor = context.falcor;
        var dispatch = context.dispatch;
        var _this$constructor = _this.constructor;
        var fragment = _this$constructor.fragment;
        var Component = _this$constructor.Component;
        var mergeFragmentAndProps = _this$constructor.mergeFragmentAndProps;
        var mapFragment = _this$constructor.mapFragment;
        var mapDispatch = _this$constructor.mapDispatch;


        _this.fragment = fragment;
        _this.Component = Component;
        _this.mapDispatch = mapDispatch;
        _this.mapFragment = mapFragment;
        _this.mergeFragmentAndProps = mergeFragmentAndProps;

        data = (0, _mapToFalcorJSON2.default)(data);
        falcor = falcor.deref(data);
        _this.state = _extends({}, props, {
            hash: data.$__hash,
            data: data, falcor: falcor, dispatch: dispatch,
            version: falcor.getVersion()
        });
        _this.propsStream = new _rxjs.Subject();
        _this.propsAction = _this.propsStream.map(function (_ref) {
            var data = _ref.data;
            var falcor = _ref.falcor;

            var rest = _objectWithoutProperties(_ref, ['data', 'falcor']);

            data = (0, _mapToFalcorJSON2.default)(data);
            falcor = falcor.deref(data);
            return _extends({}, rest, { data: data, falcor: falcor, fragment: fragment });
        }).switchMap(_fetchDataUntilSettled2.default, function (_ref2, _ref3) {
            var fragment = _ref2.fragment;

            var props = _objectWithoutProperties(_ref2, ['fragment']);

            var data = _ref3.data;
            var error = _ref3.error;
            var version = _ref3.version;
            return _extends({}, props, {
                hash: data.$__hash,
                version: version, data: data, error: error
            });
        });
        return _this;
    }

    _createClass(FalcorContainer, [{
        key: 'getChildContext',
        value: function getChildContext() {
            var _state = this.state;
            var falcor = _state.falcor;
            var dispatch = _state.dispatch;

            return { falcor: falcor, dispatch: dispatch };
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState, nextContext) {
            var nextJSON = nextProps.data;

            var restNextProps = _objectWithoutProperties(nextProps, ['data']);

            var _state2 = this.state;
            var thisJSON = _state2.data;
            var thisHash = _state2.hash;
            var thisVersion = _state2.version;

            var restState = _objectWithoutProperties(_state2, ['data', 'hash', 'version']);

            return !(thisJSON && nextJSON && thisHash === nextJSON.$__hash && thisVersion === nextJSON.$__version && (0, _shallowEqual2.default)(restState, restNextProps));
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps, nextContext) {
            // Receive new props from the owner
            this.propsStream.next(_extends({}, nextContext, nextProps));
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _this2 = this;

            // Subscribe to child prop changes so we know when to re-render
            this.propsSubscription = this.propsAction.subscribe(function (nextProps) {
                _this2.setState(nextProps);
            });
            this.propsStream.next(_extends({}, this.context, this.props));
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            // Clean-up subscription before un-mounting
            this.propsSubscription.unsubscribe();
            this.fragment = null;
            this.Component = null;
            this.mapDispatch = null;
            this.mapFragment = null;
            this.mergeFragmentAndProps = null;
        }
    }, {
        key: 'render',
        value: function render() {
            var Component = this.Component;
            var mergeFragmentAndProps = this.mergeFragmentAndProps;
            var mapFragment = this.mapFragment;
            var mapDispatch = this.mapDispatch;
            var _state3 = this.state;
            var data = _state3.data;
            var hash = _state3.hash;
            var error = _state3.error;
            var falcor = _state3.falcor;
            var version = _state3.version;
            var loading = _state3.loading;
            var dispatch = _state3.dispatch;
            var fragment = _state3.fragment;

            var rest = _objectWithoutProperties(_state3, ['data', 'hash', 'error', 'falcor', 'version', 'loading', 'dispatch', 'fragment']);

            var mappedFragment = mapFragment(data, _extends({ error: error }, rest));
            var mappedDispatch = mapDispatch(dispatch, mappedFragment, falcor);
            var allMergedProps = mergeFragmentAndProps(mappedFragment, mappedDispatch, rest);

            return _react2.default.createElement(Component, allMergedProps);
        }
    }]);

    return FalcorContainer;
}(_react2.default.Component);

FalcorContainer.contextTypes = contextTypes;
FalcorContainer.childContextTypes = contextTypes;


var defaultMapFragmentToProps = function defaultMapFragmentToProps(data) {
    return data;
};
var defaultMapDispatchToProps = function defaultMapDispatchToProps(dispatch, props, falcor) {
    return {};
};
var defaultMergeProps = function defaultMergeProps(stateProps, dispatchProps, parentProps) {
    return _extends({}, parentProps, stateProps, dispatchProps);
};
var getFragments = function getFragments() {
    var _this3 = this;

    var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    if (!items || !items.hasOwnProperty('length')) {
        return '{ [0]: ' + this.fragment(items) + ' }';
    }
    return '{' + (0, _from2.default)(items, function (xs, i) {
        return xs;
    }).map(function (item, index) {
        return index + ': ' + _this3.fragment(item);
    }).join(',\n') + '}';
};

function container(getFragment) {
    var mapFragment = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultMapFragmentToProps;
    var mapDispatch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultMapDispatchToProps;
    var mergeFragmentAndProps = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : defaultMergeProps;


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

    return (0, _hoistStatics2.default)(function (BaseComponent) {
        var _class, _temp;

        return _temp = _class = function (_FalcorContainer) {
            _inherits(Container, _FalcorContainer);

            function Container() {
                _classCallCheck(this, Container);

                return _possibleConstructorReturn(this, (Container.__proto__ || (0, _getPrototypeOf2.default)(Container)).apply(this, arguments));
            }

            return Container;
        }(FalcorContainer), _class.fragment = getFragment, _class.fragments = getFragments, _class.Component = BaseComponent, _class.mapFragment = mapFragment, _class.mapDispatch = mapDispatch, _class.mergeFragmentAndProps = mergeFragmentAndProps, _class.displayName = (0, _wrapDisplayName2.default)(BaseComponent, 'Container'), _temp;
    });
}
//# sourceMappingURL=container.js.map