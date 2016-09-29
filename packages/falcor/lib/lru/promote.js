var EXPIRES_NEVER = require("./../values/expires-never");

// [H] -> Next -> ... -> [T]
// [T] -> Prev -> ... -> [H]
module.exports = function lruPromote(root, object) {
    // Never promote node.$expires === 1.  They cannot expire.
    if (object.$expires === EXPIRES_NEVER) {
        return;
    }

    var head = root[ƒ_head];

    // Nothing is in the cache.
    if (!head) {
        root[ƒ_head] = root[ƒ_tail] = object;
        return;
    }

    if (head === object) {
        return;
    }

    // The item always exist in the cache since to get anything in the
    // cache it first must go through set.
    var prev = object[ƒ_prev];
    var next = object[ƒ_next];
    if (next) {
        next[ƒ_prev] = prev;
    }
    if (prev) {
        prev[ƒ_next] = next;
    }
    object[ƒ_prev] = undefined;

    // Insert into head position
    root[ƒ_head] = object;
    object[ƒ_next] = head;
    head[ƒ_prev] = object;

    // If the item we promoted was the tail, then set prev to tail.
    if (object === root[ƒ_tail]) {
        root[ƒ_tail] = prev;
    }
};
