module.exports = insertNode;

function insertNode(node, parent, key, version, optimizedPath) {
    node[f_key] = key;
    node[f_parent] = parent;

    if (version !== undefined) {
        node[f_version] = version;
    }
    if (!node[f_abs_path]) {
        node[f_abs_path] = optimizedPath.slice(0, optimizedPath.index).concat(key);
    }

    parent[key] = node;

    return node;
}
