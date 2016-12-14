module.exports = flatBufferToRoutes;

function flatBufferToRoutes(seed, routes, route) {

    route = route || [];
    routes = routes || [];

    var leaf = [];
    var atEnd = false;
    var keys = seed['$keys'];
    var keysLen = keys.length;
    var keysIndex = -1, key, len;

    while (++keysIndex < keysLen) {

        var next = seed[keysIndex];
        var keyset = keys[keysIndex];

        if (!next || typeof next !== 'object') {
            throw new Error('No route handler found for ' + JSON.stringify(route));
        } else if (next.get || next.set || next.call) {
            routes.push(Object.assign({}, next, {
                route: route.concat([keyset])
            }));
        } else {
            flatBufferToRoutes(next, routes, route.concat([keyset]));
        }
    }

    return routes;
}
