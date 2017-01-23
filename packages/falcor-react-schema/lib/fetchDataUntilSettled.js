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
        props = _ref.props,
        model = _ref.model,
        version = _ref.version,
        fragment = _ref.fragment;


    var memo = {
        query: null, loading: true,
        data: data, props: props, model: model, version: version, fragment: fragment
    };
    memo.mapNext = handleNext(memo, model);
    memo.catchError = handleError(memo, model);

    return _Observable.Observable.of(memo).expand(_fetchDataUntilSettled);
}

function _fetchDataUntilSettled(memo) {
    if (memo.loading === false) {
        return _Observable.Observable.empty();
    }
    var query = memo.query,
        model = memo.model,
        fragment = memo.fragment;

    if (query !== (memo.query = fragment(memo.data || {}, memo.props || {}))) {
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
        } else {
            return _Observable.Observable.from(model.get(ast).progressively()).map(memo.mapNext).catch(memo.catchError);
        }
    }
    memo.loading = false;
    return _Observable.Observable.of(memo);
}

function handleNext(memo, model) {
    return function mapNext(_ref2) {
        var data = _ref2.json;

        memo.data = data;
        memo.loading = true;
        memo.version = model.getVersion();
        return memo;
    };
}

function handleError(memo, model) {
    return function catchError(error) {
        memo.error = error;
        memo.loading = false;
        memo.version = model.getVersion();
        return _Observable.Observable.of(memo);
    };
}
//# sourceMappingURL=fetchDataUntilSettled.js.map