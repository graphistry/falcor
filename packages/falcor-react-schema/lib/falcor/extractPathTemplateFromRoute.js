'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = extractPathTemplateFromRoute;
function extractPathTemplateFromRoute(route) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$idMatcher = _ref.idMatcher,
        idMatcher = _ref$idMatcher === undefined ? defaultIdMatcher : _ref$idMatcher,
        _ref$listMatcher = _ref.listMatcher,
        listMatcher = _ref$listMatcher === undefined ? defaultListMatcher : _ref$listMatcher,
        _ref$mapIdToName = _ref.mapIdToName,
        mapIdToName = _ref$mapIdToName === undefined ? defaultMapIdToName : _ref$mapIdToName;

    var componentIndex = -2;
    var pathTemplate = [];
    var componentLen = route.length;

    while ((componentIndex += 2) < componentLen) {
        if (listMatcher(route[componentIndex]) && idMatcher(route[componentIndex + 1])) {
            var list = route[componentIndex];
            var name = mapIdToName(list);
            var ids = route[componentIndex + 1].name;
            pathTemplate.push({
                list: list, ids: ids, name: name,
                listIndex: componentIndex,
                idsIndex: componentIndex + 1
            });
        }
    }

    return pathTemplate;
}

function defaultIdMatcher(token) {
    return token.named && ~token.name.indexOf('Ids');
}

function defaultListMatcher(token) {
    return typeof token === 'string' && ~token.indexOf('sById');
}

function defaultMapIdToName(token) {
    return token.slice(0, token.indexOf('sById'));
}
//# sourceMappingURL=extractPathTemplateFromRoute.js.map