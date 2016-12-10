var removeNode = require('../cache/removeNode');
var updateNodeAncestors = require('../cache/updateNodeAncestors');

module.exports = function collect(lru, expired, totalArg, max, ratioArg, version) {

    var total = totalArg;
    var ratio = ratioArg;

    if (typeof ratio !== 'number') {
        ratio = 0.75;
    }

    var shouldUpdate = typeof version === 'number';
    var targetSize = max * ratio;
    var parent, node, size;

    node = expired.pop();

    while (node) {
        size = node.$size || 0;
        total -= size;
        if (shouldUpdate === true) {
            updateNodeAncestors(node, size, lru, version);
        } else if (parent = node[f_parent]) {  // eslint-disable-line no-cond-assign
            removeNode(node, parent, node[f_key], lru);
        }
        node = expired.pop();
    }

    if (total >= max) {
        var prev = lru[f_tail];
        node = prev;
        while ((total >= targetSize) && node) {
            prev = prev[f_prev];
            size = node.$size || 0;
            total -= size;
            if (shouldUpdate === true) {
                updateNodeAncestors(node, size, lru, version);
            }
            node = prev;
        }

        lru[f_tail] = lru[f_prev] = node;
        if (node == null) {
            lru[f_head] = lru[f_next] = undefined;
        } else {
            node[f_next] = undefined;
        }
    }
};
