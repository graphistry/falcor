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

    var nextQuery = void 0;
    var data = memo.data,
        props = memo.props,
        query = memo.query,
        model = memo.model,
        fragment = memo.fragment;


    if (memo.error !== undefined) {
        return _Observable.Observable.empty();
    }
    if (data && data.$__status === 'pending') {
        return _Observable.Observable.empty();
    }

    try {
        nextQuery = fragment(data, props);
    } catch (e) {
        return memo.catchError(e);
    }

    if (query === (memo.query = nextQuery)) {
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
//# sourceMappingURL=fetchDataUntilSettled.js.map