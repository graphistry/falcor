'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FalcorPubSubDataSink = exports.FalcorPubSubDataSink = function FalcorPubSubDataSink(socket, getDataSource) {
    var event = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'falcor-operation';
    var cancel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'cancel-falcor-operation';

    _classCallCheck(this, FalcorPubSubDataSink);

    this.event = event;
    this.cancel = cancel;
    this.socket = socket;
    this.getDataSource = getDataSource;
    this.response = response.bind(this);
};

function response(_ref) {
    var id = _ref.id;
    var args = _ref.args;
    var functionPath = _ref.functionPath;
    var jsonGraphEnvelope = _ref.jsonGraphEnvelope;
    var method = _ref.method;
    var pathSets = _ref.pathSets;
    var refSuffixes = _ref.refSuffixes;
    var thisPaths = _ref.thisPaths;
    var socket = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.socket;


    var parameters = void 0;

    if (method === "call") {
        parameters = [functionPath, args, refSuffixes, thisPaths];
    } else if (method === "get") {
        parameters = [pathSets];
    } else if (method === "set") {
        parameters = [jsonGraphEnvelope];
    } else {
        throw new Error(method + ' is not a valid method');
    }

    var event = this.event;
    var cancel = this.cancel;
    var getDataSource = this.getDataSource;

    var responseToken = event + '-' + id;
    var cancellationToken = cancel + '-' + id;

    var results = null;
    var operationIsDone = false;
    var _handleCancellationForId = null;

    var DataSource = getDataSource(socket);
    var operation = DataSource[method].apply(DataSource, _toConsumableArray(parameters)).subscribe(function (data) {
        results = data;
    }, function (error) {
        operationIsDone = true;
        if (_handleCancellationForId !== null) {
            socket.off(cancellationToken, _handleCancellationForId);
        }
        _handleCancellationForId = null;
        socket.emit(responseToken, _extends({ error: error }, results));
    }, function () {
        operationIsDone = true;
        if (_handleCancellationForId !== null) {
            socket.off(cancellationToken, _handleCancellationForId);
        }
        _handleCancellationForId = null;
        socket.emit(responseToken, _extends({}, results));
    });

    if (!operationIsDone) {
        _handleCancellationForId = function handleCancellationForId() {
            if (operationIsDone === true) {
                return;
            }
            operationIsDone = true;
            socket.off(cancellationToken, _handleCancellationForId);
            if (typeof operation.dispose === "function") {
                operation.dispose();
            } else if (typeof operation.unsubscribe === "function") {
                operation.unsubscribe();
            }
        };
        socket.on(cancellationToken, _handleCancellationForId);
    }
}