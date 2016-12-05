var isArray = Array.isArray;
var now = require('../support/now');
var clone = require('./../support/clone');
var getSize = require('./../support/getSize');
var getExpires = require('../support/getExpires');
var expiresNow = require('../values/expires-now');

var atomSize = 50;

module.exports = function wrapNode(nodeArg, typeArg, value) {

    var size = 0;
    var node = nodeArg;
    var type = typeArg;

    if (type) {
        var modelCreated = node[f_wrapped_value];
        node = clone(node);
        size = getSize(node);
        node.$type = type;
        node[f_prev] = undefined;
        node[f_next] = undefined;
        node[f_wrapped_value] = modelCreated || false;
    } else {
        node = { $type: $atom, value: value };
        node[f_prev] = undefined;
        node[f_next] = undefined;
        node[f_wrapped_value] = true;
    }

    if (value == null) {
        size = atomSize + 1;
    } else if (size == null || size <= 0) {
        switch (typeof value) {
            case 'object':
                if (isArray(value)) {
                    size = atomSize + value.length;
                } else {
                    size = atomSize + 1;
                }
                break;
            case 'string':
                size = atomSize + value.length;
                break;
            default:
                size = atomSize + 1;
                break;
        }
    }

    var expires = getExpires(node);

    if (typeof expires === 'number' && expires < expiresNow) {
        node.$expires = now() + (expires * -1);
    }

    node.$size = size;

    return node;
};
