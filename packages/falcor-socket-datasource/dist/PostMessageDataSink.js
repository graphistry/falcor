'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _setPrototypeOf = require('babel-runtime/core-js/object/set-prototype-of');

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PostMessageDataSink = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _PostMessageEmitter = require('./PostMessageEmitter');

var _FalcorPubSubDataSink2 = require('./FalcorPubSubDataSink');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass; }

var PostMessageDataSink = exports.PostMessageDataSink = function (_FalcorPubSubDataSink) {
    _inherits(PostMessageDataSink, _FalcorPubSubDataSink);

    function PostMessageDataSink(dataSource) {
        _classCallCheck(this, PostMessageDataSink);

        var _this = _possibleConstructorReturn(this, (PostMessageDataSink.__proto__ || (0, _getPrototypeOf2.default)(PostMessageDataSink)).call(this, null, function () {
            return dataSource;
        }));

        _this.onPostMessage = _this.onPostMessage.bind(_this);
        window.addEventListener('message', _this.onPostMessage);
        return _this;
    }

    _createClass(PostMessageDataSink, [{
        key: 'onPostMessage',
        value: function onPostMessage() {
            var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var _event$data = event.data;
            var data = _event$data === undefined ? {} : _event$data;
            var type = data.type;

            var rest = _objectWithoutProperties(data, ['type']);

            if (type !== 'falcor-operation') {
                return;
            }
            this.response(rest, new _PostMessageEmitter.PostMessageEmitter(window, event.source || parent, true));
        }
    }, {
        key: 'unsubscribe',
        value: function unsubscribe() {
            window.removeEventListener('message', this.onPostMessage);
        }
    }]);

    return PostMessageDataSink;
}(_FalcorPubSubDataSink2.FalcorPubSubDataSink);