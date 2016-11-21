module.exports = function transferBackReferences(fromNode, destNode) {
    var fromNodeRefsLength = fromNode[ƒ_refs_length] || 0,
        destNodeRefsLength = destNode[ƒ_refs_length] || 0,
        i = -1;
    while (++i < fromNodeRefsLength) {
        var ref = fromNode[ƒ_ref + i];
        if (ref !== void 0) {
            ref[ƒ_context] = destNode;
            destNode[ƒ_ref + (destNodeRefsLength + i)] = ref;
            fromNode[ƒ_ref + i] = void 0;
        }
    }
    destNode[ƒ_refs_length] = fromNodeRefsLength + destNodeRefsLength;
    fromNode[ƒ_refs_length] = void 0;
    return destNode;
};
