'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = wrapSchemaDescriptor;

var _falcorQuerySyntax = require('@graphistry/falcor-query-syntax');

var _falcorQuerySyntax2 = _interopRequireDefault(_falcorQuerySyntax);

var _flatBufferToRoutes = require('@graphistry/falcor-path-utils/lib/flatBufferToRoutes');

var _flatBufferToRoutes2 = _interopRequireDefault(_flatBufferToRoutes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var QL = _falcorQuerySyntax2.default.routes.QL;
function wrapSchemaDescriptor(_ref) {
    var schema = _ref.schema,
        get = _ref.get,
        set = _ref.set;
    var displayName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Schema';

    return function createSchema(context) {
        function createRoutes(route) {

            var routes = schema(QL, {
                get: get.bind(null, route, displayName),
                set: set.bind(null, route, displayName)
            }, context);

            if (typeof routes === 'string') {
                routes = QL(routes);
            }

            return routes;
        }
        createRoutes.toArray = _flatBufferToRoutes2.default.bind(null, createRoutes);
        return createRoutes;
    };
}
//# sourceMappingURL=wrapSchemaDescriptor.js.map