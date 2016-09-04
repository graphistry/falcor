var template = require('./template');
var parser = require('./route-parser');

module.exports = toRoutes;

function toRoutes() {
    return pathmapToRoutes([], [], parser.parse(template.apply(null, arguments)));
}

function pathmapToRoutes(routes, route, maps) {

    var leaf = [];
    var keys = maps.$keys;
    var keysLen = keys.length;
    var keysIndex = -1, key, len;

    while (++keysIndex < keysLen) {

        var rest = maps[keysIndex];
        var keyset = keys[keysIndex];

        if (!rest) {
            leaf.push(keyset);
        } else {
            if (typeof keyset === 'object') {
                if ('to' in keyset || 'from' in keyset || 'length' in keyset) {
                    keyset = { type: 'integers', named: false };
                } else if (keyset.$keys) {
                    keyset = keyset.$keys[0];
                }
            }
            pathmapToRoutes(routes, route.concat([keyset]), rest);
        }
    }

    if (leaf.length === 1) {
        routes.push(route.concat(leaf));
    } else if (leaf.length > 1) {
        routes.push(route.concat([leaf]));
    }

    return routes;
}
