'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

exports.default = fetchDataUntilSettled;

var _pegjsUtil = require('pegjs-util');

var _memoizeQueryies = require('./memoizeQueryies');

var _memoizeQueryies2 = _interopRequireDefault(_memoizeQueryies);

var _Observable = require('rxjs/Observable');

var _Subscriber2 = require('rxjs/Subscriber');

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
        falcor = _ref.falcor,
        version = _ref.version,
        fragment = _ref.fragment,
        _ref$disposeDelay = _ref.disposeDelay,
        disposeDelay = _ref$disposeDelay === undefined ? 0 : _ref$disposeDelay,
        disposeScheduler = _ref.disposeScheduler;


    var memo = {
        query: query, loading: true,
        data: data, props: props, falcor: falcor, version: version, fragment: fragment,
        disposeDelay: disposeDelay, disposeScheduler: disposeScheduler
    };
    memo.mapNext = handleNext(memo, falcor);
    memo.catchError = handleError(memo, falcor);
    if (!memo.data) {
        return _Observable.Observable.of(memo).expand(_fetchDataUntilSettled);
    }
    return hydrateExistingData(memo).expand(_fetchDataUntilSettled).skip(1);
}

function hydrateExistingData(memo) {
    if (memo.query) {
        var _memoizedQuerySyntax = memoizedQuerySyntax(memo.query),
            ast = _memoizedQuerySyntax.ast,
            error = _memoizedQuerySyntax.error;

        if (!error) {
            return _Observable.Observable.from(memo.falcor.withoutDataSource().get(ast)).map(memo.mapNext).catch(memo.catchError);
        }
    }
    return _Observable.Observable.of(memo);
}

function _fetchDataUntilSettled(memo) {
    if (memo.loading === false) {
        return _Observable.Observable.empty();
    }
    var nextQuery = void 0;
    var query = memo.query,
        falcor = memo.falcor,
        fragment = memo.fragment;

    try {
        nextQuery = fragment(memo.data || {}, memo.props || {});
    } catch (e) {
        return memo.catchError(e);
    }
    if (query !== (memo.query = nextQuery) || memo.data && memo.data.$__status === 'incomplete') {
        var _memoizedQuerySyntax2 = memoizedQuerySyntax(nextQuery),
            ast = _memoizedQuerySyntax2.ast,
            error = _memoizedQuerySyntax2.error;

        if (error) {
            if (typeof console !== 'undefined' && typeof console.error === 'function') {
                console.error((0, _pegjsUtil.errorMessage)(error));
                console.error('Error parsing query: ' + nextQuery);
            }
            memo.error = error;
            memo.version = falcor.getVersion();
        } else {
            return _Observable.Observable.from(falcor.get(ast).progressively()).map(memo.mapNext).catch(memo.catchError).let(delayDispose.bind(null, memo.disposeScheduler, memo.disposeDelay));
        }
    }
    memo.loading = false;
    return _Observable.Observable.of(memo);
}

function handleNext(memo, falcor) {
    return function mapNext(_ref2) {
        var data = _ref2.json;

        memo.data = data;
        memo.loading = true;
        memo.version = falcor.getVersion();
        return memo;
    };
}

function handleError(memo, falcor) {
    return function catchError(error) {
        memo.error = error;
        memo.loading = false;
        memo.version = falcor.getVersion();
        return _Observable.Observable.of(memo);
    };
}

function delayDispose(scheduler, delay, source) {
    return !scheduler ? source : source.lift(new DelayDisposeOperator(scheduler, delay));
}

var DelayDisposeOperator = function () {
    function DelayDisposeOperator(scheduler, delay) {
        (0, _classCallCheck3.default)(this, DelayDisposeOperator);

        this.delay = delay;
        this.scheduler = scheduler;
    }

    (0, _createClass3.default)(DelayDisposeOperator, [{
        key: 'call',
        value: function call(sink, source) {
            return source._subscribe(new DelayDisposeSubscriber(sink, this.scheduler, this.delay));
        }
    }]);
    return DelayDisposeOperator;
}();

var DelayDisposeSubscriber = function (_Subscriber) {
    (0, _inherits3.default)(DelayDisposeSubscriber, _Subscriber);

    function DelayDisposeSubscriber(sink, scheduler, delay) {
        (0, _classCallCheck3.default)(this, DelayDisposeSubscriber);

        var _this = (0, _possibleConstructorReturn3.default)(this, (DelayDisposeSubscriber.__proto__ || (0, _getPrototypeOf2.default)(DelayDisposeSubscriber)).call(this, sink));

        _this.delay = delay;
        _this.scheduler = scheduler;
        _this.unsubscriptionDisposable = null;
        return _this;
    }

    (0, _createClass3.default)(DelayDisposeSubscriber, [{
        key: 'superUnsubscribe',
        value: function superUnsubscribe() {
            return (0, _get3.default)(DelayDisposeSubscriber.prototype.__proto__ || (0, _getPrototypeOf2.default)(DelayDisposeSubscriber.prototype), 'unsubscribe', this).call(this);
        }
    }, {
        key: 'unsubscribe',
        value: function unsubscribe() {
            var _this2 = this;

            if (!this.closed && !this.isStopped && !this.unsubscriptionDisposable) {
                this.isStopped = true;
                this.unsubscriptionDisposable = this.scheduler.schedule(function () {
                    (0, _get3.default)(DelayDisposeSubscriber.prototype.__proto__ || (0, _getPrototypeOf2.default)(DelayDisposeSubscriber.prototype), 'unsubscribe', _this2).call(_this2);
                }, this.delay);
            }
        }
    }, {
        key: '_unsubscribe',
        value: function _unsubscribe() {
            var unsubscriptionDisposable = this.unsubscriptionDisposable;

            if (unsubscriptionDisposable) {
                this.unsubscriptionDisposable = null;
                unsubscriptionDisposable.unsubscribe();
            }
        }
    }, {
        key: '_error',
        value: function _error(err) {
            this.destination.error(err);
            (0, _get3.default)(DelayDisposeSubscriber.prototype.__proto__ || (0, _getPrototypeOf2.default)(DelayDisposeSubscriber.prototype), 'unsubscribe', this).call(this);
        }
    }, {
        key: '_complete',
        value: function _complete() {
            this.destination.complete();
            (0, _get3.default)(DelayDisposeSubscriber.prototype.__proto__ || (0, _getPrototypeOf2.default)(DelayDisposeSubscriber.prototype), 'unsubscribe', this).call(this);
        }
    }]);
    return DelayDisposeSubscriber;
}(_Subscriber2.Subscriber);
//# sourceMappingURL=fetchDataUntilSettled.js.map