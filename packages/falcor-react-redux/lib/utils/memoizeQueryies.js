'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = memoizeQueryies;

var _pegjsUtil = require('pegjs-util');

var _falcorQuerySyntax = require('@graphistry/falcor-query-syntax');

var _toFlatBuffer = require('@graphistry/falcor-path-utils/lib/toFlatBuffer');

var _toFlatBuffer2 = _interopRequireDefault(_toFlatBuffer);

var _flatBufferToPaths = require('@graphistry/falcor-path-utils/lib/flatBufferToPaths');

var _flatBufferToPaths2 = _interopRequireDefault(_flatBufferToPaths);

var _computeFlatBufferHash = require('@graphistry/falcor-path-utils/lib/computeFlatBufferHash');

var _computeFlatBufferHash2 = _interopRequireDefault(_computeFlatBufferHash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function memoizeQueryies() {
    var limit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    var count = 0;
    var map = {},
        lru = {};
    return function memoizedQuerySyntax(query) {
        var entry = map[query];
        if (entry === undefined && ++count > limit) {
            delete map[lru.tail.query];
            splice(lru, lru.tail);
        }
        if (!entry || entry.error) {
            var result = (0, _pegjsUtil.parse)(_falcorQuerySyntax.paths.Parser, query);
            if (!result.error) {
                // Turn the computed AST into paths, then turn it back into an
                // AST so we collapse adjacent nodes.
                result.ast = (0, _computeFlatBufferHash2.default)((0, _toFlatBuffer2.default)((0, _flatBufferToPaths2.default)(result.ast)));
            }
            entry = map[query] = (0, _extends3.default)({ query: query }, result);
        }
        promote(lru, entry);
        return entry;
    };
}

function promote(lru, entry) {
    var head = lru.head;
    if (!head) {
        lru.head = lru.tail = entry;
        return;
    } else if (head === entry) {
        return;
    }
    var prev = entry.prev;
    var next = entry.next;
    next && (next.prev = prev);
    prev && (prev.next = next);
    entry.prev = undefined;
    // Insert into head position
    lru.head = entry;
    entry.next = head;
    head.prev = entry;
    // If the item we promoted was the tail, then set prev to tail.
    if (entry === lru.tail) {
        lru.tail = prev;
    }
}

function splice(lru, entry) {
    var prev = entry.prev;
    var next = entry.next;
    next && (next.prev = prev);
    prev && (prev.next = next);
    entry.prev = entry.next = undefined;
    if (entry === lru.head) {
        lru.head = next;
    }
    if (entry === lru.tail) {
        lru.tail = prev;
    }
}
//# sourceMappingURL=memoizeQueryies.js.map