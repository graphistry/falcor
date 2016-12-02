'use strict';

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = mapToFalcorJSON;

var _falcor = require('@graphistry/falcor');

function mapToFalcorJSON(data, falcor) {
    if (!data || (typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object') {
        data = { __proto__: _falcor.FalcorJSON.prototype };
        if (falcor && falcor._recycleJSON) {
            if (falcor._seed) {
                falcor._seed.json = data;
            } else {
                falcor._seed = { json: data, __proto__: _falcor.FalcorJSON.prototype };
            }
        }
    } else if (!(data instanceof _falcor.FalcorJSON)) {
        data.__proto__ = _falcor.FalcorJSON.prototype;
        if (falcor && falcor._recycleJSON) {
            if (falcor._seed) {
                falcor._seed.json = data;
            } else {
                falcor._seed = { json: data, __proto__: _falcor.FalcorJSON.prototype };
            }
        }
    }
    return data;
}
//# sourceMappingURL=mapToFalcorJSON.js.map