import { errorMessage } from 'pegjs-util';
import memoizeQueryies from './memoizeQueryies';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/expand';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/empty';

const memoizedQuerySyntax = memoizeQueryies(100);

export default function fetchDataUntilSettled({
    data, query, props, model, version, fragment, renderLoading
}) {

    const memo = {
        data, query, props, model,
        version, fragment, renderLoading
    };

    memo.mapNext = handleNext(memo, model);
    memo.catchError = handleError(memo, model);

    return (data && data.$__status !== 'pending' ?
        Observable.of(memo) : fetchData(memo)).expand(fetchData);
}

function fetchData(memo) {

    let nextQuery;
    let { data, props, query, model, fragment } = memo;

    if (memo.error !== undefined) {
        return Observable.empty();
    }
    if (data && data.$__status === 'pending') {
        return Observable.empty();
    }

    try {
        nextQuery = fragment(data, props);
    } catch (e) {
        return memo.catchError(e);
    }

    if (query === (memo.query = nextQuery)) {
        return Observable.empty();
    }

    const { ast, error } = memoizedQuerySyntax(memo.query);

    if (error) {
        if (typeof console !== 'undefined' && typeof console.error === 'function') {
            console.error(errorMessage(error));
            console.error(`Error parsing query: ${memo.query}`);
        }
        memo.error = error;
        memo.version = model.getVersion();
        return Observable.of(memo);
    }

    return Observable
        .from(!memo.renderLoading ?
            model.get(ast) :
            model.get(ast).progressively()
        ).map(memo.mapNext).catch(memo.catchError);
}

function handleNext(memo, model) {
    return function mapNext({ json: data }) {
        memo.data = data;
        memo.version = model.getVersion();
        return memo;
    }
}

function handleError(memo, model) {
    return function catchError(error) {
        memo.error = error;
        memo.version = model.getVersion();
        return Observable.of(memo);
    };
}
