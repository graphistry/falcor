var EXPIRES_NEVER = require('./../values/expires-never');

module.exports = lruPromote;

// [H] -> Next -> ... -> [T]
// [T] -> Prev -> ... -> [H]
function lruPromote(lru, node) {
    // Never promote node.$expires === 1.  They cannot expire.
    if (node.$expires === EXPIRES_NEVER) {
        return;
    }

    var head = lru[f_head];

    // Nothing is in the cache.
    if (!head) {
        lru[f_head] = lru[f_tail] = node;
        return;
    }

    if (head === node) {
        return;
    }

    // The item always exist in the cache since to get anything in the
    // cache it first must go through set.
    var prev = node[f_prev];
    var next = node[f_next];
    if (next) {
        next[f_prev] = prev;
    }
    if (prev) {
        prev[f_next] = next;
    }
    node[f_prev] = undefined;

    // Insert into head position
    lru[f_head] = node;
    node[f_next] = head;
    head[f_prev] = node;

    // If the item we promoted was the tail, then set prev to tail.
    if (node === lru[f_tail]) {
        lru[f_tail] = prev;
    }
};
