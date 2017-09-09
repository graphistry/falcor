'use strict';

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

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _falcor = require('@graphistry/falcor');

var _Subject = require('rxjs/Subject');

var _Observable = require('rxjs/Observable');

var _ReplaySubject = require('rxjs/ReplaySubject');

var _BehaviorSubject = require('rxjs/BehaviorSubject');

require('rxjs/add/observable/bindCallback');

require('rxjs/add/operator/let');

require('rxjs/add/operator/map');

require('rxjs/add/operator/take');

require('rxjs/add/operator/filter');

require('rxjs/add/operator/repeat');

require('rxjs/add/operator/multicast');

require('rxjs/add/operator/switchMap');

require('rxjs/add/operator/exhaustMap');

require('rxjs/add/operator/distinctUntilChanged');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass; }

if (!_falcor.Model.prototype.changes) {
    _falcor.Model.prototype.changes = function () {
        var _root = this._root;
        var changes = _root.changes;

        if (!changes) {
            changes = _root.changes = new _BehaviorSubject.BehaviorSubject(this);
            ['onChange', 'onChangesCompleted'].forEach(function (name) {
                var handler = _root[name];
                _root[name] = function () {
                    if (handler) {
                        handler.call(this);
                    }
                    changes.next(this);
                };
            });
        }
        return changes;
    };
}

var Provider = function (_React$Component) {
    _inherits(Provider, _React$Component);

    function Provider(props, context) {
        _classCallCheck(this, Provider);

        var _this = _possibleConstructorReturn(this, (Provider.__proto__ || (0, _getPrototypeOf2.default)(Provider)).call(this, props, context));

        _this.state = {
            falcorData: undefined,
            falcorModel: props.falcorModel,
            renderFalcorErrors: props.renderFalcorErrors || false,
            renderFalcorLoading: props.renderFalcorLoading || false
        };
        return _this;
    }

    _createClass(Provider, [{
        key: 'getChildContext',
        value: function getChildContext() {
            var _state = this.state,
                falcorData = _state.falcorData,
                falcorModel = _state.falcorModel,
                renderFalcorErrors = _state.renderFalcorErrors,
                renderFalcorLoading = _state.renderFalcorLoading;

            return { falcorData: falcorData, falcorModel: falcorModel, renderFalcorErrors: renderFalcorErrors, renderFalcorLoading: renderFalcorLoading };
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            // Subscribe to child prop changes so we know when to re-render
            this.propsSubscription = mapPropsToDistinctChanges(this, this.propsStream = new _Subject.Subject()).subscribe(function () {});
            this.propsStream.next(this.props);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            this.propsStream.next(nextProps);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            // Clean-up subscription before un-mounting
            this.propsSubscription.unsubscribe();
            this.propsSubscription = undefined;
            this.propsStream = undefined;
        }
    }, {
        key: 'render',
        value: function render() {
            return _react.Children.only(this.props.children);
        }
    }]);

    return Provider;
}(_react2.default.Component);

Provider.displayName = 'FalcorProvider';
Provider.propTypes = {
    renderFalcorErrors: _propTypes2.default.bool,
    renderFalcorLoading: _propTypes2.default.bool,
    children: _propTypes2.default.element.isRequired,
    falcorModel: _propTypes2.default.object.isRequired
};
Provider.childContextTypes = {
    falcorData: _propTypes2.default.object,
    falcorModel: _propTypes2.default.object,
    renderFalcorErrors: _propTypes2.default.bool,
    renderFalcorLoading: _propTypes2.default.bool
};
exports.default = Provider;


function mapPropsToDistinctChanges(provider, props$) {

    var setStateAsync = _Observable.Observable.bindCallback(function (_ref, callback) {
        var falcorModel = _ref.falcorModel,
            _ref$renderFalcorErro = _ref.renderFalcorErrors,
            renderFalcorErrors = _ref$renderFalcorErro === undefined ? false : _ref$renderFalcorErro,
            _ref$renderFalcorLoad = _ref.renderFalcorLoading,
            renderFalcorLoading = _ref$renderFalcorLoad === undefined ? false : _ref$renderFalcorLoad;

        return provider.setState({ falcorModel: falcorModel, renderFalcorErrors: renderFalcorErrors, renderFalcorLoading: renderFalcorLoading }, callback);
    });

    return props$.switchMap(mapPropsToChanges, mapChangeToProps).distinctUntilChanged(null, getModelVersion).map(function (props) {
        return { props: props, pending: true };
    }).multicast(function () {
        return new _ReplaySubject.ReplaySubject(1);
    }, function (updates) {
        return updates.filter(function (_ref2) {
            var pending = _ref2.pending;
            return pending;
        }).exhaustMap(function (update) {
            return setStateAsync(update.props);
        }, function (update) {
            update.pending = false;
        }).take(1).repeat();
    });
}

function mapPropsToChanges(props) {
    var model = props['falcorModel'];
    (0, _invariant2.default)(model, 'The Falcor Provider requires a root falcor Model.');
    return model.changes();
}

function mapChangeToProps(props, model) {
    return _extends({}, props, { 'falcorModel': model });
}

function getModelVersion(props) {
    return props['falcorModel'].getVersion();
}
//# sourceMappingURL=Provider.js.map