module.exports = function unlinkBackReferences(node) {
    var i = -1, n = node[f_refs_length] || 0;
    while (++i < n) {
        var ref = node[f_ref + i];
        if (ref != null) {
            ref[f_context] = ref[f_ref_index] = node[f_ref + i] = void 0;
        }
    }
    node[f_refs_length] = void 0;
    return node;
};
