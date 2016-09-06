import { Observable } from 'rxjs';
import memoizeQueryies from './memoizeQueryies';
import mergeIntoFalcorJSON from './mergeIntoFalcorJSON';
const memoizedQuerySyntax = memoizeQueryies(100);

export default function fetchDataUntilSettled({
    data, falcor, fragment, ...props
}) {
    return Observable.of({
        prev: null, settled: false,
        data, falcor, fragment, props
    })
    .expand(_fetchDataUntilSettled)
    .takeLast(1);
}

function _fetchDataUntilSettled(state) {
    if (state.settled === true) {
        return Observable.empty();
    }
    const { data, props, prev, falcor, fragment } = state;
    const query = fragment(data, props);
    if (query !== prev) {
        return Observable
            .from(falcor.get(...memoizedQuerySyntax(query)))
            .map(({ json }) => Object.assign(state, {
                prev: query, data: mergeIntoFalcorJSON(data, json)
            }))
            .catch((error) => Observable.of(Object.assign(state, {
                error, settled: true
            })));
    }
    return Observable.empty();
}
