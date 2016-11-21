module.exports = function createHardlink(from, to) {

    // create a back reference
    var backRefs = to[ƒ_refs_length] || 0;
    to[ƒ_ref + backRefs] = from;
    to[ƒ_refs_length] = backRefs + 1;

    // create a hard reference
    from[ƒ_ref_index] = backRefs;
    from[ƒ_context] = to;
};
