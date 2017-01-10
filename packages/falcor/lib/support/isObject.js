module.exports = isObject;

function isObject(value) {
    return value !== null && typeof value === 'object';
}
