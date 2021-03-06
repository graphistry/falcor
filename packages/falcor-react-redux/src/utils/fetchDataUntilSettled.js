import { errorMessage } from 'pegjs-util';
import memoizeQueryies from './memoizeQueryies';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/expand';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';

const memoizedQuerySyntax = memoizeQueryies(100);

export default function fetchDataUntilSettled({
    data, query, props, falcor, version, fragment,
    disposeDelay = 0, disposeScheduler
}) {

    const memo = {
        query, loading: true,
        data, props, falcor, version, fragment,
        disposeDelay, disposeScheduler
    };
    memo.mapNext = handleNext(memo, falcor);
    memo.catchError = handleError(memo, falcor);
    if (!memo.data) {
        return Observable.of(memo).expand(_fetchDataUntilSettled);
    }
    return hydrateExistingData(memo).expand(_fetchDataUntilSettled).skip(1);
}

function hydrateExistingData(memo) {
    if (memo.query) {
        const { ast, error } = memoizedQuerySyntax(memo.query);
        if (!error) {
            return Observable
                .from(memo.falcor.withoutDataSource().get(ast))
                .map(memo.mapNext).catch(memo.catchError);
        }
    }
    return Observable.of(memo);
}

function _fetchDataUntilSettled(memo) {
    if (memo.loading === false) {
        return Observable.empty();
    }
    let nextQuery;
    const { query, falcor, fragment } = memo;
    try {
        nextQuery = fragment(memo.data || {}, memo.props || {});
    } catch (e) {
        return memo.catchError(e);
    }
    if (query !== (memo.query = nextQuery) || (memo.data && memo.data.$__status === 'incomplete')) {
        const { ast, error } = memoizedQuerySyntax(nextQuery);
        if (error) {
            if (typeof console !== 'undefined' && typeof console.error === 'function') {
                console.error(errorMessage(error));
                console.error(`Error parsing query: ${nextQuery}`);
            }
            memo.error = error;
            memo.version = falcor.getVersion();
        } else {
            return Observable
                .from(falcor.get(ast).progressively())
                .map(memo.mapNext).catch(memo.catchError)
                .let(delayDispose.bind(null, memo.disposeScheduler, memo.disposeDelay));
        }
    }
    memo.loading = false;
    return Observable.of(memo);
}

function handleNext(memo, falcor) {
    return function mapNext({ json: data }) {
        memo.data = data;
        memo.loading = true;
        memo.version = falcor.getVersion();
        return memo;
    }
}

function handleError(memo, falcor) {
    return function catchError(error) {
        memo.error = error;
        memo.loading = false;
        memo.version = falcor.getVersion();
        return Observable.of(memo);
    };
}

function delayDispose(scheduler, delay, source) {
    return !scheduler ? source : source.lift(new DelayDisposeOperator(scheduler, delay));
}

class DelayDisposeOperator {
    constructor(scheduler, delay) {
        this.delay = delay;
        this.scheduler = scheduler;
    }
    call(sink, source) {
        return source._subscribe(new DelayDisposeSubscriber(sink, this.scheduler, this.delay));
    }
}

class DelayDisposeSubscriber extends Subscriber {
    constructor(sink, scheduler, delay) {
        super(sink);
        this.delay = delay;
        this.scheduler = scheduler;
        this.unsubscriptionDisposable = null;
    }
    superUnsubscribe() { return super.unsubscribe(); }
    unsubscribe() {
        if (!this.closed && !this.isStopped && !this.unsubscriptionDisposable) {
            this.isStopped = true;
            this.unsubscriptionDisposable = this.scheduler.schedule(() => {
                super.unsubscribe();
            }, this.delay);
        }
    }
    _unsubscribe() {
        const { unsubscriptionDisposable } = this;
        if (unsubscriptionDisposable) {
            this.unsubscriptionDisposable = null;
            unsubscriptionDisposable.unsubscribe();
        }
    }
    _error(err) {
        this.destination.error(err);
        super.unsubscribe();
    }
    _complete() {
        this.destination.complete();
        super.unsubscribe();
    }
}
