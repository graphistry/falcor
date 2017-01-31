var clone = require('./clone');
var isInternal = require('../internal/isInternal');

module.exports = getCache;

function getCache(model, cache) {
    return getCacheInternal(cache, {}, model._boxed, model._materialized);
}

function getCacheInternal(node, jsonArg, boxValues, materialized) {

    var json = jsonArg, type, value;

    if (!node || typeof node !== 'object') {
        return node;
    } else if (type = node.$type) {

        if (undefined === (value = node.value)) {
            if (materialized) {
                value = { $type: $atom };
            } else if (node[f_wrapped_value]) {
                value = clone(node);
            }
        }
        // boxValues always clones the node
        else if (boxValues || !(
            /**
             * getCache should always clone:
             * - refs
             * - errors
             * - atoms we didn't create
             * - atoms we created to wrap Objects
             **/
            $ref !== type &&
            $error !== type &&
            node[f_wrapped_value] &&
            typeof value !== 'object')) {
            value = clone(node);
        }
        return value;
    }

    var keys = Object.keys(node);
    var keysLen = keys.length, keyIndex = -1;

    while (++keyIndex < keysLen) {
        var key = keys[keyIndex];
        if (key !== '$size' && !isInternal(key) && undefined !== (value =
            getCacheInternal(node[key], json && json[key], boxValues, materialized))) {
            if (json === undefined) {
                json = {};
            }
            json[key] = value;
        }
    }

    return json;
}
