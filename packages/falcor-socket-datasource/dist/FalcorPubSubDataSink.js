'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FalcorPubSubDataSink = exports.FalcorPubSubDataSink = function FalcorPubSubDataSink(emitter, getDataSource) {
    var event = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'falcor-operation';
    var cancel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'cancel-falcor-operation';

    _classCallCheck(this, FalcorPubSubDataSink);

    this.event = event;
    this.cancel = cancel;
    this.emitter = emitter;
    this.getDataSource = getDataSource;
    this.response = response.bind(this);
};

function response(_ref) {
    var id = _ref.id,
        callPath = _ref.callPath,
        callArgs = _ref.callArgs,
        jsonGraphEnvelope = _ref.jsonGraphEnvelope,
        method = _ref.method,
        pathSets = _ref.pathSets,
        suffixes = _ref.suffixes,
        thisPaths = _ref.thisPaths;
    var emitter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.emitter;


    var parameters = void 0;

    if (method === 'call') {
        parameters = [callPath, callArgs, suffixes, thisPaths];
    } else if (method === 'get') {
        parameters = [pathSets];
    } else if (method === 'set') {
        parameters = [jsonGraphEnvelope];
    } else {
        throw new Error(method + ' is not a valid method');
    }

    var event = this.event,
        cancel = this.cancel,
        getDataSource = this.getDataSource;

    var responseToken = event + '-' + id;
    var cancellationToken = cancel + '-' + id;

    var operation = {},
        disposed = false,
        value = undefined;

    var DataSource = getDataSource(emitter);
    var streaming = DataSource._streaming || false;

    emitter.on(cancellationToken, dispose);

    operation = DataSource[method].apply(DataSource, _toConsumableArray(parameters)).subscribe(function (x) {
        value = x;
        if (!disposed && streaming) {
            emitter.emit(responseToken, { kind: 'N', value: value });
        }
    }, function (error) {
        if (dispose()) {
            if (streaming || value === undefined) {
                emitter.emit(responseToken, { kind: 'E', error: error });
            } else {
                emitter.emit(responseToken, { kind: 'E', error: error, value: value });
            }
        }
    }, function () {
        if (dispose()) {
            if (streaming || value === undefined) {
                emitter.emit(responseToken, { kind: 'C' });
            } else {
                emitter.emit(responseToken, { kind: 'C', value: value });
            }
        }
    });

    function dispose() {
        if (disposed) {
            return false;
        }
        disposed = true;
        emitter.removeListener(cancellationToken, dispose);
        if (!operation) {
            return false;
        }
        if (typeof operation.dispose === 'function') {
            operation.dispose();
        } else if (typeof operation.unsubscribe === 'function') {
            operation.unsubscribe();
        } else if (typeof operation === 'function') {
            operation();
        }
        operation = null;
        return true;
    }
}