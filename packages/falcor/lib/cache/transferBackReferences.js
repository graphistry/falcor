module.exports = function transferBackReferences(fromNode, destNode) {
    var fromNodeRefsLength = fromNode[f_refs_length] || 0,
        destNodeRefsLength = destNode[f_refs_length] || 0,
        i = -1;
    while (++i < fromNodeRefsLength) {
        var ref = fromNode[f_ref + i];
        if (ref !== void 0) {
            ref[f_context] = destNode;
            destNode[f_ref + (destNodeRefsLength + i)] = ref;
            fromNode[f_ref + i] = void 0;
        }
    }
    destNode[f_refs_length] = fromNodeRefsLength + destNodeRefsLength;
    fromNode[f_refs_length] = void 0;
    return destNode;
};
