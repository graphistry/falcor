import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/empty';
import extractPathTemplateFromRoute from './extractPathTemplateFromRoute';

const isArray = Array.isArray;
const slice = Array.prototype.slice;

export default function set(route, displayName, options = {}, mapValue) {

    if (typeof options === 'function') {
        options = { service: options };
    }

    if (!options.mapValue && 'function' === typeof mapValue) {
        options.mapValue = mapValue;
    }

    const service = options.service || defaultService;
    const getInitialState = options.getInitialState || defaultGetInitialState;
    const pathTemplate = extractPathTemplateFromRoute(route, options);

    return function setHandler(incomingJSON) {

        const context = getListIds(
            { ...getInitialState(this) }, pathTemplate, 0, incomingJSON);

        const values = Observable
            .defer(() => service(context))
            .mergeMap(expandAndMapValues(incomingJSON, pathTemplate, options));

        return values;
    }
}

function getListIds(context, pathTemplate, depth, json) {

    if (!json || json.$type ||
        depth === pathTemplate.length ||
        'object' !== typeof json) {
        return context;
    } else {

        let keyIdx = -1;
        const x = pathTemplate[depth];
        const node = json[x.list];
        const keys = context[x.ids] || (context[x.ids] = []);

        for (const key in node) {
            getListIds(context, pathTemplate, depth + 1, node[keys[++keyIdx] = key]);
        }
    }

    return context;
}

function expandAndMapValues(incomingJSON, pathTemplate, options = {}) {

    const { valueKeys = {} } = options;

    return function innerExpandValues(context) {

        const path = [];

        let json = incomingJSON, pathId = -1, value,
            index = -1, count = pathTemplate.length;

        while (++index < count) {
            const x = pathTemplate[index];
            value = context[x.name];
            json = json[path[x.listIndex] = x.list];
            json = json[path[pathId = x.idsIndex] = value.id];
        }

        return Observable
            .from(expandValues(json, pathId + 1, { path }, valueKeys))
            .mergeMap(mapEachValue(context, pathTemplate, options));
    }
}

function expandValues(json, index, expansionState, valueKeys = {}) {

    if (!json || 'object' !== typeof json || json.$type) {
        return [expansionState];
    }

    const length = index + 1;
    const { path } = expansionState;

    return mergeMapArray(Object.keys(json), (key) => {
        const nextExpansionState = {
            value: json[key],
            path: { ...path, [index]: key, length }
        };
        if (valueKeys.hasOwnProperty(key)) {
            return [nextExpansionState];
        }
        return expandValues(json[key], length,
                            nextExpansionState, valueKeys);
    });
}

function mapEachValue(context, pathTemplate, options) {

    const mapValue = options.mapValue || defaultValueMapper;
    const { unboxRefs = false, unboxAtoms = true, unboxErrors = true } = options;
    const unboxTypes = { ref: unboxRefs, atom: unboxAtoms, error: unboxErrors };

    return function innerMapJSONValues({ path, value }) {

        path = slice.call(path);

        let { idsIndex: index, name } =
            pathTemplate[pathTemplate.length - 1];

        const valueIndex = path.length - 1;
        let key, node = context[name] || context;

        do {
            key = path[++index];
            if (index < valueIndex) {
                node = node[key] || (node[key] = {});
                continue;
            }
            break;
        } while (true);

        if (!(!value || 'object' !== typeof value)) {
            value = unboxTypes[value.$type] ? value.value : value;
        }

        value = mapValue(node, key, value, path, context);

        if (!value || typeof value !== 'object') {
            value = [{ path, value }];
        } else if (!isArray(value) && 'function' !== typeof value.subscribe) {
            if (!value.path) {
                value = { path, value };
            }
            value = [value];
        }
        return value;
    }
}

function mergeMapArray(xs, fn) {
    let ix = -1;
    const list = [];
    const { length } = xs;
    while (++ix < length) {
        list.push.apply(list, fn(xs[ix]));
    }
    return list;
}

function defaultGetInitialState(routerInstance) {
    const { request  = {} } = routerInstance;
    const { query = {} } = request;
    return query;
}

function defaultValueMapper(node, key, value, path, context) {
    return Observable.of({ path, value: node[key] = value });
}

function defaultService(requestedIds) {
    return Observable.empty();
}
