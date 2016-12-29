import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/empty';
import extractPathTemplateFromRoute from './extractPathTemplateFromRoute';

const isArray = Array.isArray;
const slice = Array.prototype.slice;
const concat = Array.prototype.concat;

export default function get(route, displayName, options = {}) {

    if (typeof options === 'function') {
        options = { service: options };
    }

    const service = options.service || defaultService;
    const getInitialState = options.getInitialState || defaultGetInitialState;
    const pathTemplate = extractPathTemplateFromRoute(route, options);

    return function getHandler(requestedPathSet) {

        const context = { ...getInitialState(this) };

        let index = -1,
            lastNamedIndex = 0,
            count = pathTemplate.length;

        while (++index < count) {
            const { ids, idsIndex } = pathTemplate[index];
            lastNamedIndex = idsIndex + 1;
            context[ids] = concat.call([],
                requestedPathSet[idsIndex]
            );
        }

        const suffix = slice.call(requestedPathSet, lastNamedIndex);
        const loaded = suffix.reduce((source, keys, index) => source.mergeMap(
                ({ context, rest }) => keysetToKeysList(keys),
                ({ context, rest }, key) => ({
                    context, rest: {
                        ...rest,
                        [index]: key,
                        length: index + 1
                    }
                })
            ),
            Observable
                .defer(() => service(context))
                .map((context) => ({ context, rest: { length: 0 } }))
        );

        return loaded.mergeMap(expandValues(pathTemplate));
    }
}

function expandValues(pathTemplate) {

    return function innerExpandValues({ context, rest }) {

        context = context || {};

        const vals = [], path = [];
        let value = context,
            key, type, index = -1,
            pathId = -1, valsId = -1,
            count = pathTemplate.length;

        while (++index < count) {
            const x = pathTemplate[index];
            value = context[x.name];
            path[x.listIndex] = x.list;
            path[pathId = x.idsIndex] = value.id;
        }

        index = 0;
        count = rest.length;

        do {
            if (value === undefined) {
                break;
            } else if (index === count || !value || 'object' !== typeof value) {
                vals[++valsId] = { value, path };
                break;
            } else if (type = value.$type) {
                vals[++valsId] = { value, path };
                break;
            }
            key = rest[index];
            value = value[key];
            path[++pathId] = key;
        } while (++index <= count);

        return vals;
    }
}

function keysetToKeysList(keys) {
    if (!keys || 'object' !== typeof keys) {
        return [keys];
    } else if (isArray(keys)) {
        return keys;
    }
    let rangeEnd = keys.to;
    let rangeStart = keys.from || 0;
    if ('number' !== typeof rangeEnd) {
        rangeEnd = rangeStart + (keys.length || 0) - 1;
    }
    return Array.from(
        {length: rangeEnd - rangeStart},
        (x, index) => index + rangeStart
    );
}

function defaultGetInitialState(routerInstance) {
    const { request  = {} } = routerInstance;
    const { query = {} } = request;
    return query;
}

function defaultService(requestedIds) {
    return Observable.empty();
}
