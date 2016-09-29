module.exports = function insertNode(node, parent, key, version, optimizedPath) {
    node[ƒ_key] = key;
    node[ƒ_parent] = parent;

    if (version !== undefined) {
        node[ƒ_version] = version;
    }
    if (!node[ƒ_abs_path]) {
        node[ƒ_abs_path] = optimizedPath.slice(0, optimizedPath.index).concat(key);
    }

    parent[key] = node;

    return node;
};
