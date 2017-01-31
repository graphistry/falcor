module.exports = lruSplice;

function lruSplice(lru, node) {

    // Its in the cache.  Splice out.
    var prev = node[f_prev];
    var next = node[f_next];
    if (next) {
        next[f_prev] = prev;
    }
    if (prev) {
        prev[f_next] = next;
    }
    node[f_prev] = node[f_next] = undefined;

    if (node === lru[f_head]) {
        lru[f_head] = next;
    }
    if (node === lru[f_tail]) {
        lru[f_tail] = prev;
    }
}
