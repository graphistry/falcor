module.exports = transferBackReferences;

function transferBackReferences(fromNode, destNode) {
    var fromNodeRefsLength = fromNode[f_refs_length] || 0,
        destNodeRefsLength = destNode[f_refs_length] || 0,
        i = -1;
    while (++i < fromNodeRefsLength) {
        var ref = fromNode[f_ref + i];
        if (ref !== undefined) {
            ref[f_context] = destNode;
            destNode[f_ref + (destNodeRefsLength + i)] = ref;
            fromNode[f_ref + i] = undefined;
        }
    }
    destNode[f_refs_length] = fromNodeRefsLength + destNodeRefsLength;
    fromNode[f_refs_length] = undefined;
    return destNode;
}
