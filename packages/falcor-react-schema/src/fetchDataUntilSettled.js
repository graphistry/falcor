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
    data, props, model, fragment, renderLoading
}) {

    const memo = {
        query: null, loading: true,
        version: model.getVersion(),
        data, props, model, fragment,
    };
    memo.mapNext = handleNext(memo, model);
    memo.catchError = handleError(memo, model);

    return Observable.of(memo).expand(_fetchDataUntilSettled);
}

function _fetchDataUntilSettled(memo) {
    if (memo.loading === false) {
        return Observable.empty();
    }
    const { query, version, model, fragment } = memo;
    if ((query !== (memo.query = fragment(memo.data || {}, memo.props || {}))) /*||
        (version !== (memo.version = model.getVersion()))*/) {
        const { ast, error } = memoizedQuerySyntax(memo.query);
        if (error) {
            if (typeof console !== 'undefined' && typeof console.error === 'function') {
                console.error(errorMessage(error));
                console.error(`Error parsing query: ${memo.query}`);
            }
            memo.error = error;
        } else {
            return Observable
                .from(!memo.renderLoading ?
                       model.get(ast) :
                       model.get(ast).progressively())
                .map(memo.mapNext)
                .catch(memo.catchError);
        }
    }
    memo.loading = false;
    memo.version = model.getVersion();
    return Observable.of(memo);
}

function handleNext(memo, model) {
    return function mapNext({ json: data }) {
        memo.data = data;
        memo.loading = true;
        memo.version = model.getVersion();
        return memo;
    }
}

function handleError(memo, model) {
    return function catchError(error) {
        memo.error = error;
        memo.loading = false;
        memo.version = model.getVersion();
        return Observable.of(memo);
    };
}
