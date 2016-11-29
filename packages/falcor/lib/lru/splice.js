module.exports = function lruSplice(root, object) {

    // Its in the cache.  Splice out.
    var prev = object[f_prev];
    var next = object[f_next];
    if (next) {
        next[f_prev] = prev;
    }
    if (prev) {
        prev[f_next] = next;
    }
    object[f_prev] = object[f_next] = undefined;

    if (object === root[f_head]) {
        root[f_head] = next;
    }
    if (object === root[f_tail]) {
        root[f_tail] = prev;
    }
};
