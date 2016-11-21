var removeNode = require("../cache/removeNode");
var updateNodeAncestors = require("../cache/updateNodeAncestors");

module.exports = function collect(lru, expired, totalArg, max, ratioArg, version) {

    var total = totalArg;
    var ratio = ratioArg;

    if (typeof ratio !== "number") {
        ratio = 0.75;
    }

    var shouldUpdate = typeof version === "number";
    var targetSize = max * ratio;
    var parent, node, size;

    node = expired.pop();

    while (node) {
        size = node.$size || 0;
        total -= size;
        if (shouldUpdate === true) {
            updateNodeAncestors(node, size, lru, version);
        } else if (parent = node[ƒ_parent]) {  // eslint-disable-line no-cond-assign
            removeNode(node, parent, node[ƒ_key], lru);
        }
        node = expired.pop();
    }

    if (total >= max) {
        var prev = lru[ƒ_tail];
        node = prev;
        while ((total >= targetSize) && node) {
            prev = prev[ƒ_prev];
            size = node.$size || 0;
            total -= size;
            if (shouldUpdate === true) {
                updateNodeAncestors(node, size, lru, version);
            }
            node = prev;
        }

        lru[ƒ_tail] = lru[ƒ_prev] = node;
        if (node == null) {
            lru[ƒ_head] = lru[ƒ_next] = undefined;
        } else {
            node[ƒ_next] = undefined;
        }
    }
};
