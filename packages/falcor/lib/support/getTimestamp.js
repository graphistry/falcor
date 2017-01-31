var isObject = require('./../support/isObject');
module.exports = getTimestamp;

function getTimestamp(node) {
    return isObject(node) && node.$timestamp || undefined;
}
