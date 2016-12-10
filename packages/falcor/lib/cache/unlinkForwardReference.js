module.exports = function unlinkForwardReference(reference) {
    var destination = reference[f_context];
    if (destination) {
        var i = (reference[f_ref_index] || 0) - 1,
            n = (destination[f_refs_length] || 0) - 1;
        while (++i <= n) {
            destination[f_ref + i] = destination[f_ref + (i + 1)];
        }
        destination[f_refs_length] = n;
        reference[f_ref_index] = reference[f_context] = destination = void 0;
    }
    return reference;
};
