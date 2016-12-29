var isArray = Array.isArray;

module.exports = flatBufferToRoutes;

function flatBufferToRoutes(seed, routes, route) {

    route = route || [];
    routes = routes || [];

    if ('function' === typeof seed) {
        seed = seed(route);
    }

    if (!seed || 'object' !== typeof seed) {
        throw new Error('No route handler found for ' + JSON.stringify(route));
    } else if (seed.get || seed.set || seed.call) {
        routes.push(Object.assign({}, { route: route }, seed));
    } else if (isArray(seed)) {
        routes.push.apply(routes, seed);
    } else {

        var keys = seed['$keys'];
        var keysLen = keys.length;
        var keysIndex = -1, key, len;

        while (++keysIndex < keysLen) {

            var next = seed[keysIndex];
            var keyset = keys[keysIndex];

            flatBufferToRoutes(
                next, routes,
                keyset === undefined ?
                    route : route.concat([keyset]));
        }
    }

    return routes;
}
