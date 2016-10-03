'use strict';

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

exports.default = mapToFalcorJSON;

var _falcorMetadataKey = require('./falcorMetadataKey');

var _falcorMetadataKey2 = _interopRequireDefault(_falcorMetadataKey);

var _falcor = require('@graphistry/falcor');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mapToFalcorJSON(data, falcor) {
    var dataProto = void 0;
    if (!data || (typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object') {
        dataProto = new _falcor.JSONProto();
        data = (0, _create2.default)(dataProto);
    } else if (!(data instanceof _falcor.JSONProto)) {
        dataProto = new _falcor.JSONProto(data[_falcorMetadataKey2.default]);
        delete data[_falcorMetadataKey2.default];
        data.__proto__ = dataProto;
    }
    if (falcor && falcor._recycleJSON) {
        falcor._seed = { json: data };
    }
    return data;
}
//# sourceMappingURL=mapToFalcorJSON.js.map