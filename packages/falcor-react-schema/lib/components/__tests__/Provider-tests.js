'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _setPrototypeOf = require('babel-runtime/core-js/object/set-prototype-of');

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enzyme = require('enzyme');

var _testUtils = require('react-dom/test-utils');

var _testUtils2 = _interopRequireDefault(_testUtils);

var _Provider = require('../Provider');

var _Provider2 = _interopRequireDefault(_Provider);

var _testInit3 = require('./test-init');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass; }

describe('Provider', function () {
    var Child = function (_React$Component) {
        _inherits(Child, _React$Component);

        function Child() {
            _classCallCheck(this, Child);

            return _possibleConstructorReturn(this, (Child.__proto__ || (0, _getPrototypeOf2.default)(Child)).apply(this, arguments));
        }

        _createClass(Child, [{
            key: 'render',
            value: function render() {
                return _react2.default.createElement('div', null);
            }
        }]);

        return Child;
    }(_react2.default.Component);

    Child.contextTypes = _Provider2.default.childContextTypes;


    it('Should store the falcorModel in Provider state', function () {
        var _testInit = (0, _testInit3.testInit)(),
            App = _testInit.App,
            model = _testInit.model;

        var wrapper = (0, _enzyme.mount)(_react2.default.createElement(
            _Provider2.default,
            { falcorModel: model },
            _react2.default.createElement(Child, null)
        ));
        expect(wrapper.state('falcorModel')).toBe(model);
    });

    it('Should make the falcorModel available in the context', function () {
        var _testInit2 = (0, _testInit3.testInit)(),
            App = _testInit2.App,
            model = _testInit2.model;

        var tree = _testUtils2.default.renderIntoDocument(_react2.default.createElement(
            _Provider2.default,
            { falcorModel: model },
            _react2.default.createElement(Child, null)
        ));
        var child = _testUtils2.default.findRenderedComponentWithType(tree, Child);
        expect(child.context.falcorModel).toBe(model);
    });
});
//# sourceMappingURL=Provider-tests.js.map