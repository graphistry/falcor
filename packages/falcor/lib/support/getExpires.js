var isObject = require('./isObject');
module.exports = getSize;

function getSize(node) {
    return isObject(node) && node.$expires || undefined;
}
