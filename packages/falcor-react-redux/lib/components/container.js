'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.container = undefined;

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _fetchDataUntilSettled = require('../utils/fetchDataUntilSettled');

var _fetchDataUntilSettled2 = _interopRequireDefault(_fetchDataUntilSettled);

var _Subject = require('rxjs/Subject');

var _Observable = require('rxjs/Observable');

var _ReplaySubject = require('rxjs/ReplaySubject');

require('rxjs/add/operator/map');

require('rxjs/add/observable/of');

require('rxjs/add/operator/take');

require('rxjs/add/operator/filter');

require('rxjs/add/operator/repeat');

require('rxjs/add/operator/multicast');

require('rxjs/add/operator/switchMap');

require('rxjs/add/operator/exhaustMap');

require('rxjs/add/observable/bindCallback');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultMapFragmentToProps = function defaultMapFragmentToProps(data) {
    return data;
};
var defaultMapDispatchToProps = function defaultMapDispatchToProps(dispatch, props, falcor) {
    return {};
};
var defaultMergeProps = function defaultMergeProps(stateProps, dispatchProps, parentProps) {
    return (0, _extends3.default)({}, parentProps, stateProps, dispatchProps);
};

exports.container = container;
exports.default = container;


function container(fragmentDesc) {

    (0, _invariant2.default)(fragmentDesc && ('function' === typeof fragmentDesc || 'object' === (typeof fragmentDesc === 'undefined' ? 'undefined' : (0, _typeof3.default)(fragmentDesc)) && 'function' === typeof fragmentDesc.fragment), 'Attempted to create a Falcor container component without a fragment.\nFalcor containers must be created with a fragment function, or an Object with a "fragment" function.');

    var renderErrors = false,
        renderLoading = false,
        fragment = void 0,
        mapFragment = void 0,
        mapDispatch = void 0,
        mapFragmentAndProps = void 0;

    if ('object' !== (typeof fragmentDesc === 'undefined' ? 'undefined' : (0, _typeof3.default)(fragmentDesc))) {
        fragment = fragmentDesc;
        mapFragment = arguments.length <= 1 ? undefined : arguments[1];
        mapDispatch = arguments.length <= 2 ? undefined : arguments[2];
        mapFragmentAndProps = arguments.length <= 3 ? undefined : arguments[3];
    } else {
        fragment = fragmentDesc.fragment;
        mapFragment = fragmentDesc.mapFragment;
        renderErrors = fragmentDesc.renderErrors;
        renderLoading = fragmentDesc.renderLoading;
        mapFragmentAndProps = fragmentDesc.mapFragmentAndProps;
        mapDispatch = fragmentDesc.mapDispatch || fragmentDesc.dispatchers;
    }

    mapFragment = mapFragment || defaultMapFragmentToProps;
    mapDispatch = mapDispatch || defaultMapDispatchToProps;
    mapFragmentAndProps = mapFragmentAndProps || defaultMergeProps;

    if ('function' !== typeof mapDispatch) {
        if (mapDispatch && 'object' !== (typeof mapDispatch === 'undefined' ? 'undefined' : (0, _typeof3.default)(mapDispatch))) {
            mapDispatch = defaultMapDispatchToProps;
        } else {
            mapDispatch = bindActionCreators(mapDispatch);
        }
    }

    return (0, _hoistStatics2.default)(function (Component) {
        var _class, _temp;

        return _temp = _class = function (_FalcorContainer) {
            (0, _inherits3.default)(Container, _FalcorContainer);

            function Container(props, context) {
                (0, _classCallCheck3.default)(this, Container);

                var _this = (0, _possibleConstructorReturn3.default)(this, (Container.__proto__ || (0, _getPrototypeOf2.default)(Container)).call(this, props, context));

                _this.fragment = fragment;
                _this.Component = Component;
                _this.mapFragment = mapFragment;
                _this.renderErrors = renderErrors;
                _this.renderLoading = renderLoading;
                _this.dispatchers = mapDispatch(_this);
                _this.mapFragmentAndProps = mapFragmentAndProps;
                return _this;
            }

            return Container;
        }(FalcorContainer), _class.fragment = fragment, _class.fragments = fragments, _class.contextTypes = contextTypes, _class.childContextTypes = contextTypes, _class.displayName = (0, _wrapDisplayName2.default)(Component, 'Container'), _temp;
    });
}

var fragments = function fragments(items) {
    if (!items || 'object' !== (typeof items === 'undefined' ? 'undefined' : (0, _typeof3.default)(items))) {
        return '{ length }';
    }
    var index = -1,
        query = 'length';
    var length = Math.max(0, items.length) || 0;
    while (++index < length) {
        query = query + ',\n ' + index + ': ' + this.fragment(items[index]);
    }
    return '{ ' + query + ' }';
};

function bindActionCreators(actionCreators) {
    return function mapDispatch(container) {
        return (0, _keys2.default)(actionCreators).reduce(function (dispatchers, key) {
            var actionCreator = actionCreators[key];
            dispatchers[key] = function () {
                var _container$state = container.state,
                    falcor = _container$state.falcor,
                    dispatch = _container$state.dispatch;

                if (falcor) {
                    return dispatch((0, _extends3.default)({ falcor: falcor }, actionCreator.apply(undefined, arguments)));
                }
            };
            return dispatchers;
        }, {});
    };
}

function tryDeref(_ref) {
    var data = _ref.data,
        falcor = _ref.falcor;

    return !data || !falcor ? falcor : falcor._hasValidParentReference() ? falcor.deref(data) : null;
}

function fetchEachPropUpdate(update) {

    var nextStateObs = void 0,
        inst = update.inst;

    if (!(update.falcor = tryDeref(update))) {
        nextStateObs = _Observable.Observable.of(update).do(function (results) {
            return inst.setState(mergeEachPropUpdate(update, results));
        });
    } else if (update.renderLoading === false) {
        nextStateObs = (0, _fetchDataUntilSettled2.default)(update).takeLast(1).do(function (results) {
            return inst.setState(mergeEachPropUpdate(update, results));
        });
    } else {
        (function () {
            var setStateAsync = _Observable.Observable.bindCallback(function (results, callback) {
                return inst.setState(mergeEachPropUpdate(update, results), callback);
            });
            nextStateObs = (0, _fetchDataUntilSettled2.default)(update).map(function (results) {
                return { results: results, pending: true };
            }).multicast(function () {
                return new _ReplaySubject.ReplaySubject(1);
            }, function (updates) {
                return updates.filter(function (_ref2) {
                    var pending = _ref2.pending;
                    return pending;
                }).exhaustMap(function (update) {
                    return setStateAsync(update.results);
                }, function (update) {
                    update.pending = false;
                }).take(1).repeat();
            });
        })();
    }

    return nextStateObs;
}

function mergeEachPropUpdate(_ref3, _ref4) {
    var props = _ref3.props,
        falcor = _ref3.falcor,
        dispatch = _ref3.dispatch;
    var data = _ref4.data,
        error = _ref4.error,
        version = _ref4.version,
        loading = _ref4.loading;

    var hash = data && data.$__hash;
    var status = data && data.$__status;
    loading = status === 'pending';
    return {
        hash: hash, props: props, falcor: falcor, dispatch: dispatch,
        data: data, error: error, loading: loading, version: version
    };
}

var contextTypes = {
    falcor: _react.PropTypes.object,
    dispatch: _react.PropTypes.func
};

var FalcorContainer = function (_React$Component) {
    (0, _inherits3.default)(FalcorContainer, _React$Component);

    function FalcorContainer(componentProps, context) {
        (0, _classCallCheck3.default)(this, FalcorContainer);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, (FalcorContainer.__proto__ || (0, _getPrototypeOf2.default)(FalcorContainer)).call(this, componentProps, context));

        var falcor = context.falcor;
        var data = componentProps.data,
            props = (0, _objectWithoutProperties3.default)(componentProps, ['data']);


        _this2.propsStream = new _Subject.Subject();
        _this2.propsAction = _this2.propsStream.switchMap(fetchEachPropUpdate);

        _this2.state = {
            data: data, props: props,
            dispatch: context.dispatch,
            falcor: tryDeref({ data: data, falcor: falcor })
        };
        return _this2;
    }

    (0, _createClass3.default)(FalcorContainer, [{
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
            var renderLoading = this.renderLoading,
                _props = this.props,
                currProps = _props === undefined ? {} : _props,
                _state2 = this.state,
                currState = _state2 === undefined ? {} : _state2;


            if (renderLoading === true && currState.loading !== nextState.loading) {
                this.traceShouldUpdate('loading', currState.loading, '->', nextState.loading);
                return true;
            } else if (currState.version !== nextState.version) {
                this.traceShouldUpdate('version', currState.version, '->', nextState.version);
                return true;
            } else if (currState.error !== nextState.error) {
                this.traceShouldUpdate('error', currState.error, '->', nextState.error);
                return true;
            } else if (currState.hash !== nextState.hash) {
                this.traceShouldUpdate('hash', currState.hash, '->', nextState.hash);
                return true;
            }

            var currData = currProps.data,
                _currProps$style = currProps.style,
                currStyle = _currProps$style === undefined ? {} : _currProps$style,
                restCurrProps = (0, _objectWithoutProperties3.default)(currProps, ['data', 'style']);
            var nextData = nextProps.data,
                _nextProps$style = nextProps.style,
                nextStyle = _nextProps$style === undefined ? currStyle : _nextProps$style,
                restNextProps = (0, _objectWithoutProperties3.default)(nextProps, ['data', 'style']);


            if (!(0, _shallowEqual2.default)(currData, nextData)) {
                this.traceShouldUpdate('data', currData, '->', nextData);
                return true;
            } else if (!(0, _shallowEqual2.default)(currStyle, nextStyle)) {
                this.traceShouldUpdate('style', currStyle, '->', nextStyle);
                return true;
            } else if (!(0, _shallowEqual2.default)(restCurrProps, restNextProps)) {
                this.traceShouldUpdate('props', restCurrProps, '->', restNextProps);
                return true;
            }

            this.traceShouldUpdate(false, currProps, '->', nextProps);

            return false;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps, nextContext) {
            // Receive new props from the owner
            var data = nextProps.data,
                props = (0, _objectWithoutProperties3.default)(nextProps, ['data']);

            this.propsStream.next({
                inst: this, data: data, props: props,
                fragment: this.fragment,
                falcor: nextContext.falcor,
                version: this.state.version,
                dispatch: nextContext.dispatch,
                renderLoading: this.renderLoading
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _props2 = this.props,
                data = _props2.data,
                props = (0, _objectWithoutProperties3.default)(_props2, ['data']);
            // Subscribe to child prop changes so we know when to re-render

            this.propsSubscription = this.propsAction.subscribe();
            this.propsStream.next({
                inst: this, data: data, props: props,
                fragment: this.fragment,
                falcor: this.context.falcor,
                version: this.state.version,
                dispatch: this.context.dispatch,
                renderLoading: this.renderLoading
            });
        }
    }, {
        key: 'componentWillUpdate',
        value: function componentWillUpdate(nextProps, nextState) {
            this.traceWillUpdate(nextState.loading || false, nextProps, nextState);
        }
    }, {
        key: 'traceShouldUpdate',
        value: function traceShouldUpdate() {
            var _console;

            if (!global['__trace_container_diffs__']) {
                return;
            }

            for (var _len = arguments.length, message = Array(_len), _key = 0; _key < _len; _key++) {
                message[_key] = arguments[_key];
            }

            (_console = console).log.apply(_console, [this.inspect()].concat(message));
        }
    }, {
        key: 'traceWillUpdate',
        value: function traceWillUpdate() {
            var _console2;

            if (!global['__trace_container_updates__']) {
                return;
            }

            for (var _len2 = arguments.length, message = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                message[_key2] = arguments[_key2];
            }

            (_console2 = console).log.apply(_console2, [this.inspect()].concat(message));
        }
    }, {
        key: 'inspect',
        value: function inspect() {
            var _state3 = this.state,
                state = _state3 === undefined ? {} : _state3;
            var falcor = state.falcor;

            return falcor && falcor.inspect() || '{ v: -1, p: [] }';
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            // Clean-up subscription before un-mounting
            this.propsSubscription.unsubscribe();
            this.propsSubscription = undefined;
            this.propsStream = undefined;
            this.propsAction = undefined;
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
            var renderErrors = this.renderErrors,
                renderLoading = this.renderLoading,
                mapFragment = this.mapFragment,
                mapFragmentAndProps = this.mapFragmentAndProps,
                Component = this.Component,
                dispatchers = this.dispatchers,
                state = this.state,
                context = this.context;


            if (!Component) {
                return null;
            }

            var data = state.data,
                props = state.props,
                error = state.error;

            var mappedFragment = mapFragment(data || [], props);
            var allMergedProps = mapFragmentAndProps(mappedFragment, dispatchers, props);

            if (error && renderErrors === true) {
                allMergedProps.error = error;
            }

            if (renderLoading === true) {
                allMergedProps.loading = state.loading || false;
            }

            return _react2.default.createElement(Component, allMergedProps);
        }
    }]);
    return FalcorContainer;
}(_react2.default.Component);
//# sourceMappingURL=container.js.map