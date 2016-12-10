var now = require('../support/now');
var $now = require('../values/expires-now');
var $never = require('../values/expires-never');

module.exports = function isExpired(node, expireImmediate) {
    var exp = node.$expires;
    if (exp === undefined || exp === null || exp === $never) {
        return false;
    } else if (exp === $now) {
        return expireImmediate;
    }
    return exp < now();
};
