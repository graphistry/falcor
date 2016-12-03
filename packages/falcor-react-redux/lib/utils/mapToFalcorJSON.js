'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.default = mapToFalcorJSON;

var _falcor = require('@graphistry/falcor');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mapToFalcorJSON(data, falcor) {
    if (!data || (typeof data === 'undefined' ? 'undefined' : (0, _typeof3.default)(data)) !== 'object') {
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