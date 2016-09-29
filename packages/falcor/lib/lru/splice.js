module.exports = function lruSplice(root, object) {

    // Its in the cache.  Splice out.
    var prev = object[ƒ_prev];
    var next = object[ƒ_next];
    if (next) {
        next[ƒ_prev] = prev;
    }
    if (prev) {
        prev[ƒ_next] = next;
    }
    object[ƒ_prev] = object[ƒ_next] = undefined;

    if (object === root[ƒ_head]) {
        root[ƒ_head] = next;
    }
    if (object === root[ƒ_tail]) {
        root[ƒ_tail] = prev;
    }
};
