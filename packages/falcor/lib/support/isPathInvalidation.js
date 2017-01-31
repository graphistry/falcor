var isObject = require('./../support/isObject');

module.exports = isPathInvalidation;

function isPathInvalidation(pathValue) {
    return isObject(pathValue) && (typeof pathValue.invalidated === 'boolean');
}
