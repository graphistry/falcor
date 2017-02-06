'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createTestServices = createTestServices;

var _Observable = require('rxjs/Observable');

var _from = require('rxjs/add/observable/from');

var observable_from = _interopRequireWildcard(_from);

var _timer = require('rxjs/add/observable/timer');

var observable_timer = _interopRequireWildcard(_timer);

var _let = require('rxjs/add/operator/let');

var operator_let = _interopRequireWildcard(_let);

var _mapTo = require('rxjs/add/operator/mapTo');

var operator_mapTo = _interopRequireWildcard(_mapTo);

var _toArray = require('rxjs/add/operator/toArray');

var operator_toArray = _interopRequireWildcard(_toArray);

var _concatMap = require('rxjs/add/operator/concatMap');

var operator_concatMap = _interopRequireWildcard(_concatMap);

var _mergeMapTo = require('rxjs/add/operator/mergeMapTo');

var operator_mergeMapTo = _interopRequireWildcard(_mergeMapTo);

var _falcorJsonGraph = require('@graphistry/falcor-json-graph');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function createTestServices() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


    var g = {
        genres: [(0, _falcorJsonGraph.$ref)('listsById[123]'), (0, _falcorJsonGraph.$ref)('listsById[456]'), (0, _falcorJsonGraph.$ref)('listsById[789]')],
        listsById: {
            123: {
                id: 123,
                name: 'Action flicks',
                titles: [(0, _falcorJsonGraph.$ref)('titlesById[\'abc\']')]
            },
            456: {
                id: 456,
                name: 'Kid flicks',
                titles: [(0, _falcorJsonGraph.$ref)('titlesById[\'def\']')]
            },
            789: {
                id: 789,
                name: 'Starring Arnold Schwarzenegger',
                titles: [(0, _falcorJsonGraph.$ref)('titlesById[\'abc\']'), (0, _falcorJsonGraph.$ref)('titlesById[\'def\']'), (0, _falcorJsonGraph.$ref)('titlesById[\'ghi\']')]
            }
        },
        titlesById: {
            abc: {
                id: 'abc',
                rating: 25,
                name: 'True Lies'
            },
            def: {
                id: 'def',
                rating: 15,
                name: 'Kindergarten Cop'
            },
            ghi: {
                id: 'ghi',
                rating: 75,
                name: 'The Terminator'
            }
        }
    };

    var loadGenres = function loadGenres() {
        return _Observable.Observable.from([g]).let(letDelayEach(options.app));
    };
    var loadListsById = function loadListsById(_ref) {
        var listIds = _ref.listIds;

        return _Observable.Observable.from(listIds.map(function (id) {
            return {
                list: g.listsById[id]
            };
        })).let(letDelayEach(options.genres));
    };
    var loadTitlesById = function loadTitlesById(_ref2) {
        var titleIds = _ref2.titleIds;

        return _Observable.Observable.from(titleIds.map(function (id) {
            return {
                title: g.titlesById[id]
            };
        })).let(letDelayEach(options.titles));
    };

    return {
        loadGenres: loadGenres,
        loadListsById: loadListsById,
        loadTitlesById: loadTitlesById
    };
}

function letDelayEach() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var index = arguments[1];

    return function (source) {
        if (options.batch === true) {
            return source.toArray();
        } else if (typeof options.delay === 'number') {
            return source.concatMap(function (x) {
                return _Observable.Observable.timer(options.delay).mapTo(x);
            });
        } else if (Array.isArray(options.delay)) {
            if (typeof index === 'number') {
                return _Observable.Observable.timer(options.delay[index]).mergeMapTo(source);
            } else {
                return source.mergeMap(function (x, i) {
                    return _Observable.Observable.timer(options.delay[i]).mapTo(x);
                });
            }
        }
        return source;
    };
}
//# sourceMappingURL=test-services.js.map