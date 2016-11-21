module.exports = function updateBackReferenceVersions(nodeArg, version) {
    var stack = [nodeArg];
    var count = 0;
    do {
        var node = stack[count];
        if (node && node[ƒ_version] !== version) {
            node[ƒ_version] = version;
            stack[count++] = node[ƒ_parent];
            var i = -1;
            var n = node[ƒ_refs_length] || 0;
            while (++i < n) {
                stack[count++] = node[ƒ_ref + i];
            }
        }
    } while (--count > -1);
    return nodeArg;
};
