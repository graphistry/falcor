'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.connect = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

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

var _shouldUpdate = require('recompose/shouldUpdate');

var _shouldUpdate2 = _interopRequireDefault(_shouldUpdate);

var _mapPropsStream = require('recompose/mapPropsStream');

var _mapPropsStream2 = _interopRequireDefault(_mapPropsStream);

var _setDisplayName = require('recompose/setDisplayName');

var _setDisplayName2 = _interopRequireDefault(_setDisplayName);

var _wrapDisplayName = require('recompose/wrapDisplayName');

var _wrapDisplayName2 = _interopRequireDefault(_wrapDisplayName);

var _bindActionCreators = require('../utils/bindActionCreators');

var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

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
    return (0, _compose2.default)((0, _reactRedux.connect)(mapReduxStoreToProps, 0, mergeReduxProps, reduxOptions), (0, _setDisplayName2.default)((0, _wrapDisplayName2.default)(BaseComponent, 'Falcor')), (0, _mapPropsStream2.default)(mapPropsToDistinctChanges(scheduler)), (0, _withContext2.default)(contextTypes, function (_ref) {
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
    }))(BaseComponent);
};

exports.connect = connect;
exports.default = connect;


function mapReduxStoreToProps(store, _ref2) {
    var falcor = _ref2.falcor;

    (0, _invariant2.default)(falcor, 'The top level "connect" container requires a root falcor model.');
    if (!store || typeofObject !== (typeof store === 'undefined' ? 'undefined' : (0, _typeof3.default)(store))) {
        store = !falcor._recycleJSON ? new _falcor.FalcorJSON() : falcor._seed && falcor._seed.json || undefined;
    } else if (!(store instanceof _falcor.FalcorJSON)) {
        if (!falcor._recycleJSON) {
            store = new _falcor.FalcorJSON(store);
        } else if (!falcor._seed || !falcor._seed.json) {
            falcor._seed = { json: store = {
                    __proto__: new _falcor.FalcorJSON(store) },
                __proto__: _falcor.FalcorJSON.prototype
            };
        }
    }
    return { data: store };
}

function mergeReduxProps(_ref3, _ref4, _ref5) {
    var data = _ref3.data;
    var dispatch = _ref4.dispatch;
    var falcor = _ref5.falcor;

    return { data: data, falcor: falcor, dispatch: dispatch };
}

function mapPropsToDistinctChanges(scheduler) {
    return function innerMapPropsToDistinctChanges(prop$) {
        return prop$.switchMap(mapPropsToChanges, mapChangeToProps).distinctUntilKeyChanged('version').auditTime(0, scheduler);
    };
}

function mapPropsToChanges(_ref6) {
    var falcor = _ref6.falcor;

    return falcor.changes();
}

function mapChangeToProps(props, falcor) {
    return (0, _extends3.default)({}, props, { falcor: falcor, version: falcor.getVersion() });
}
//# sourceMappingURL=connect.js.map