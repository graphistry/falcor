export default function extractPathTemplateFromRoute(route, {
    idMatcher = defaultIdMatcher,
    listMatcher = defaultListMatcher,
    mapIdToName = defaultMapIdToName
} = {}) {

    let componentIndex = -2;
    const pathTemplate = [];
    const componentLen = route.length;

    while ((componentIndex += 2) < componentLen) {
        if (listMatcher(route[componentIndex]) && idMatcher(route[componentIndex + 1])) {
            const list = route[componentIndex];
            const name = mapIdToName(list);
            const ids = route[componentIndex + 1].name;
            pathTemplate.push({
                list, ids, name,
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
