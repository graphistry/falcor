'use strict';

var _falcorRouter = require('@graphistry/falcor-router');

var _falcorRouter2 = _interopRequireDefault(_falcorRouter);

var _testServices = require('./test-services');

var _testContainers = require('./test-containers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('withSchema', function () {
    describe('get', getTests);
    describe('set', setTests);
});

function getTests() {

    it('should traverse the JSON tree and return the data', function () {
        var _createTestContainers = (0, _testContainers.createTestContainers)(),
            App = _createTestContainers.App;

        var schema = App.schema((0, _testServices.createTestServices)());
        var router = new _falcorRouter2.default(schema.toArray());

        return router.get([['genres', 'length'], ['genres', 0, 'titles', 0, 'name']]).do(function (x) {
            return expect(x).toMatchSnapshot();
        }).toPromise();
    });
}

function setTests() {

    it('should traverse the JSON tree and set the data', function () {
        var _createTestContainers2 = (0, _testContainers.createTestContainers)(),
            App = _createTestContainers2.App;

        var schema = App.schema((0, _testServices.createTestServices)());
        var router = new _falcorRouter2.default(schema);

        return router.set({
            paths: [['genres', [0, 1], 'titles', 0, ['name', 'rating']]],
            jsonGraph: {
                genres: {
                    0: {
                        titles: {
                            0: {
                                rating: 75,
                                name: 'Total Recall'
                            }
                        }
                    },
                    1: {
                        titles: {
                            0: {
                                rating: 50,
                                name: 'Independence Day'
                            }
                        }
                    }
                }
            }
        }).do(function (x) {
            return expect(x).toMatchSnapshot();
        }).toPromise();
    });
}
//# sourceMappingURL=withSchema-tests.js.map