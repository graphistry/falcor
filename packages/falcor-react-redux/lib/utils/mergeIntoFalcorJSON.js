"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = mergeIntoFalcorJSON;
function mergeIntoFalcorJSON(data, json) {
    data.$__key = json.$__key;
    data.$__path = json.$__path;
    data.$__refPath = json.$__refPath;
    data.$__version = json.$__version;
    data.$__keysPath = json.$__keysPath;
    data.$__keyDepth = json.$__keyDepth;
    data.$__toReference = json.$__toReference;
    return (0, _assign2.default)(data, json);
}
//# sourceMappingURL=mergeIntoFalcorJSON.js.map