var splice = require('./../lru/splice');

module.exports = expireNode;

function expireNode(node, expired, lru) {
    if (!node[f_invalidated]) {
        node[f_invalidated] = true;
        expired.push(node);
        splice(lru, node);
    }
    return node;
}
