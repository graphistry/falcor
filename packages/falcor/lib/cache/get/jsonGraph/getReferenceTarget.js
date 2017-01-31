var arr = new Array(2);
var clone = require('../../clone');
var inlineValue = require('./inlineValue');
var promote = require('../../../lru/promote');
var isExpired = require('../../isExpired');
var createHardlink = require('../../createHardlink');
var CircularReferenceError = require('../../../errors/CircularReferenceError');

module.exports = getReferenceTarget;

/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
function getReferenceTarget(root, refArg, modelRoot, seed, expireImmediate) {

    promote(modelRoot, refArg);

    var context,
        ref = refArg,
        key, type, depth = 0,
        node = root, path = ref.value,
        copy = path, length = path.length;

    do {
        if (depth === 0 && undefined !== (context = ref[f_context])) {
            node = context;
            depth = length;
        } else {
            key = path[depth++];
            if (undefined === (node = node[key])) {
                break;
            }
        }

        if (depth === length) {
            type = node.$type;
            // If the reference points to an expired
            // value node, don't create a hard-link.
            if (undefined !== type && isExpired(node, expireImmediate)) {
                break;
            }
            // If a reference points to itself, throw an error.
            else if (node === ref) {
                throw new CircularReferenceError(path);
            }
            // If the node we land on isn't the existing ref context,
            // create a hard-link between the reference and the node
            // it points to.
            else if (node !== context) {
                createHardlink(ref, node);
            }

            // If the reference points to another ref, follow the new ref
            // by resetting the relevant state and continuing from the top.
            if (type === $ref) {

                promote(modelRoot, node);

                seed && inlineValue(clone(node), path, length, seed);

                depth = 0;
                ref = node;
                node = root;
                path = copy = ref.value;
                length = path.length;

                continue;
            }
            break;
        } else if (undefined !== node.$type) {
            break;
        }
    } while (true);

    if (depth < length && undefined !== node) {
        length = depth;
    }

    depth = -1;
    path = new Array(length);
    while (++depth < length) {
        path[depth] = copy[depth];
    }

    arr[0] = node;
    arr[1] = path;

    return arr;
}
/* eslint-enable */
