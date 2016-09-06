'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = memoizeQueryies;

var _falcorQuerySyntax = require('@graphistry/falcor-query-syntax');

var _falcorQuerySyntax2 = _interopRequireDefault(_falcorQuerySyntax);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function memoizeQueryies() {
    var limit = arguments.length <= 0 || arguments[0] === undefined ? 100 : arguments[0];

    var count = 0;
    var map = {};
    var lru = {};
    return function memoizedQuerySyntax(query) {
        var entry = map[query];
        if (entry === undefined) {
            count++;
            entry = map[query] = { query: query, paths: (0, _falcorQuerySyntax2.default)(query) };
        }
        promote(lru, entry);
        if (count > limit) {
            delete map[lru.tail.query];
            splice(lru, lru.tail);
        }
        return entry.paths;
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