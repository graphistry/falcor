'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _setPrototypeOf = require('babel-runtime/core-js/object/set-prototype-of');

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = container;

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

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

var _Subject = require('rxjs/Subject');

require('rxjs/add/operator/map');

require('rxjs/add/operator/switchMap');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultMapFragmentToProps = function defaultMapFragmentToProps(data) {
    return data;
};
var defaultMapDispatchToProps = function defaultMapDispatchToProps(dispatch, props, falcor) {
    return {};
};
var defaultMergeProps = function defaultMergeProps(stateProps, dispatchProps, parentProps) {
    return _extends({}, parentProps, stateProps, dispatchProps);
};

function container(fragmentDesc) {

    (0, _invariant2.default)(fragmentDesc && (typeof fragmentDesc === 'function' || (typeof fragmentDesc === 'undefined' ? 'undefined' : _typeof(fragmentDesc)) === 'object' && typeof fragmentDesc.fragment === 'function'), 'Attempted to create a Falcor container component without a fragment.\nFalcor containers must be created with either a fragment function or an Object with a fragment function.');

    var renderLoading = void 0,
        fragment = void 0,
        mapFragment = void 0,
        mapDispatch = void 0,
        mapFragmentAndProps = void 0;

    if ((typeof fragmentDesc === 'undefined' ? 'undefined' : _typeof(fragmentDesc)) === 'object') {
        fragment = fragmentDesc.fragment;
        mapFragment = fragmentDesc.mapFragment;
        renderLoading = fragmentDesc.renderLoading;
        mapFragmentAndProps = fragmentDesc.mapFragmentAndProps;
        mapDispatch = fragmentDesc.mapDispatch || fragmentDesc.dispatchers;
    } else {
        fragment = fragmentDesc;
        mapFragment = arguments.length <= 1 ? undefined : arguments[1];
        mapDispatch = arguments.length <= 2 ? undefined : arguments[2];
        mapFragmentAndProps = arguments.length <= 3 ? undefined : arguments[3];
    }

    mapFragment = mapFragment || defaultMapFragmentToProps;
    mapDispatch = mapDispatch || defaultMapDispatchToProps;
    mapFragmentAndProps = mapFragmentAndProps || defaultMergeProps;

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
        }(FalcorContainer), _class.fragment = fragment, _class.fragments = fragments, _class.Component = BaseComponent, _class.mapFragment = mapFragment, _class.mapDispatch = mapDispatch, _class.renderLoading = renderLoading, _class.mapFragmentAndProps = mapFragmentAndProps, _class.displayName = (0, _wrapDisplayName2.default)(BaseComponent, 'Container'), _temp;
    });
}

var fragments = function fragments() {
    var _this2 = this;

    var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    if (!items || (typeof items === 'undefined' ? 'undefined' : _typeof(items)) !== 'object') {
        return '{ length }';
    } else if (!items.hasOwnProperty('length')) {
        items = (0, _keys2.default)(items).map(function (key) {
            return items[key];
        });
    }
    return '{ length ' + (0, _from2.default)(items, function (xs, i) {
        return xs;
    }).reduce(function (xs, x, i) {
        return xs + ', ' + i + ': ' + _this2.fragment(x);
    }, '') + '}';
};

function derefEachPropUpdate(update) {
    update.falcor = update.falcor.deref(update.data = (0, _mapToFalcorJSON2.default)(update.data));
    return update;
}

function fetchEachPropUpdate(_ref) {
    var self = _ref.self;
    var data = _ref.data;
    var props = _ref.props;
    var falcor = _ref.falcor;
    var fragment = self.fragment;
    var renderLoading = self.renderLoading;

    return (0, _fetchDataUntilSettled2.default)({ data: data, props: props, falcor: falcor, fragment: fragment });
    // .let((source) => renderLoading ? source : source.takeLast(1));
}

function mergeEachPropUpdate(_ref2, _ref3) {
    var props = _ref2.props;
    var falcor = _ref2.falcor;
    var dispatch = _ref2.dispatch;
    var data = _ref3.data;
    var error = _ref3.error;
    var version = _ref3.version;
    var loading = _ref3.loading;

    return _extends({}, props, { falcor: falcor,
        dispatch: dispatch, version: version,
        data: data, error: error, loading: loading,
        hash: data && data.$__hash
    });
}

var contextTypes = {
    falcor: _react.PropTypes.object,
    dispatch: _react.PropTypes.func
};

var FalcorContainer = function (_React$Component) {
    _inherits(FalcorContainer, _React$Component);

    function FalcorContainer(props, context) {
        _classCallCheck(this, FalcorContainer);

        var _this3 = _possibleConstructorReturn(this, (FalcorContainer.__proto__ || (0, _getPrototypeOf2.default)(FalcorContainer)).call(this, props, context));

        var data = props.data;
        var falcor = context.falcor;
        var dispatch = context.dispatch;
        var _this3$constructor = _this3.constructor;
        var fragment = _this3$constructor.fragment;
        var Component = _this3$constructor.Component;
        var mapFragment = _this3$constructor.mapFragment;
        var mapDispatch = _this3$constructor.mapDispatch;
        var renderLoading = _this3$constructor.renderLoading;
        var mapFragmentAndProps = _this3$constructor.mapFragmentAndProps;


        _this3.fragment = fragment;
        _this3.Component = Component;
        _this3.mapDispatch = mapDispatch;
        _this3.mapFragment = mapFragment;
        _this3.renderLoading = renderLoading;
        _this3.mapFragmentAndProps = mapFragmentAndProps;

        falcor = falcor.deref(data = (0, _mapToFalcorJSON2.default)(data));

        _this3.state = _extends({}, props, {
            hash: data.$__hash,
            data: data, falcor: falcor, dispatch: dispatch,
            version: falcor.getVersion()
        });

        _this3.propsStream = new _Subject.Subject();
        _this3.propsAction = _this3.propsStream.map(derefEachPropUpdate).switchMap(fetchEachPropUpdate, mergeEachPropUpdate);
        return _this3;
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
            this.propsStream.next({
                self: this,
                props: nextProps,
                data: nextProps.data,
                falcor: nextContext.falcor,
                dispatch: nextContext.dispatch
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _this4 = this;

            // Subscribe to child prop changes so we know when to re-render
            this.propsSubscription = this.propsAction.subscribe(function (nextState) {
                _this4.setState(nextState);
            });
            this.propsStream.next({
                self: this,
                props: this.props,
                data: this.props.data,
                falcor: this.context.falcor,
                dispatch: this.context.dispatch
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            // Clean-up subscription before un-mounting
            this.propsSubscription.unsubscribe();
            this.propsSubscription = undefined;
            this.fragment = null;
            this.Component = null;
            this.mapDispatch = null;
            this.mapFragment = null;
            this.renderLoading = null;
            this.mergeFragmentAndProps = null;
        }
    }, {
        key: 'render',
        value: function render() {
            var Component = this.Component;
            var renderLoading = this.renderLoading;
            var mapFragmentAndProps = this.mapFragmentAndProps;
            var mapFragment = this.mapFragment;
            var mapDispatch = this.mapDispatch;


            if (!Component) {
                return null;
            }

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

            if (loading && renderLoading) {
                mappedFragment.loading = loading;
            }

            var mappedDispatch = mapDispatch(dispatch, mappedFragment, falcor);
            var allMergedProps = mapFragmentAndProps(mappedFragment, mappedDispatch, rest);

            return _react2.default.createElement(Component, allMergedProps);
        }
    }]);

    return FalcorContainer;
}(_react2.default.Component);

FalcorContainer.contextTypes = contextTypes;
FalcorContainer.childContextTypes = contextTypes;
//# sourceMappingURL=container.js.map