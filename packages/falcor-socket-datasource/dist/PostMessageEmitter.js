'use strict';

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PostMessageEmitter = exports.PostMessageEmitter = function () {
    function PostMessageEmitter(source, target) {
        _classCallCheck(this, PostMessageEmitter);

        this.source = source;
        this.target = target;
        this.listeners = {};
        this.connected = true;
        this.onPostMessage = this.onPostMessage.bind(this);
        source.addEventListener('message', this.onPostMessage);
    }

    _createClass(PostMessageEmitter, [{
        key: 'onPostMessage',
        value: function onPostMessage() {
            var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var _event$data = event.data,
                data = _event$data === undefined ? {} : _event$data;

            var type = data.type,
                rest = _objectWithoutProperties(data, ['type']);

            if (!type || type.indexOf('falcor-operation') === -1) {
                return;
            }
            var listeners = this.listeners;

            var handlers = listeners[type];
            if (!handlers) {
                return;
            }
            handlers.slice(0).forEach(function (handler) {
                return handler && handler(rest);
            });
        }
    }, {
        key: 'on',
        value: function on(eventName, handler) {
            var listeners = this.listeners;

            var handlers = listeners[eventName] || (listeners[eventName] = []);
            var handlerIndex = handlers.indexOf(handler);
            if (handlerIndex === -1) {
                handlers.push(handler);
            }
        }
    }, {
        key: 'removeListener',
        value: function removeListener(eventName, handler) {
            var listeners = this.listeners;

            var handlers = listeners[eventName];
            if (!handlers) {
                return;
            }
            var handlerIndex = handlers.indexOf(handler);
            if (handlerIndex !== -1) {
                handlers.splice(handlerIndex, 1);
            }
            if (handlers.length === 0) {
                delete listeners[eventName];
            }
        }
    }, {
        key: 'emit',
        value: function emit(eventName) {
            var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
                kind = _ref.kind,
                value = _ref.value,
                error = _ref.error;

            var finalized = false,
                payload = void 0;
            var source = this.source,
                target = this.target;

            switch (kind) {
                case 'N':
                    payload = { kind: kind, value: value };
                    break;
                case 'E':
                    payload = { kind: kind, error: error };
                    finalized = true;
                    break;
                case 'C':
                    payload = { kind: kind };
                    finalized = true;
                    break;
            }
            if (finalized) {
                this.target = null;
                this.source = null;
                this.listeners = null;
                this.connected = false;
                if (source) {
                    source.removeEventListener('message', this.onPostMessage);
                }
            }
            if (payload && target) {
                target.postMessage(_extends({ type: eventName }, payload), '*');
            }
        }
    }]);

    return PostMessageEmitter;
}();