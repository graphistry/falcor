'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

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

    var renderErrors = false,
        renderLoading = false,
        fragment = void 0,
        mapFragment = void 0,
        mapDispatch = void 0,
        mapFragmentAndProps = void 0;

    if ((typeof fragmentDesc === 'undefined' ? 'undefined' : _typeof(fragmentDesc)) === 'object') {
        fragment = fragmentDesc.fragment;
        mapFragment = fragmentDesc.mapFragment;
        renderErrors = fragmentDesc.renderErrors;
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
                return function (container) {
                    return (0, _keys2.default)(actionCreators).reduce(function (dispatchers, key) {
                        var actionCreator = actionCreators[key];
                        dispatchers[key] = function () {
                            var _container$state = container.state,
                                falcor = _container$state.falcor,
                                dispatch = _container$state.dispatch;

                            return dispatch(_extends({ falcor: falcor }, actionCreator.apply(undefined, arguments)));
                        };
                        return dispatchers;
                    }, {});
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
        }(FalcorContainer), _class.fragment = fragment, _class.fragments = fragments, _class.Component = BaseComponent, _class.mapFragment = mapFragment, _class.mapDispatch = mapDispatch, _class.renderErrors = renderErrors, _class.renderLoading = renderLoading, _class.mapFragmentAndProps = mapFragmentAndProps, _class.displayName = (0, _wrapDisplayName2.default)(BaseComponent, 'Container'), _temp;
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
    var data = update.data,
        falcor = update.falcor;

    update.data = data = (0, _mapToFalcorJSON2.default)(data);
    if (!falcor._seed || !falcor._seed.json || falcor._seed.json !== data) {
        update.falcor = falcor.deref(data);
    }
    return update;
}

function fetchEachPropUpdate(_ref) {
    var container = _ref.container,
        data = _ref.data,
        props = _ref.props,
        falcor = _ref.falcor;
    var fragment = container.fragment,
        renderLoading = container.renderLoading;

    return (0, _fetchDataUntilSettled2.default)({
        data: data, props: props, falcor: falcor, fragment: fragment, renderLoading: renderLoading
    }).let(function (source) {
        return renderLoading === true ? source : source.takeLast(1);
    });
}

function mergeEachPropUpdate(_ref2, _ref3) {
    var props = _ref2.props,
        falcor = _ref2.falcor,
        dispatch = _ref2.dispatch;
    var data = _ref3.data,
        error = _ref3.error,
        version = _ref3.version,
        loading = _ref3.loading;

    return {
        data: data, error: error, loading: loading,
        falcor: falcor, dispatch: dispatch, version: version,
        hash: data && data.$__hash
    };
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
        var falcor = context.falcor,
            dispatch = context.dispatch;
        var _this3$constructor = _this3.constructor,
            fragment = _this3$constructor.fragment,
            Component = _this3$constructor.Component,
            mapFragment = _this3$constructor.mapFragment,
            mapDispatch = _this3$constructor.mapDispatch,
            renderErrors = _this3$constructor.renderErrors,
            renderLoading = _this3$constructor.renderLoading,
            mapFragmentAndProps = _this3$constructor.mapFragmentAndProps;


        _this3.fragment = fragment;
        _this3.Component = Component;
        _this3.mapFragment = mapFragment;
        _this3.renderErrors = renderErrors;
        _this3.renderLoading = renderLoading;
        _this3.dispatchers = mapDispatch(_this3);
        _this3.mapFragmentAndProps = mapFragmentAndProps;

        falcor = falcor.deref(data = (0, _mapToFalcorJSON2.default)(data));

        _this3.state = {
            hash: data.$__hash,
            data: data, falcor: falcor, dispatch: dispatch,
            version: falcor.getVersion()
        };

        _this3.propsStream = new _Subject.Subject();
        _this3.propsAction = _this3.propsStream.map(derefEachPropUpdate).switchMap(fetchEachPropUpdate, mergeEachPropUpdate);
        return _this3;
    }

    _createClass(FalcorContainer, [{
        key: 'getChildContext',
        value: function getChildContext() {
            var _state = this.state,
                falcor = _state.falcor,
                dispatch = _state.dispatch;

            return { falcor: falcor, dispatch: dispatch };
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState, nextContext) {
            var _props = this.props,
                currProps = _props === undefined ? {} : _props,
                _state2 = this.state,
                currState = _state2 === undefined ? {} : _state2;


            if (this.renderLoading === true && currState.loading !== nextState.loading) {
                return true;
            } else if (currState.version !== nextState.version) {
                return true;
            } else if (currState.error !== nextState.error) {
                return true;
            } else if (currState.hash !== nextState.hash) {
                return true;
            }

            var currData = currProps.data,
                _currProps$style = currProps.style,
                currStyle = _currProps$style === undefined ? {} : _currProps$style,
                restCurrProps = _objectWithoutProperties(currProps, ['data', 'style']);

            var nextData = nextProps.data,
                _nextProps$style = nextProps.style,
                nextStyle = _nextProps$style === undefined ? currStyle : _nextProps$style,
                restNextProps = _objectWithoutProperties(nextProps, ['data', 'style']);

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
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps, nextContext) {
            // Receive new props from the owner
            this.propsStream.next({
                container: this,
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
                container: this,
                props: this.props,
                data: this.props.data,
                falcor: this.context.falcor,
                dispatch: this.context.dispatch
            });
        }
        // componentWillUpdate() {
        //     const { state = {} } = this;
        //     const { falcor } = state;
        //     if (falcor) {
        //         const pathString = falcor.getPath().reduce((xs, key, idx) => {
        //             if (idx === 0) {
        //                 return key;
        //             } else if (typeof key === 'number') {
        //                 return `${xs}[${key}]`;
        //             }
        //             return `${xs}['${key}']`;
        //         }, '');
        //         console.log(`cwu:`, pathString);
        //     }
        // }

    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            // Clean-up subscription before un-mounting
            this.propsSubscription.unsubscribe();
            this.propsSubscription = undefined;
            this.fragment = null;
            this.Component = null;
            this.dispatchers = null;
            this.mapDispatch = null;
            this.mapFragment = null;
            this.renderLoading = null;
            this.mergeFragmentAndProps = null;
        }
    }, {
        key: 'render',
        value: function render() {
            var Component = this.Component,
                dispatchers = this.dispatchers,
                mapFragment = this.mapFragment,
                renderErrors = this.renderErrors,
                renderLoading = this.renderLoading,
                mapFragmentAndProps = this.mapFragmentAndProps;


            if (!Component) {
                return null;
            }

            var _props2 = this.props,
                outerData = _props2.data,
                props = _objectWithoutProperties(_props2, ['data']);

            var _state3 = this.state,
                data = _state3.data,
                error = _state3.error,
                loading = _state3.loading,
                falcor = _state3.falcor,
                dispatch = _state3.dispatch;


            var mappedFragment = mapFragment(data, props);

            var allMergedProps = mapFragmentAndProps(mappedFragment, dispatchers, props);

            if (error && renderErrors === true) {
                allMergedProps.error = error;
            }

            if (loading && renderLoading === true) {
                allMergedProps.loading = loading;
            }

            return _react2.default.createElement(Component, allMergedProps);
        }
    }]);

    return FalcorContainer;
}(_react2.default.Component);

FalcorContainer.contextTypes = contextTypes;
FalcorContainer.childContextTypes = contextTypes;
//# sourceMappingURL=container.js.map