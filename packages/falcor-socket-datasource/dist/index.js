"use strict";

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _iterator = require("babel-runtime/core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _socket = require("socket.io-client");

var _socket2 = _interopRequireDefault(_socket);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FalcorWebSocketDataSource = function () {
	function FalcorWebSocketDataSource() {
		_classCallCheck(this, FalcorWebSocketDataSource);

		var event = null;
		var socket = null;
		var cancel = null;

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		if (typeof args[0] === "string") {
			socket = new _socket2.default(args.shift(), args[0] && _typeof(args[0]) === "object" ? args.shift() : {});
		} else {
			socket = args.shift();
		}

		event = args.shift() || "falcor";
		cancel = args.shift() || "cancel_falcor_operation";

		this.socket = socket;
		this.event = event;
		this.cancel = cancel;
	}

	_createClass(FalcorWebSocketDataSource, [{
		key: "call",
		value: function call(functionPath, args, refSuffixes, thisPaths) {
			return this.operation("call", { args: args, functionPath: functionPath, refSuffixes: refSuffixes, thisPaths: thisPaths });
		}
	}, {
		key: "get",
		value: function get(pathSets) {
			return this.operation("get", { pathSets: pathSets });
		}
	}, {
		key: "set",
		value: function set(jsonGraphEnvelope) {
			return this.operation("set", { jsonGraphEnvelope: jsonGraphEnvelope });
		}
	}, {
		key: "operation",
		value: function operation(method, parameters) {
			return {
				subscribe: subscribe.bind(this, method, parameters)
			};
		}
	}]);

	return FalcorWebSocketDataSource;
}();

exports.default = FalcorWebSocketDataSource;


function subscribe(method, parameters, observerOrNext) {
	for (var _len2 = arguments.length, rest = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
		rest[_key2 - 3] = arguments[_key2];
	}

	var observer = observerOrNext;

	if (typeof observerOrNext === "function") {
		// Falcor internals still expect DataSources to conform to the Rx4 Observer spec.
		observer = {
			onCompleted: rest[1],
			onError: rest[0],
			onNext: observerOrNext
		};
	}

	var acknowledged = false;

	var id = (0, _uuid2.default)();
	var socket = this.socket;
	var event = this.event;
	var cancel = this.cancel;


	var responseToken = event + "_" + id;
	var cancellationToken = cancel + "_" + id;

	socket.on(responseToken, handler);
	socket.emit(event, _extends({ id: id, method: method }, parameters));

	return {
		dispose: function dispose() {
			socket.off(responseToken, handler);
			if (!acknowledged) {
				socket.emit(cancellationToken);
			}
		}
	};

	function handler(_ref) {
		var error = _ref.error;

		var rest = _objectWithoutProperties(_ref, ["error"]);

		// Don't emit the cancelation event if the subscription is
		// disposed as a result of `error` or `complete`.
		acknowledged = true;
		if (typeof error !== "undefined") {
			// If there's at least one own-property key in ...rest,
			// notify the subscriber of the data before erroring.
			for (var restKey in rest) {
				if (!rest.hasOwnProperty(restKey)) {
					continue;
				}
				observer.onNext(rest);
				break;
			}
			observer.onError && observer.onError(error);
		} else {
			observer.onNext(rest);
			// todo: update falcor client and router to support
			// streaming, then update socket datasource with `nextEvent`
			// 'errorEvent', and `completeEvent` constructor args.
			observer.onCompleted && observer.onCompleted();
		}
	}
}