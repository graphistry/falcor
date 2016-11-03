import warning from 'warning';
import { errorMessage } from 'pegjs-util';
import memoizeQueryies from './memoizeQueryies';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/expand';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';

const memoizedQuerySyntax = memoizeQueryies(100);

export default function fetchDataUntilSettled({
    data, props, falcor, fragment
}) {

    const memo = {
        query: null, loading: true,
        version: falcor.getVersion(),
        data, props, falcor, fragment,
    };
    memo.mapNext = handleNext(memo, falcor);
    memo.catchError = handleError(memo, falcor);

    return Observable.of(memo).expand(_fetchDataUntilSettled);
}

function _fetchDataUntilSettled(memo) {
    if (memo.loading === false) {
        return Observable.empty();
    }
    let { query, falcor, version, fragment } = memo;
    if ((query !== (memo.query = fragment(memo.data, memo.props))) ||
        (version !== (memo.version = falcor.getVersion()))) {
        let { ast, error } = memoizedQuerySyntax(memo.query);
        if (error) {
            return handleParseError(memo, error);
        }
        return Observable
            .from(falcor.get(ast))
            .map(memo.mapNext)
            .catch(memo.catchError);
    }
    return Observable.of({
        loading: false,
        data: memo.data,
        version: memo.version
    });
}

function handleNext(memo, falcor) {
    return function mapNext({ json: data }) {
        return Object.assign(memo, {
            data, loading: true,
            version: falcor.getVersion()
        });
    }
}

function handleError(memo, falcor) {
    return function catchError(error) {
        return Observable.of({
            error,
            data: memo.data,
            loading: false,
            version: falcor.getVersion()
        });
    };
}

function handleParseError(memo, error) {
    warning(process.env.NODE_ENV !== 'development', errorMessage(error));
    warning(process.env.NODE_ENV !== 'development', `Error parsing query: ${memo.query}`);
    return Observable.of({
        error,
        loading: false,
        data: memo.data,
        version: memo.version,
    });
}
