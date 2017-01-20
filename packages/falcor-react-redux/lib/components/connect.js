'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.connect = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _compose = require('recompose/compose');

var _compose2 = _interopRequireDefault(_compose);

var _lifecycle = require('recompose/lifecycle');

var _lifecycle2 = _interopRequireDefault(_lifecycle);

var _withContext = require('recompose/withContext');

var _withContext2 = _interopRequireDefault(_withContext);

var _hoistStatics = require('recompose/hoistStatics');

var _hoistStatics2 = _interopRequireDefault(_hoistStatics);

var _mapPropsStream = require('recompose/mapPropsStream');

var _mapPropsStream2 = _interopRequireDefault(_mapPropsStream);

var _setDisplayName = require('recompose/setDisplayName');

var _setDisplayName2 = _interopRequireDefault(_setDisplayName);

var _wrapDisplayName = require('recompose/wrapDisplayName');

var _wrapDisplayName2 = _interopRequireDefault(_wrapDisplayName);

var _setObservableConfig = require('recompose/setObservableConfig');

var _setObservableConfig2 = _interopRequireDefault(_setObservableConfig);

var _rxjsObservableConfig = require('recompose/rxjsObservableConfig');

var _rxjsObservableConfig2 = _interopRequireDefault(_rxjsObservableConfig);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _Observable = require('rxjs/Observable');

var _BehaviorSubject = require('rxjs/BehaviorSubject');

var _falcor = require('@graphistry/falcor');

var _animationFrame = require('rxjs/scheduler/animationFrame');

require('rxjs/add/operator/auditTime');

require('rxjs/add/operator/switchMap');

require('rxjs/add/operator/distinctUntilKeyChanged');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!_falcor.Model.prototype.changes) {
    _falcor.Model.prototype.changes = function () {
        var _this = this;

        var _root = this._root;
        var changes = _root.changes;

        if (!changes) {
            (function () {
                changes = _root.changes = new _BehaviorSubject.BehaviorSubject(_this);
                var onChange = _root.onChange;

                _root.onChange = function () {
                    if (onChange) {
                        onChange.call(_this);
                    }
                    changes.next(_this);
                };
            })();
        }
        return changes;
    };
}
// import { asap as asapScheduler } from 'rxjs/scheduler/asap';

(0, _setObservableConfig2.default)(_rxjsObservableConfig2.default);

var typeofObject = 'object';
var reduxOptions = { pure: false };
var contextTypes = {
    falcor: _react.PropTypes.object,
    dispatch: _react.PropTypes.func
};

var connect = function connect(BaseComponent) {
    var scheduler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _animationFrame.animationFrame;
    return (0, _hoistStatics2.default)((0, _compose2.default)((0, _reactRedux.connect)(mapReduxStoreToProps, null, null, reduxOptions), (0, _setDisplayName2.default)((0, _wrapDisplayName2.default)(BaseComponent, 'Falcor')), (0, _mapPropsStream2.default)(mapPropsToDistinctChanges(scheduler)), (0, _withContext2.default)(contextTypes, function (_ref) {
        var falcor = _ref.falcor,
            dispatch = _ref.dispatch;
        return {
            falcor: falcor, dispatch: dispatch
        };
    }), (0, _lifecycle2.default)({
        componentDidUpdate: function componentDidUpdate() {
            this.props.dispatch({
                data: this.props.data,
                type: 'falcor-react-redux/update'
            });
        }
    })))(BaseComponent);
};

exports.connect = connect;
exports.default = connect;


function mapReduxStoreToProps(data, _ref2) {
    var falcor = _ref2.falcor;


    (0, _invariant2.default)(falcor, 'The top level "connect" container requires a root falcor model.');

    if (data instanceof _falcor.FalcorJSON) {
        return { data: data };
    } else if (falcor._recycleJSON) {
        if (falcor._seed && falcor._seed.json) {
            return { data: falcor._seed.json };
        }
        falcor._seed = {};
        falcor._seed.__proto__ = _falcor.FalcorJSON.prototype;
        return { data: falcor._seed.json = new _falcor.FalcorJSON(data) };
    }

    return { data: new _falcor.FalcorJSON(data) };
}

function mapPropsToDistinctChanges(scheduler) {
    return function innerMapPropsToDistinctChanges(prop$) {
        return prop$.switchMap(mapPropsToChanges, mapChangeToProps).distinctUntilKeyChanged('version').auditTime(0, scheduler);
    };
}

function mapPropsToChanges(_ref3) {
    var falcor = _ref3.falcor;

    return falcor.changes();
}

function mapChangeToProps(props, falcor) {
    return (0, _extends3.default)({}, props, { falcor: falcor, version: falcor.getVersion() });
}
//# sourceMappingURL=connect.js.map