import warning from 'warning';
import { Observable } from 'rxjs';
import { errorMessage } from 'pegjs-util';
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
        const parsed = memoizedQuerySyntax(query);
        if (parsed.error) {
            warning(process.env.NODE_ENV !== 'development', errorMessage(parsed.error));
            warning(process.env.NODE_ENV !== 'development', `Error parsing query: ${query}`)
            return Observable.of(Object.assign(state, {
                error: parsed.error, settled: true, version: falcor.getVersion()
            }));
        }
        return Observable
            .from(falcor.get(parsed.ast))
            .map(({ json }) => Object.assign(state, {
                prev: query, data: json, version: falcor.getVersion()
            }))
            .catch((error) => Observable.of(Object.assign(state, {
                error, settled: true, version: falcor.getVersion()
            })));
    }
    return Observable.empty();
}
