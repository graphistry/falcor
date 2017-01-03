'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
// import { asap as asapScheduler } from 'rxjs/scheduler/asap';

exports.default = connect;

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _falcor = require('@graphistry/falcor');

var _Observable = require('rxjs/Observable');

var _BehaviorSubject = require('rxjs/BehaviorSubject');

var _animationFrame = require('rxjs/scheduler/animationFrame');

require('rxjs/add/operator/auditTime');

require('rxjs/add/operator/switchMap');

require('rxjs/add/operator/distinctUntilKeyChanged');

var _setDisplayName = require('recompose/setDisplayName');

var _setDisplayName2 = _interopRequireDefault(_setDisplayName);

var _wrapDisplayName = require('recompose/wrapDisplayName');

var _wrapDisplayName2 = _interopRequireDefault(_wrapDisplayName);

var _rxjsObservableConfig = require('recompose/rxjsObservableConfig');

var _rxjsObservableConfig2 = _interopRequireDefault(_rxjsObservableConfig);

var _mapPropsStream = require('recompose/mapPropsStream');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function connect(Component) {
    var scheduler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _animationFrame.animationFrame;

    return compose((0, _setDisplayName2.default)((0, _wrapDisplayName2.default)(Component, 'Connect')), (0, _mapPropsStream.mapPropsStreamWithConfig)(_rxjsObservableConfig2.default)(mapPropsToDistinctChanges(scheduler)));
}

function mapPropsToDistinctChanges(scheduler) {
    return function innerMapPropsToDistinctChanges(prop$) {
        return prop$.switchMap(mapPropsToChanges, mapChangeToProps).distinctUntilChanged(null, getModelVersion).auditTime(0, scheduler);
    };
}

function mapPropsToChanges(props) {
    var model = props['falcor-model'];
    (0, _invariant2.default)(model, 'The top level "connect" container requires a root falcor model.');
    return model.changes();
}

function mapChangeToProps(props, model) {
    return _extends({}, props, { 'falcor-model': model });
}

function getModelVersion(props) {
    return props['falcor-model'].getVersion();
}

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
//# sourceMappingURL=connect.js.map