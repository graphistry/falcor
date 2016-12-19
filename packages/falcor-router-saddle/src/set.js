const typeofNumber = 'number';
const typeofObject = 'object';
const typeofFunction = 'function';
const isArray = Array.isArray;
const slice = Array.prototype.slice;

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/empty';

function defaultPropsResolver(routerInstance) {
    const { request  = {} } = routerInstance;
    const { query = {} } = request;
    return query;
}

function defaultValueMapper(node, key, value, path, context) {
    return Observable.of({ path, value: node[key] = value });
}

function defaultLoader(requestedIds) {
    return Observable.empty();
}

export function set(options = {}) {

    const lists = options.lists || [];
    const loader = options.loader || defaultLoader;
    const getInitialProps = options.getInitialProps || defaultPropsResolver;

    return function setHandler(incomingJSON) {

        const context = getListIds(
            { ...getInitialProps(this) }, lists, 0, incomingJSON);

        const values = Observable
            .defer(() => loader(context))
            .mergeMap(expandAndMapValues(incomingJSON, options));

        return values;
    }
}

function getListIds(context, lists, depth, json) {

    if (!json || json.$type ||
        depth === lists.length ||
        typeofObject !== typeof json) {
        return context;
    } else {

        const list = `${lists[depth]}Ids`;
        const byId = `${lists[depth]}sById`;
        const node = json[byId];

        let keyIdx = -1;
        const keys = context[list] || (context[list] = []);

        for (const key in node) {
            getListIds(context, lists, depth + 1, node[keys[++keyIdx] = key]);
        }
    }

    return context;
}

function expandAndMapValues(incomingJSON, options = {}) {

    const lists = options.lists || [];
    const { valueKeys = {} } = options;

    return function innerExpandValues(context) {

        const path = [];

        let json = incomingJSON, key, type,
            index = -1, count = lists.length,
            pathLen = 0, listId = -1, valsId = -1;

        while (++index < count) {
            key = lists[index];
            listId = path[pathLen++] = `${key}sById`;
            valsId = path[pathLen++] = context[key].id;
            json = json[listId][valsId];
        }

        return Observable
            .from(expandValues(json, pathLen, { path }, valueKeys))
            .mergeMap(mapEachValue(context, options));
    }
}

function expandValues(json, index, expansionState, valueKeys = {}) {

    if (!json || typeofObject !== typeof json || json.$type) {
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

function mapEachValue(context, options) {

    const lists = options.lists || [];
    const mapValue = options.mapValue || defaultValueMapper;
    const { unboxRefs = false, unboxAtoms = true, unboxErrors = true } = options;
    const unboxTypes = { ref: unboxRefs, atom: unboxAtoms, error: unboxErrors };

    return function innerMapJSONValues({ path, value }) {

        path = slice.call(path);

        const count = path.length;
        let key, index = lists.length * 2;
        let node = context[lists[lists.length - 1]] || context;

        do {

            key = path[index];

            if (index < count - 1) {
                node = node[key] || (node[key] = {});
                continue;
            }

            if (!(!value || typeofObject !== typeof value)) {
                value = unboxTypes[value.$type] ? value.value : value;
            }

            value = mapValue(node, key, value, path, context);
        } while (++index < count);

        if (!value || typeof value !== typeofObject) {
            value = [{ path, value }];
        } else if (!isArray(value) && typeofFunction !== typeof value.subscribe) {
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
