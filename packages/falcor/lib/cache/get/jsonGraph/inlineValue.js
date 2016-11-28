module.exports = inlineJSONGraphValue;

/* eslint-disable no-constant-condition */
function inlineJSONGraphValue(node, path, length, seed, branch) {

    var key, depth = 0, prev,
        curr = seed.jsonGraph;

    if (!curr) {
        seed.jsonGraph = curr = {};
    }

    do {
        prev = curr;
        key = path[depth++];
        if (depth >= length) {
            curr = prev[key] = branch !== true ? node : prev[key] || {};
            break;
        }
        curr = prev[key] || (prev[key] = {});
    } while (true);

    return curr;
}
/* eslint-enable */
