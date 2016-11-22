'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = fetchDataUntilSettled;

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

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
        falcor = _ref.falcor,
        fragment = _ref.fragment;


    var memo = {
        query: null, loading: true,
        version: falcor.getVersion(),
        data: data, props: props, falcor: falcor, fragment: fragment
    };
    memo.mapNext = handleNext(memo, falcor);
    memo.catchError = handleError(memo, falcor);

    return _Observable.Observable.of(memo).expand(_fetchDataUntilSettled);
}

function _fetchDataUntilSettled(memo) {
    if (memo.loading === false) {
        return _Observable.Observable.empty();
    }
    var query = memo.query,
        falcor = memo.falcor,
        version = memo.version,
        fragment = memo.fragment;

    if (query !== (memo.query = fragment(memo.data, memo.props)) || version !== (memo.version = falcor.getVersion())) {
        var _memoizedQuerySyntax = memoizedQuerySyntax(memo.query),
            ast = _memoizedQuerySyntax.ast,
            error = _memoizedQuerySyntax.error;

        if (error) {
            return handleParseError(memo, error);
        }
        return _Observable.Observable.from(falcor.get(ast)).map(memo.mapNext).catch(memo.catchError);
    }
    return _Observable.Observable.of({
        loading: false,
        data: memo.data,
        version: memo.version
    });
}

function handleNext(memo, falcor) {
    return function mapNext(_ref2) {
        var data = _ref2.json;

        return (0, _assign2.default)(memo, {
            data: data, loading: true,
            version: falcor.getVersion()
        });
    };
}

function handleError(memo, falcor) {
    return function catchError(error) {
        return _Observable.Observable.of({
            error: error,
            data: memo.data,
            loading: false,
            version: falcor.getVersion()
        });
    };
}

function handleParseError(memo, error) {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
        console.error((0, _pegjsUtil.errorMessage)(error));
        console.error('Error parsing query: ' + memo.query);
    }
    return _Observable.Observable.of({
        error: error,
        loading: false,
        data: memo.data,
        version: memo.version
    });
}
//# sourceMappingURL=fetchDataUntilSettled.js.map