'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _setPrototypeOf = require('babel-runtime/core-js/object/set-prototype-of');

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PostMessageDataSource = undefined;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _PostMessageEmitter = require('./PostMessageEmitter');

var _FalcorPubSubDataSource = require('./FalcorPubSubDataSource');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass; }

var PostMessageDataSource = exports.PostMessageDataSource = function (_FalcorPubSubDataSour) {
    _inherits(PostMessageDataSource, _FalcorPubSubDataSour);

    function PostMessageDataSource(source, target, model) {
        var targetOrigin = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '*';
        var event = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'falcor-operation';
        var cancel = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'cancel-falcor-operation';

        _classCallCheck(this, PostMessageDataSource);

        return _possibleConstructorReturn(this, (PostMessageDataSource.__proto__ || (0, _getPrototypeOf2.default)(PostMessageDataSource)).call(this, new _PostMessageEmitter.PostMessageEmitter(source, target, targetOrigin, event, cancel), model, event, cancel));
    }

    return PostMessageDataSource;
}(_FalcorPubSubDataSource.FalcorPubSubDataSource);