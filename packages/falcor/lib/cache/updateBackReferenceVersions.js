module.exports = function updateBackReferenceVersions(nodeArg, version) {
    var stack = [nodeArg];
    var count = 0;
    do {
        var node = stack[count];
        if (node && node[f_version] !== version) {
            node[f_version] = version;
            stack[count++] = node[f_parent];
            var i = -1;
            var n = node[f_refs_length] || 0;
            while (++i < n) {
                stack[count++] = node[f_ref + i];
            }
        }
    } while (--count > -1);
    return nodeArg;
};
