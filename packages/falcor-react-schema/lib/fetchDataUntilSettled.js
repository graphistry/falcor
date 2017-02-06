'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = fetchDataUntilSettled;

var _pegjsUtil = require('pegjs-util');

var _memoizeQueryies = require('./memoizeQueryies');

var _memoizeQueryies2 = _interopRequireDefault(_memoizeQueryies);

var _Observable = require('rxjs/Observable');

require('rxjs/add/operator/map');

require('rxjs/add/operator/catch');

require('rxjs/add/operator/expand');

require('rxjs/add/observable/of');

require('rxjs/add/observable/from');

require('rxjs/add/observable/empty');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var memoizedQuerySyntax = (0, _memoizeQueryies2.default)(100);

function fetchDataUntilSettled(_ref) {
    var data = _ref.data,
        query = _ref.query,
        props = _ref.props,
        model = _ref.model,
        version = _ref.version,
        fragment = _ref.fragment,
        renderLoading = _ref.renderLoading;


    var memo = {
        data: data, query: query, props: props, model: model,
        version: version, fragment: fragment, renderLoading: renderLoading
    };

    memo.mapNext = handleNext(memo, model);
    memo.catchError = handleError(memo, model);

    return (data && data.$__status !== 'pending' ? _Observable.Observable.of(memo) : fetchData(memo)).expand(fetchData);
}

function fetchData(memo) {
    var data = memo.data,
        props = memo.props,
        query = memo.query,
        model = memo.model,
        fragment = memo.fragment;


    if (memo.error !== undefined || data && data.$__status === 'pending' || query === (memo.query = fragment(data, props))) {
        return _Observable.Observable.empty();
    }

    var _memoizedQuerySyntax = memoizedQuerySyntax(memo.query),
        ast = _memoizedQuerySyntax.ast,
        error = _memoizedQuerySyntax.error;

    if (error) {
        if (typeof console !== 'undefined' && typeof console.error === 'function') {
            console.error((0, _pegjsUtil.errorMessage)(error));
            console.error('Error parsing query: ' + memo.query);
        }
        memo.error = error;
        memo.version = model.getVersion();
        return _Observable.Observable.of(memo);
    }

    return _Observable.Observable.from(!memo.renderLoading ? model.get(ast) : model.get(ast).progressively()).map(memo.mapNext).catch(memo.catchError);
}

function handleNext(memo, model) {
    return function mapNext(_ref2) {
        var data = _ref2.json;

        memo.data = data;
        memo.version = model.getVersion();
        return memo;
    };
}

function handleError(memo, model) {
    return function catchError(error) {
        memo.error = error;
        memo.version = model.getVersion();
        return _Observable.Observable.of(memo);
    };
}

/*
function _fetchDataUntilSettled(memo) {
    if (memo.loading === false) {
        return Observable.empty();
    }
    const { query, model, fragment } = memo;
    if (query !== (memo.query = fragment(memo.data || {}, memo.props))) {
        const { ast, error } = memoizedQuerySyntax(memo.query);
        if (error) {
            if (typeof console !== 'undefined' && typeof console.error === 'function') {
                console.error(errorMessage(error));
                console.error(`Error parsing query: ${memo.query}`);
            }
            memo.error = error;
            memo.version = model.getVersion();
        } else {
            return Observable
                .from(model.get(ast).progressively())
                .map(memo.mapNext).catch(memo.catchError);
        }
    }
    memo.loading = false;
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
*/

/*
import { errorMessage } from 'pegjs-util';
import memoizeQueryies from './memoizeQueryies';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concat';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/empty';

const memoizedQuerySyntax = memoizeQueryies(100);

export default function fetchDataUntilSettled(state) {
    return Observable
        .of(state)
        .lift(new ExpandFetchOperator(state));
}

class ExpandFetchOperator {
    constructor({ data, query, props, model, version, fragment, renderLoading }) {
        this.data = data;
        this.query = query;
        this.props = props;
        this.model = model;
        this.version = version;
        this.fragment = fragment;
        this.renderLoading = renderLoading;
    }
    call(destination, source) {
        return source._subscribe(new ExpandFetchSubscriber(
            destination,
            this.data, this.query, this.props, this.model,
            this.version, this.fragment, this.renderLoading
        ));
    }
}

class ExpandFetchSubscriber extends Subscriber {
    constructor(destination, data, query, props, model, version, fragment, renderLoading) {
        super(destination);
        this.data = data;
        this.query = query;
        this.props = props;
        this.model = model;
        this.version = version;
        this.fragment = fragment;
        this.renderLoading = renderLoading;
    }
    _next() {

    }
}


class ExpansionState {

    constructor({ data, query, props, model, version, fragment, renderLoading }) {
        this.data = data;
        this.query = query;
        this.props = props;
        this.model = model;
        this.loading = false;
        this.error = undefined;
        this.version = version;
        this.fragment = fragment;
        this.renderLoading = renderLoading;
        this.mapNext = this.mapNext.bind(this);
        this.catchError = this.catchError.bind(this);
        this.fetchExpansive = this.fetchExpansive.bind(this);
    }

    mapNext({ json: data }) {
        this.data = data;
        this.version = this.model.getVersion();
        return this;
    }

    catchError(error) {
        this.error = error;
        this.loading = false;
        this.version = this.model.getVersion();
        return Observable.of(this);
    }

    isLoading() {
        let loading = false;
        let { data, props, query, model, fragment } = this;
        loading = (!data || data.$__status === 'pending') || loading;
        loading = (query !== (this.query = fragment(data, props))) || loading;
        if (this.error !== undefined) {
            loading = false;
        }
        return this.loading = loading;
    }

    fetchExpansive() {

        if (!this.isLoading()) {
            return Observable.empty();
        }

        const { query, model, renderLoading } = this;
        const { ast, error } = memoizedQuerySyntax(query);

        if (error) {
            if (typeof console !== 'undefined' && typeof console.error === 'function') {
                console.error(errorMessage(error));
                console.error(`Error parsing query: ${query}`);
            }
            this.error = error;
            this.version = model.getVersion();
            return Observable.of(this);
        }

        return Observable
            .from(!renderLoading ?
                model.get(ast) :
                model.get(ast).progressively()
            )
            .map(this.mapNext)
            .catch(this.catchError)
            .concat(Observable.defer(this.fetchExpansive));
    }
}
*/
//# sourceMappingURL=fetchDataUntilSettled.js.map