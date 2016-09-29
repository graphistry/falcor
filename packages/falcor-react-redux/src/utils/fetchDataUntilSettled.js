import { Observable } from 'rxjs';
import memoizeQueryies from './memoizeQueryies';
const memoizedQuerySyntax = memoizeQueryies(100);

export default function fetchDataUntilSettled({
    data, falcor, fragment, ...props
}) {
    return Observable.of({
        prev: null, settled: false,
        version: falcor.getVersion(),
        data, props, falcor, fragment,
    })
    .expand(_fetchDataUntilSettled)
    .takeLast(1);
}

function _fetchDataUntilSettled(state) {
    if (state.settled === true) {
        return Observable.empty();
    }
    const { falcor, fragment } = state;
    const query = fragment(state.data, state.props);
    if (query !== state.prev || state.version !== falcor.getVersion()) {
        return Observable
            .from(falcor.get(memoizedQuerySyntax(query)))
            .map(({ json }) => Object.assign(state, {
                prev: query, data: json, version: falcor.getVersion()
            }))
            .catch((error) => Observable.of(Object.assign(state, {
                error, settled: true, version: falcor.getVersion()
            })));
    }
    return Observable.empty();
}
