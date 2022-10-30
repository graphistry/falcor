'use strict';

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FalcorPubSubDataSource = undefined;

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _uuid = require('uuid');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FalcorPubSubDataSource = exports.FalcorPubSubDataSource = function () {
    function FalcorPubSubDataSource(emitter, model) {
        var event = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'falcor-operation';
        var cancel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'cancel-falcor-operation';

        _classCallCheck(this, FalcorPubSubDataSource);

        this.event = event;
        this.model = model;
        this.cancel = cancel;
        this.emitter = emitter;
    }

    _createClass(FalcorPubSubDataSource, [{
        key: 'call',
        value: function call(callPath, callArgs, suffixes, thisPaths) {
            if (!Array.isArray(callPath)) {
                callPath = [callPath];
            }
            if (!Array.isArray(callArgs)) {
                callArgs = [callArgs];
            }
            if (!Array.isArray(suffixes)) {
                suffixes = [suffixes];
            }
            if (!Array.isArray(thisPaths)) {
                thisPaths = [thisPaths];
            }
            return this.operation('call', { callPath: callPath, callArgs: callArgs, suffixes: suffixes, thisPaths: thisPaths });
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

function request(method, parameters, observer) {

    if (typeof observer === 'function') {
        observer = { onNext: observer, onError: arguments.length <= 3 ? undefined : arguments[3], onCompleted: arguments.length <= 4 ? undefined : arguments[4] };
    }

    var event = this.event,
        cancel = this.cancel,
        model = this.model,
        emitter = this.emitter;


    if (emitter && emitter.readyState !== 'closed' && emitter.readyState !== 'closing') {
        var handleResponse = function handleResponse(_ref, handshake) {
            var kind = _ref.kind,
                value = _ref.value,
                error = _ref.error;

            if (!disposed) {
                switch (kind) {
                    case 'N':
                        observer.onNext && observer.onNext(value);
                        break;
                    case 'E':
                        disposed = true;
                        try {
                            emitter.removeListener(responseToken);
                        } catch (e) {}
                        emitter.removeListener(responseToken, handleResponse);
                        if (value !== undefined && observer.onNext) {
                            observer.onNext(value);
                        }
                        observer.onError && observer.onError(error);
                        break;
                    case 'C':
                        disposed = true;
                        try {
                            emitter.removeListener(responseToken);
                        } catch (e) {}
                        emitter.removeListener(responseToken, handleResponse);
                        if (value !== undefined && observer.onNext) {
                            observer.onNext(value);
                        }
                        observer.onCompleted && observer.onCompleted();
                        break;
                }
            }
            typeof handshake === 'function' && handshake();
        };

        var disposed = false;
        var id = (0, _uuid.v4)();
        var responseToken = event + '-' + id;
        var cancellationToken = cancel + '-' + id;

        emitter.on(responseToken, handleResponse);
        emitter.emit(event, _extends({ id: id, method: method }, parameters));

        return {
            unsubscribe: function unsubscribe() {
                this.dispose();
            },
            dispose: function dispose() {
                if (!disposed) {
                    disposed = true;
                    try {
                        emitter.removeListener(responseToken);
                    } catch (e) {}
                    emitter.removeListener(responseToken, handleResponse);
                    emitter.emit(cancellationToken);
                }
            }
        };
    }

    if (model) {

        var thisPath = void 0,
            callPath = void 0,
            pathSets = void 0,
            jsonGraphEnvelope = void 0;

        if (method === 'set') {
            jsonGraphEnvelope = parameters.jsonGraphEnvelope;
        } else if (method === 'get' || method === 'call') {

            jsonGraphEnvelope = {};
            pathSets = parameters.pathSets;

            if (method === 'call') {
                callPath = parameters.callPath;
                thisPath = callPath.slice(0, -1);
                pathSets = parameters.thisPaths || [];
                pathSets = pathSets.map(function (path) {
                    return thisPath.concat(path);
                });
            }

            model._getPathValuesAsJSONG(model._materialize().withoutDataSource().treatErrorsAsValues(), pathSets, jsonGraphEnvelope, false, false);
        }
        observer.onNext && observer.onNext(jsonGraphEnvelope);
    }

    observer.onCompleted && observer.onCompleted();

    return {
        dispose: function dispose() {},
        unsubscribe: function unsubscribe() {}
    };
}