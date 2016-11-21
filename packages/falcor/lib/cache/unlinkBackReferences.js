module.exports = function unlinkBackReferences(node) {
    var i = -1, n = node[ƒ_refs_length] || 0;
    while (++i < n) {
        var ref = node[ƒ_ref + i];
        if (ref != null) {
            ref[ƒ_context] = ref[ƒ_ref_index] = node[ƒ_ref + i] = void 0;
        }
    }
    node[ƒ_refs_length] = void 0;
    return node;
};
