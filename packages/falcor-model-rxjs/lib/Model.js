'use strict';

var _setPrototypeOf = require('babel-runtime/core-js/object/set-prototype-of');

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Model = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = (0, _getOwnPropertyDescriptor2.default)(object, property); if (desc === undefined) { var parent = (0, _getPrototypeOf2.default)(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _Observable2 = require('rxjs/Observable');

var _falcor = require('@graphistry/falcor');

var _falcorPathSyntax = require('@graphistry/falcor-path-syntax');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass; }

var Model = function (_FalcorModel) {
    _inherits(Model, _FalcorModel);

    function Model() {
        _classCallCheck(this, Model);

        return _possibleConstructorReturn(this, (Model.__proto__ || (0, _getPrototypeOf2.default)(Model)).apply(this, arguments));
    }

    _createClass(Model, [{
        key: 'get',
        value: function get() {
            for (var _len = arguments.length, getArgs = Array(_len), _key = 0; _key < _len; _key++) {
                getArgs[_key] = arguments[_key];
            }

            return new ObservableModelResponse(_get(Model.prototype.__proto__ || (0, _getPrototypeOf2.default)(Model.prototype), 'get', this).apply(this, (0, _falcorPathSyntax.fromPathsOrPathValues)(getArgs)));
        }
    }, {
        key: 'set',
        value: function set() {
            for (var _len2 = arguments.length, setArgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                setArgs[_key2] = arguments[_key2];
            }

            return new ObservableModelResponse(_get(Model.prototype.__proto__ || (0, _getPrototypeOf2.default)(Model.prototype), 'set', this).apply(this, (0, _falcorPathSyntax.fromPathsOrPathValues)(setArgs)));
        }
    }, {
        key: 'call',
        value: function call(fnPath, fnArgs, refPaths, thisPaths) {
            fnPath = (0, _falcorPathSyntax.fromPath)(fnPath);
            refPaths = refPaths && (0, _falcorPathSyntax.fromPathsOrPathValues)(refPaths) || [];
            thisPaths = thisPaths && (0, _falcorPathSyntax.fromPathsOrPathValues)(thisPaths) || [];
            return new ObservableModelResponse(_get(Model.prototype.__proto__ || (0, _getPrototypeOf2.default)(Model.prototype), 'call', this).call(this, fnPath, fnArgs, refPaths, thisPaths));
        }
    }, {
        key: 'invalidate',
        value: function invalidate() {
            for (var _len3 = arguments.length, invalidateArgs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                invalidateArgs[_key3] = arguments[_key3];
            }

            return _get(Model.prototype.__proto__ || (0, _getPrototypeOf2.default)(Model.prototype), 'invalidate', this).apply(this, (0, _falcorPathSyntax.fromPathsOrPathValues)(invalidateArgs));
        }
    }, {
        key: 'getItems',
        value: function getItems() {
            var _this2 = this;

            var thisPathsSelector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
                return [['length']];
            };
            var restPathsSelector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (_ref) {
                var length = _ref.json.length;
                return [];
            };


            var thisPaths = (0, _falcorPathSyntax.fromPathsOrPathValues)([].concat(thisPathsSelector(this)));

            return thisPaths.length === 0 ? _Observable2.Observable.empty() : this.get.apply(this, _toConsumableArray(thisPaths)).mergeMap(function (result) {

                var restPaths = (0, _falcorPathSyntax.fromPathsOrPathValues)([].concat(restPathsSelector(result)));

                return restPaths.length === 0 ? _Observable2.Observable.of(result) : _this2.get.apply(_this2, _toConsumableArray(thisPaths.concat(restPaths)));
            });
        }
    }, {
        key: 'preload',
        value: function preload() {
            for (var _len4 = arguments.length, preloadArgs = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                preloadArgs[_key4] = arguments[_key4];
            }

            return new ObservableModelResponse(_get(Model.prototype.__proto__ || (0, _getPrototypeOf2.default)(Model.prototype), 'preload', this).apply(this, (0, _falcorPathSyntax.fromPathsOrPathValues)(preloadArgs)));
        }
    }, {
        key: 'getValue',
        value: function getValue() {
            for (var _len5 = arguments.length, getValueArgs = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                getValueArgs[_key5] = arguments[_key5];
            }

            return new ObservableModelResponse(_get(Model.prototype.__proto__ || (0, _getPrototypeOf2.default)(Model.prototype), 'getValue', this).apply(this, (0, _falcorPathSyntax.fromPathsOrPathValues)(getValueArgs)));
        }
    }, {
        key: 'setValue',
        value: function setValue() {
            for (var _len6 = arguments.length, setValueArgs = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                setValueArgs[_key6] = arguments[_key6];
            }

            return new ObservableModelResponse(_get(Model.prototype.__proto__ || (0, _getPrototypeOf2.default)(Model.prototype), 'setValue', this).apply(this, (0, _falcorPathSyntax.fromPathsOrPathValues)(setValueArgs)));
        }
    }, {
        key: '_clone',
        value: function _clone(opts) {
            return new Model(_get(Model.prototype.__proto__ || (0, _getPrototypeOf2.default)(Model.prototype), '_clone', this).call(this, opts));
        }
    }]);

    return Model;
}(_falcor.Model);

var ObservableModelResponse = function (_Observable) {
    _inherits(ObservableModelResponse, _Observable);

    function ObservableModelResponse(source, operator) {
        _classCallCheck(this, ObservableModelResponse);

        if (typeof source !== 'function') {
            var _this3 = _possibleConstructorReturn(this, (ObservableModelResponse.__proto__ || (0, _getPrototypeOf2.default)(ObservableModelResponse)).call(this));

            source && (_this3.source = source);
            operator && (_this3.operator = operator);
        } else {
            var _this3 = _possibleConstructorReturn(this, (ObservableModelResponse.__proto__ || (0, _getPrototypeOf2.default)(ObservableModelResponse)).call(this, source));
        }
        return _possibleConstructorReturn(_this3);
    }

    _createClass(ObservableModelResponse, [{
        key: 'lift',
        value: function lift(operator) {
            return new ObservableModelResponse(this, operator);
        }
    }, {
        key: '_toJSONG',
        value: function _toJSONG() {
            return new ObservableModelResponse(this.source._toJSONG());
        }
    }, {
        key: 'progressively',
        value: function progressively() {
            return new ObservableModelResponse(this.source.progressively());
        }
    }]);

    return ObservableModelResponse;
}(_Observable2.Observable);

exports.Model = Model;
exports.default = Model;