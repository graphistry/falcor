'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = memoizeQueryies;

var _pegjsUtil = require('pegjs-util');

var _falcorQuerySyntax = require('@graphistry/falcor-query-syntax');

var _falcorQuerySyntax2 = _interopRequireDefault(_falcorQuerySyntax);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function memoizeQueryies() {
    var limit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

    var count = 0;
    var map = {};
    var lru = {};
    return function memoizedQuerySyntax(query) {
        var entry = map[query];
        if (entry === undefined) {
            if (++count > limit) {
                delete map[lru.tail.query];
                splice(lru, lru.tail);
            }
            entry = map[query] = _extends({ query: query }, (0, _pegjsUtil.parse)(_falcorQuerySyntax2.default.parser, query));
        } else if (entry.error) {
            entry = map[query] = _extends({ query: query }, (0, _pegjsUtil.parse)(_falcorQuerySyntax2.default.parser, query));
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