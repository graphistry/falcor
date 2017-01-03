'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _setPrototypeOf = require('babel-runtime/core-js/object/set-prototype-of');

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

exports.default = withSchema;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _falcor = require('../falcor');

var FalcorRouteHandlers = _interopRequireWildcard(_falcor);

var _hoistStatics = require('recompose/hoistStatics');

var _hoistStatics2 = _interopRequireDefault(_hoistStatics);

var _wrapDisplayName = require('recompose/wrapDisplayName');

var _wrapDisplayName2 = _interopRequireDefault(_wrapDisplayName);

var _wrapSchemaDescriptor = require('../wrapSchemaDescriptor');

var _wrapSchemaDescriptor2 = _interopRequireDefault(_wrapSchemaDescriptor);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass; }

function withSchema(schemaDesc) {

    (0, _invariant2.default)(schemaDesc && ('function' === typeof schemaDesc || 'object' === (typeof schemaDesc === 'undefined' ? 'undefined' : _typeof(schemaDesc)) && 'function' === typeof schemaDesc.schema), 'Attempted to create a Schema container component without a schema definition.\nSchema containers must be created with a schema function, or an Object with a "schema" function.');

    if (typeof schemaDesc === 'function') {
        schemaDesc = { schema: schemaDesc };
    }

    schemaDesc.get = schemaDesc.get || FalcorRouteHandlers.get;
    schemaDesc.set = schemaDesc.set || FalcorRouteHandlers.set;

    return (0, _hoistStatics2.default)(function (Component) {
        var Container = function (_SchemaContainer) {
            _inherits(Container, _SchemaContainer);

            function Container() {
                _classCallCheck(this, Container);

                return _possibleConstructorReturn(this, (Container.__proto__ || (0, _getPrototypeOf2.default)(Container)).apply(this, arguments));
            }

            return Container;
        }(SchemaContainer);

        Container.Component = Component;
        ;
        Container.schema = (0, _wrapSchemaDescriptor2.default)(schemaDesc, Container.displayName = (0, _wrapDisplayName2.default)(Component, 'Schema'));
        return Container;
    });
}

var SchemaContainer = function (_React$Component) {
    _inherits(SchemaContainer, _React$Component);

    function SchemaContainer(props, context) {
        _classCallCheck(this, SchemaContainer);

        var _this2 = _possibleConstructorReturn(this, (SchemaContainer.__proto__ || (0, _getPrototypeOf2.default)(SchemaContainer)).call(this, props, context));

        _this2.Component = _this2.constructor.Component;
        return _this2;
    }

    _createClass(SchemaContainer, [{
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.Component = null;
        }
    }, {
        key: 'render',
        value: function render() {
            var Component = this.Component;

            return !Component ? null : _react2.default.createElement(Component, this.props);
        }
    }]);

    return SchemaContainer;
}(_react2.default.Component);
//# sourceMappingURL=withSchema.js.map