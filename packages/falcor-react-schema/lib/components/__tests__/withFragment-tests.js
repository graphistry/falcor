'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactTestRenderer = require('react-test-renderer');

var _reactTestRenderer2 = _interopRequireDefault(_reactTestRenderer);

var _Provider = require('../Provider');

var _Provider2 = _interopRequireDefault(_Provider);

var _testInit4 = require('./test-init');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('withFragment', function () {

    it('should fetch all the data for a container', function () {
        var _testInit = (0, _testInit4.testInit)(),
            App = _testInit.App,
            model = _testInit.model;

        return App.load({ model: model }).do(function (x) {
            return expect(x.data).toMatchSnapshot();
        }).toPromise();
    });

    it('should fetch all the data for a container and emit intermediate states when renderLoading is true', function () {
        var _testInit2 = (0, _testInit4.testInit)(),
            App = _testInit2.App,
            model = _testInit2.model;

        return App.load({ model: model, renderLoading: true }).do(function (x) {
            return expect(x.data).toMatchSnapshot();
        }).toPromise();
    });

    it('Should render the full component tree without batching', function () {
        var _testInit3 = (0, _testInit4.testInit)(),
            App = _testInit3.App,
            model = _testInit3.model;

        expect(_reactTestRenderer2.default.create(_react2.default.createElement(
            _Provider2.default,
            { falcorModel: model.unbatch() },
            _react2.default.createElement(App, null)
        )).toJSON()).toMatchSnapshot();
    });
});
//# sourceMappingURL=withFragment-tests.js.map