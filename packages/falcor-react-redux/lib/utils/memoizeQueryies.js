'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = memoizeQueryies;

var _pegjsUtil = require('pegjs-util');

var _falcorQuerySyntax = require('@graphistry/falcor-query-syntax');

var _falcorQuerySyntax2 = _interopRequireDefault(_falcorQuerySyntax);

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
            entry = map[query] = (0, _extends3.default)({
                query: query }, (0, _pegjsUtil.parse)(_falcorQuerySyntax2.default.parser, query));
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