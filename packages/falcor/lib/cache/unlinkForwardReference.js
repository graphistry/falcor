module.exports = function unlinkForwardReference(reference) {
    var destination = reference[ƒ_context];
    if (destination) {
        var i = (reference[ƒ_ref_index] || 0) - 1,
            n = (destination[ƒ_refs_length] || 0) - 1;
        while (++i <= n) {
            destination[ƒ_ref + i] = destination[ƒ_ref + (i + 1)];
        }
        destination[ƒ_refs_length] = n;
        reference[ƒ_ref_index] = reference[ƒ_context] = destination = void 0;
    }
    return reference;
};
