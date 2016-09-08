"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = invalidateFalcorJSON;
function invalidateFalcorJSON(data) {
    data.$__hash__$ = undefined;
    return data;
}
//# sourceMappingURL=invalidateFalcorJSON.js.map