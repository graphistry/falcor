module.exports = updateBackReferenceVersions;

function updateBackReferenceVersions(nodeArg, version) {
    var node = nodeArg, stack = [], count = 0, ref, i, n;
    do {
        i = -1;
        ref = node[f_parent];
        node[f_version] = version;
        n = node[f_refs_length] || 0;
        do {
            if (ref && ref[f_version] !== version) {
                stack[count++] = ref;
            }
            if (++i < n) {
                ref = node[f_ref + i];
                continue;
            }
            break;
        } while (true);
    } while (node = stack[--count]);
    return nodeArg;
}
