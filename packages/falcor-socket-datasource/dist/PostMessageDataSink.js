'use strict';

var _setPrototypeOf = require('babel-runtime/core-js/object/set-prototype-of');

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PostMessageDataSink = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = (0, _getOwnPropertyDescriptor2.default)(object, property); if (desc === undefined) { var parent = (0, _getPrototypeOf2.default)(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _PostMessageEmitter2 = require('./PostMessageEmitter');

var _FalcorPubSubDataSink2 = require('./FalcorPubSubDataSink');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass; }

var PostMessageDataSink = exports.PostMessageDataSink = function (_FalcorPubSubDataSink) {
    _inherits(PostMessageDataSink, _FalcorPubSubDataSink);

    function PostMessageDataSink(getDataSource) {
        var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window;
        var targetOrigin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '*';
        var event = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'falcor-operation';
        var cancel = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'cancel-falcor-operation';

        _classCallCheck(this, PostMessageDataSink);

        var _this = _possibleConstructorReturn(this, (PostMessageDataSink.__proto__ || (0, _getPrototypeOf2.default)(PostMessageDataSink)).call(this, null, getDataSource, event, cancel));

        _this.source = source;
        _this.targetOrigin = targetOrigin;
        _this.onPostMessage = _this.onPostMessage.bind(_this);
        source.addEventListener('message', _this.onPostMessage);
        return _this;
    }

    _createClass(PostMessageDataSink, [{
        key: 'onPostMessage',
        value: function onPostMessage() {
            var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var _event$data = event.data,
                data = _event$data === undefined ? {} : _event$data;
            var targetOrigin = this.targetOrigin;

            if (data.type !== this.event || targetOrigin !== '*' && targetOrigin !== event.origin) {
                return;
            }
            this.response(data, new AutoDisposeEmitter(this.source, event.source, this.targetOrigin, this.event, this.cancel));
        }
    }, {
        key: 'dispose',
        value: function dispose() {
            this.unsubscribe();
        }
    }, {
        key: 'unsubscribe',
        value: function unsubscribe() {
            var source = this.source;

            this.source = null;
            source && source.removeEventListener('message', this.onPostMessage);
        }
    }]);

    return PostMessageDataSink;
}(_FalcorPubSubDataSink2.FalcorPubSubDataSink);

var AutoDisposeEmitter = function (_PostMessageEmitter) {
    _inherits(AutoDisposeEmitter, _PostMessageEmitter);

    function AutoDisposeEmitter() {
        _classCallCheck(this, AutoDisposeEmitter);

        return _possibleConstructorReturn(this, (AutoDisposeEmitter.__proto__ || (0, _getPrototypeOf2.default)(AutoDisposeEmitter)).apply(this, arguments));
    }

    _createClass(AutoDisposeEmitter, [{
        key: 'emit',
        value: function emit(eventName, data) {
            var _ref = data || {},
                kind = _ref.kind;

            var retVal = _get(AutoDisposeEmitter.prototype.__proto__ || (0, _getPrototypeOf2.default)(AutoDisposeEmitter.prototype), 'emit', this).call(this, eventName, data);
            if (kind === 'E' || kind === 'C') {
                this.dispose();
            }
            return retVal;
        }
    }]);

    return AutoDisposeEmitter;
}(_PostMessageEmitter2.PostMessageEmitter);