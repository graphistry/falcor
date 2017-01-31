var isObject = require('./../support/isObject');

module.exports = getType;

function getType(node, anyType) {
    var type = isObject(node) && node.$type || void 0;
    if (anyType && type) {
        return 'branch';
    }
    return type;
}
