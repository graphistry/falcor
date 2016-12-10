var EXPIRES_NEVER = require('./../values/expires-never');

// [H] -> Next -> ... -> [T]
// [T] -> Prev -> ... -> [H]
module.exports = function lruPromote(root, object) {
    // Never promote node.$expires === 1.  They cannot expire.
    if (object.$expires === EXPIRES_NEVER) {
        return;
    }

    var head = root[f_head];

    // Nothing is in the cache.
    if (!head) {
        root[f_head] = root[f_tail] = object;
        return;
    }

    if (head === object) {
        return;
    }

    // The item always exist in the cache since to get anything in the
    // cache it first must go through set.
    var prev = object[f_prev];
    var next = object[f_next];
    if (next) {
        next[f_prev] = prev;
    }
    if (prev) {
        prev[f_next] = next;
    }
    object[f_prev] = undefined;

    // Insert into head position
    root[f_head] = object;
    object[f_next] = head;
    head[f_prev] = object;

    // If the item we promoted was the tail, then set prev to tail.
    if (object === root[f_tail]) {
        root[f_tail] = prev;
    }
};
