import FalcorQuerySyntax from '@graphistry/falcor-query-syntax';
import flatBufferToRoutes from '@graphistry/falcor-path-utils/lib/flatBufferToRoutes';

const { QL } = FalcorQuerySyntax.routes;

export default function wrapSchemaDescriptor({ schema, get, set }, displayName = 'Schema') {
    return function createSchema(context) {
        function createRoutes(route) {

            let routes = schema(QL, {
                get: get.bind(null, route, displayName),
                set: set.bind(null, route, displayName)
            }, context);

            if (typeof routes === 'string') {
                routes = QL(routes);
            }

            return routes;
        }
        createRoutes.toArray = flatBufferToRoutes.bind(null, createRoutes);
        return createRoutes;
    }
}
