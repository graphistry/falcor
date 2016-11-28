'use strict';

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FalcorPubSubDataSource = undefined;

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _simpleflakes = require('simpleflakes');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FalcorPubSubDataSource = exports.FalcorPubSubDataSource = function () {
    function FalcorPubSubDataSource(socket, model) {
        var event = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'falcor-operation';
        var cancel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'cancel-falcor-operation';

        _classCallCheck(this, FalcorPubSubDataSource);

        this.event = event;
        this.model = model;
        this.cancel = cancel;
        this.socket = socket;
    }

    _createClass(FalcorPubSubDataSource, [{
        key: 'call',
        value: function call(functionPath, args, refSuffixes, thisPaths) {
            return this.operation('call', { args: args, functionPath: functionPath, refSuffixes: refSuffixes, thisPaths: thisPaths });
        }
    }, {
        key: 'get',
        value: function get(pathSets) {
            return this.operation('get', { pathSets: pathSets });
        }
    }, {
        key: 'set',
        value: function set(jsonGraphEnvelope) {
            return this.operation('set', { jsonGraphEnvelope: jsonGraphEnvelope });
        }
    }, {
        key: 'operation',
        value: function operation(method, parameters) {
            return {
                subscribe: request.bind(this, method, parameters)
            };
        }
    }]);

    return FalcorPubSubDataSource;
}();

function request(method, parameters, observerOrNext) {
    for (var _len = arguments.length, rest = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        rest[_key - 3] = arguments[_key];
    }

    var observer = observerOrNext;

    if (typeof observerOrNext === 'function') {
        // Falcor internals still expect DataSources to conform to the Rx4 Observer spec.
        observer = {
            onCompleted: rest[1],
            onError: rest[0],
            onNext: observerOrNext
        };
    }

    var event = this.event,
        cancel = this.cancel,
        model = this.model,
        socket = this.socket;


    if (socket.connected === false && model) {
        var _ret = function () {

            var thisPath = void 0,
                functionPath = void 0,
                pathSets = void 0,
                jsonGraphEnvelope = void 0;

            if (method === 'set') {
                jsonGraphEnvelope = parameters.jsonGraphEnvelope;
            } else if (method === 'get' || method === 'call') {

                jsonGraphEnvelope = {};
                pathSets = parameters.pathSets;

                if (method === 'call') {
                    pathSets = parameters.thisPaths || [];
                    functionPath = parameters.functionPath;
                    thisPath = functionPath.slice(0, -1);
                    pathSets = pathSets.map(function (path) {
                        return thisPath.concat(path);
                    });
                }

                model._getPathValuesAsJSONG(model.boxValues()._materialize().withoutDataSource().treatErrorsAsValues(), pathSets, [jsonGraphEnvelope]);
            }
            observer.onNext(jsonGraphEnvelope);
            observer.onCompleted && observer.onCompleted();
            return {
                v: {
                    dispose: function dispose() {}
                }
            };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }

    var acknowledged = false;

    var id = (0, _simpleflakes.simpleflake)().toJSON();

    var responseToken = event + '-' + id;
    var cancellationToken = cancel + '-' + id;

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
        var error = _ref.error,
            rest = _objectWithoutProperties(_ref, ['error']);

        // Don't emit the cancelation event if the subscription is
        // disposed as a result of `error` or `complete`.
        acknowledged = true;
        if (typeof error !== 'undefined') {
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