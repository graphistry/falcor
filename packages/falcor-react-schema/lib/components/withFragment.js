'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _setPrototypeOf = require('babel-runtime/core-js/object/set-prototype-of');

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

exports.default = withFragment;

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _hoistStatics = require('recompose/hoistStatics');

var _hoistStatics2 = _interopRequireDefault(_hoistStatics);

var _shallowEqual = require('recompose/shallowEqual');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _wrapDisplayName = require('recompose/wrapDisplayName');

var _wrapDisplayName2 = _interopRequireDefault(_wrapDisplayName);

var _fetchDataUntilSettled = require('../fetchDataUntilSettled');

var _fetchDataUntilSettled2 = _interopRequireDefault(_fetchDataUntilSettled);

require('rxjs/add/operator/map');

require('rxjs/add/observable/of');

require('rxjs/add/operator/switchMap');

var _Subject = require('rxjs/Subject');

var _Observable = require('rxjs/Observable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass; }

var contextTypes = {
    'falcor-data': _react.PropTypes.object,
    'falcor-model': _react.PropTypes.object,
    'falcor-render-loading': _react.PropTypes.bool
};

function withFragment(fragmentDesc) {

    (0, _invariant2.default)(fragmentDesc && ('function' === typeof fragmentDesc || 'object' === (typeof fragmentDesc === 'undefined' ? 'undefined' : _typeof(fragmentDesc)) && 'function' === typeof fragmentDesc.fragment), 'Attempted to create a Fragment container component without a fragment definition.\nFragment containers must be created with a fragment function, or an Object with a "fragment" function.');

    if ('object' !== (typeof fragmentDesc === 'undefined' ? 'undefined' : _typeof(fragmentDesc))) {
        fragmentDesc = {
            fragment: fragmentDesc,
            mergeProps: (arguments.length <= 2 ? undefined : arguments[2]) || defaultMergeProps,
            mapFragment: (arguments.length <= 1 ? undefined : arguments[1]) || defaultMapFragment
        };
    } else {
        if (!fragmentDesc.mergeProps) {
            fragmentDesc.mergeProps = defaultMergeProps;
        }
        if (!fragmentDesc.mapFragment) {
            fragmentDesc.mapFragment = defaultMapFragment;
        }
    }

    return (0, _hoistStatics2.default)(function (Component) {
        var Container = function (_FragmentContainer) {
            _inherits(Container, _FragmentContainer);

            function Container() {
                _classCallCheck(this, Container);

                return _possibleConstructorReturn(this, (Container.__proto__ || (0, _getPrototypeOf2.default)(Container)).apply(this, arguments));
            }

            return Container;
        }(FragmentContainer);

        Container.config = fragmentDesc;
        Container.Component = Component;
        Container.fragment = fragmentDesc.fragment;
        Container.displayName = (0, _wrapDisplayName2.default)(Component, 'Fragment');

        return Container;
    });
}

var FragmentContainer = function (_React$Component) {
    _inherits(FragmentContainer, _React$Component);

    function FragmentContainer(props, context) {
        _classCallCheck(this, FragmentContainer);

        var _this2 = _possibleConstructorReturn(this, (FragmentContainer.__proto__ || (0, _getPrototypeOf2.default)(FragmentContainer)).call(this, props, context));

        var _this2$constructor = _this2.constructor,
            config = _this2$constructor.config,
            fragment = _this2$constructor.fragment,
            Component = _this2$constructor.Component;


        _this2.config = config;
        _this2.fragment = fragment;
        _this2.Component = Component;
        _this2.state = { hash: '', version: 0 };
        _this2.propsStream = new _Subject.Subject();
        _this2.propsAction = _this2.propsStream.switchMap(fetchEachPropUpdate, mergeEachPropUpdate);
        return _this2;
    }

    _createClass(FragmentContainer, [{
        key: 'getChildContext',
        value: function getChildContext() {
            var _state = this.state,
                data = _state.data,
                model = _state.model;

            return {
                'falcor-data': data, 'falcor-model': model,
                'falcor-render-loading': this.shouldRenderLoading()
            };
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _this3 = this;

            // Subscribe to child prop changes so we know when to re-render
            this.propsSubscription = this.propsAction.subscribe(function (nextState) {
                _this3.setState(nextState);
            });
            this.checkCacheAndUpdate(this.props, this.context);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps, nextContext) {
            this.checkCacheAndUpdate(nextProps, nextContext);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            // Clean-up subscription before un-mounting
            this.propsSubscription.unsubscribe();
            this.propsSubscription = undefined;
            this.config = null;
            this.fragment = null;
            this.Component = null;
        }
    }, {
        key: 'shouldRenderLoading',
        value: function shouldRenderLoading() {
            var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;
            var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.context;

            if (props.hasOwnProperty('renderLoading')) {
                return props.renderLoading;
            } else if (this.config.hasOwnProperty('renderLoading')) {
                return this.config.renderLoading;
            }
            return context['falcor-render-loading'] || false;
        }
    }, {
        key: 'checkCacheAndUpdate',
        value: function checkCacheAndUpdate(props, context) {
            var fragment = this.fragment;

            // if (props.hasOwnProperty('falcor-data') || props.hasOwnProperty('falcor-model')) {

            this.propsStream.next({
                props: props, fragment: fragment, loading: false,
                data: props['falcor-data'] || context['falcor-data'],
                model: props['falcor-model'] || context['falcor-model'],
                renderLoading: this.shouldRenderLoading(props, context)
            });
            // }
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState, nextContext) {
            var _props = this.props,
                currProps = _props === undefined ? {} : _props,
                _state2 = this.state,
                currState = _state2 === undefined ? {} : _state2;


            if (currState.loading !== nextState.loading && (this.shouldRenderLoading(this.props, this.context) || this.shouldRenderLoading(nextProps, nextContext))) {
                return true;
            } else if (currState.version !== nextState.version) {
                return true;
            } else if (currState.error !== nextState.error) {
                return true;
            } else if (currState.hash !== nextState.hash) {
                return true;
            }

            var currData = currProps['falcor-data'];
            var nextData = nextProps['falcor-data'];

            var _currProps$style = currProps.style,
                currStyle = _currProps$style === undefined ? {} : _currProps$style,
                restCurrProps = _objectWithoutProperties(currProps, ['style']);

            var _nextProps$style = nextProps.style,
                nextStyle = _nextProps$style === undefined ? currStyle : _nextProps$style,
                restNextProps = _objectWithoutProperties(nextProps, ['style']);

            if (!(0, _shallowEqual2.default)(currData, nextData)) {
                return true;
            } else if (!(0, _shallowEqual2.default)(currStyle, nextStyle)) {
                return true;
            } else if (!(0, _shallowEqual2.default)(restCurrProps, restNextProps)) {
                return true;
            }

            return false;
        }
    }, {
        key: 'render',
        value: function render() {
            var props = this.props,
                state = this.state,
                config = this.config,
                Component = this.Component;


            if (!Component) {
                return null;
            }

            var data = state.data,
                error = state.error,
                loading = state.loading;
            var mergeProps = config.mergeProps,
                mapFragment = config.mapFragment;

            var mappedFragment = data ? mapFragment(data, props) : {};
            var mergedProps = mergeProps(mappedFragment, props);

            if (error) {
                mergedProps.error = error;
            }

            if (loading && this.shouldRenderLoading(props) === true) {
                mergedProps.loading = loading;
            }

            return _react2.default.createElement(Component, mergedProps);
        }
    }]);

    return FragmentContainer;
}(_react2.default.Component);

FragmentContainer.fragments = fragments;
FragmentContainer.load = fetchEachPropUpdate;
FragmentContainer.contextTypes = contextTypes;
FragmentContainer.childContextTypes = contextTypes;


function fragments() {
    var _this4 = this;

    var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    if (!items || 'object' !== (typeof items === 'undefined' ? 'undefined' : _typeof(items)) || !items.hasOwnProperty('length')) {
        return '{ length }';
    }
    return '{ length ' + (0, _from2.default)(items, function (x, i) {
        return x;
    }).reduce(function (xs, x, i) {
        return xs + ', ' + i + ': ' + _this4.fragment(x);
    }, '') + '}';
}

function tryDeref(_ref) {
    var data = _ref.data,
        model = _ref.model;

    return !data || !model ? model : model.deref(data);
}

function fetchEachPropUpdate(update) {
    if (!(update.model = tryDeref(update))) {
        return _Observable.Observable.of(update);
    } else if (update.renderLoading === true) {
        return (0, _fetchDataUntilSettled2.default)(update);
    }
    return (0, _fetchDataUntilSettled2.default)(update).takeLast(1);
}

function mergeEachPropUpdate(_ref2, _ref3) {
    var props = _ref2.props,
        model = _ref2.model;
    var data = _ref3.data,
        error = _ref3.error,
        version = _ref3.version,
        loading = _ref3.loading;

    return {
        data: data, error: error, props: props,
        model: model, loading: loading, version: version,
        hash: data && data.$__hash
    };
}

function defaultMapFragment(fragmentProps) {
    return fragmentProps;
}

function defaultMergeProps(fragmentProps, componentProps) {
    return _extends({}, componentProps, fragmentProps);
}
//# sourceMappingURL=withFragment.js.map