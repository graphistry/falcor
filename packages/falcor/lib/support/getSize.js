var isObject = require('./../support/isObject');
module.exports = getSize;

function getSize(node) {
    return isObject(node) && node.$size || 0;
}
