module.exports = createHardlink;

function createHardlink(from, to) {

    // create a back reference
    var backRefs = to[f_refs_length] || 0;
    to[f_ref + backRefs] = from;
    to[f_refs_length] = backRefs + 1;

    // create a hard reference
    from[f_ref_index] = backRefs;
    from[f_context] = to;
}
