var updateNodeAncestors = require('../cache/updateNodeAncestors');

module.exports = function collect(lru, expired, totalArg, max, ratioArg, version) {

    var total = totalArg;
    var ratio = ratioArg;

    if (typeof ratio !== 'number') {
        ratio = 0.75;
    }

    var node, size, targetSize = max * ratio;

    while (node = expired.pop()) {
        total -= (size = node.$size || 0);
        updateNodeAncestors(node, size, lru, version);
    }

    if (total >= max) {
        var prev = lru[f_tail];
        while ((total >= targetSize) && (node = prev)) {
            prev = prev[f_prev];
            total -= (size = node.$size || 0);
            updateNodeAncestors(node, size, lru, version);
        }

        lru[f_tail] = node;
        if (node == null) {
            lru[f_head] = undefined;
        } else {
            node[f_next] = undefined;
        }
    }
};
