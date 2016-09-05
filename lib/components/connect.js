'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _setObservableConfig = require('recompose/setObservableConfig');

var _setObservableConfig2 = _interopRequireDefault(_setObservableConfig);

var _rxjsObservableConfig = require('recompose/rxjsObservableConfig');

var _rxjsObservableConfig2 = _interopRequireDefault(_rxjsObservableConfig);

var _rxjs = require('rxjs');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

(0, _setObservableConfig2.default)(_rxjsObservableConfig2.default);

var contextTypes = {
    falcor: _react.PropTypes.object,
    version: _react.PropTypes.number,
    dispatch: _react.PropTypes.func
};

var connect = function connect(BaseComponent) {
    return (0, _compose2.default)((0, _reactRedux.connect)(function (data, _ref) {
        var falcor = _ref.falcor;
        return {
            data: (0, _mapToFalcorJSON2.default)(data, falcor)
        };
    }), (0, _setDisplayName2.default)((0, _wrapDisplayName2.default)(BaseComponent, 'Falcor')), (0, _mapPropsStream2.default)(function (props) {
        return props.switchMap(function (_ref2) {
            var falcor = _ref2.falcor;
            return falcor.changes();
        }, function (_ref3, falcor) {
            var props = _objectWithoutProperties(_ref3, []);

            return _extends({}, props, { falcor: falcor, version: falcor.getVersion()
            });
        }).distinctUntilKeyChanged('version').auditTime(0, _rxjs.Scheduler.asap);
    }), (0, _withContext2.default)(contextTypes, function (_ref4) {
        var falcor = _ref4.falcor;
        var version = _ref4.version;
        var dispatch = _ref4.dispatch;
        return {
            falcor: falcor, dispatch: dispatch, version: version
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