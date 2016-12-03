'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _falcor = require('@graphistry/falcor');

var _Observable = require('rxjs/Observable');

var _BehaviorSubject = require('rxjs/BehaviorSubject');

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

(0, _setObservableConfig2.default)(_rxjsObservableConfig2.default);

var contextTypes = {
    falcor: _react.PropTypes.object,
    dispatch: _react.PropTypes.func
};

var connect = function connect(BaseComponent) {
    return (0, _compose2.default)((0, _reactRedux.connect)(function (data, _ref) {
        var falcor = _ref.falcor;

        if (!falcor._seed) {
            falcor._seed = {
                __proto__: _falcor.FalcorJSON.prototype,
                json: data = { __proto__: _falcor.FalcorJSON.prototype }
            };
        } else if (!falcor._seed.json) {
            data = falcor._seed.json = { __proto__: _falcor.FalcorJSON.prototype };
        } else {
            data = falcor._seed.json;
        }
        return { data: data };
    }), (0, _setDisplayName2.default)((0, _wrapDisplayName2.default)(BaseComponent, 'Falcor')), (0, _mapPropsStream2.default)(function (props) {
        return props.switchMap(function (_ref2) {
            var falcor = _ref2.falcor;
            return falcor.changes();
        }, function (_ref3, falcor) {
            var props = (0, _objectWithoutProperties3.default)(_ref3, []);
            return (0, _extends3.default)({}, props, { falcor: falcor, version: falcor.getVersion()
            });
        }).distinctUntilKeyChanged('version').auditTime(0, _animationFrame.animationFrame);
    }), (0, _withContext2.default)(contextTypes, function (_ref4) {
        var falcor = _ref4.falcor,
            dispatch = _ref4.dispatch;
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

exports.default = connect;
//# sourceMappingURL=connect.js.map