var splice = require("./../lru/splice");

module.exports = function expireNode(node, expired, lru) {
    if (!node[ƒ_invalidated]) {
        node[ƒ_invalidated] = true;
        expired.push(node);
        splice(lru, node);
    }
    return node;
};
