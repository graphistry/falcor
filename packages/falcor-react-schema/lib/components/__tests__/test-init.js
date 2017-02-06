'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.testInit = testInit;

var _falcor = require('@graphistry/falcor');

var _falcorRouter = require('@graphistry/falcor-router');

var _falcorRouter2 = _interopRequireDefault(_falcorRouter);

var _async = require('rxjs/scheduler/async');

var Scheduler = _interopRequireWildcard(_async);

var _do = require('rxjs/add/operator/do');

var operator_do = _interopRequireWildcard(_do);

var _toPromise = require('rxjs/add/operator/toPromise');

var operator_toPromise = _interopRequireWildcard(_toPromise);

var _testServices = require('./test-services');

var _testContainers = require('./test-containers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function testInit() {
    var serviceOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        app: { batch: false, delay: undefined },
        genres: { batch: false, delay: undefined },
        titles: { batch: false, delay: undefined }
    };

    var _createTestContainers = (0, _testContainers.createTestContainers)(),
        App = _createTestContainers.App;

    return { App: App, model: new _falcor.Model({
            recycleJSON: true,
            scheduler: Scheduler.async,
            source: new _falcorRouter2.default(App.schema((0, _testServices.createTestServices)(serviceOptions)).toArray())
        })
    };
}
//# sourceMappingURL=test-init.js.map