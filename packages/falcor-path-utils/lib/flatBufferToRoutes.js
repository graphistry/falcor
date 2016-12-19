var typeofObject = 'object';
var typeofFunction = 'function';

module.exports = flatBufferToRoutes;

function flatBufferToRoutes(seed, routes, route) {

    route = route || [];
    routes = routes || [];

    var keys = seed['$keys'];
    var keysLen = keys.length;
    var keysIndex = -1, key, len;

    while (++keysIndex < keysLen) {

        var next = seed[keysIndex];
        var keyset = keys[keysIndex];
        var nextRoute = route.concat([keyset]);

        if (typeof next === typeofFunction) {
            routes.push(Object.assign({ route: nextRoute, }, next(nextRoute)));
        } else if (!next || typeof next !== typeofObject) {
            throw new Error('No route handler found for ' + JSON.stringify(nextRoute));
        } else if (next.get || next.set || next.call) {
            routes.push(Object.assign({}, { route: nextRoute }, next));
        } else {
            flatBufferToRoutes(next, routes, nextRoute);
        }
    }

    return routes;
}
