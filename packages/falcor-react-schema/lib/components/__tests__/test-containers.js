'use strict';

var _defineProperties = require('babel-runtime/core-js/object/define-properties');

var _defineProperties2 = _interopRequireDefault(_defineProperties);

var _freeze = require('babel-runtime/core-js/object/freeze');

var _freeze2 = _interopRequireDefault(_freeze);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _templateObject = _taggedTemplateLiteral(['{\n            [id, name]: ', ',\n            rating: ', '\n        }'], ['{\n            [id, name]: ', ',\n            rating: ', '\n        }']),
    _templateObject2 = _taggedTemplateLiteral(['{\n            [id, name]: ', ',\n            titles: {\n                length: ', ',\n                [{ integers: titleIndexes }]: ', '\n            }\n        }'], ['{\n            [id, name]: ', ',\n            titles: {\n                length: ', ',\n                [{ integers: titleIndexes }]: ', '\n            }\n        }']),
    _templateObject3 = _taggedTemplateLiteral(['{\n            genres: {\n                length: ', ',\n                [{ integers: listIndexes }]: ', '\n            },\n            listsById: {\n                [{ keys: listIds }]: ', '\n            },\n            titlesById: {\n                [{ keys: titleIds }]: ', '\n            }\n        }'], ['{\n            genres: {\n                length: ', ',\n                [{ integers: listIndexes }]: ', '\n            },\n            listsById: {\n                [{ keys: listIds }]: ', '\n            },\n            titlesById: {\n                [{ keys: titleIds }]: ', '\n            }\n        }']);

exports.createTestContainers = createTestContainers;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _withSchema = require('../withSchema');

var _withSchema2 = _interopRequireDefault(_withSchema);

var _withFragment = require('../withFragment');

var _withFragment2 = _interopRequireDefault(_withFragment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return (0, _freeze2.default)((0, _defineProperties2.default)(strings, { raw: { value: (0, _freeze2.default)(raw) } })); }

function createTestContainers() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$App = _ref.App,
        App = _ref$App === undefined ? AppView : _ref$App,
        _ref$Genre = _ref.Genre,
        Genre = _ref$Genre === undefined ? GenreView : _ref$Genre,
        _ref$Title = _ref.Title,
        Title = _ref$Title === undefined ? TitleView : _ref$Title;

    var titleConfig = createTitleContainer({ Title: Title });
    var genreConfig = createGenreContainer(_extends({ Genre: Genre }, titleConfig));
    var appConfig = createAppContainer(_extends({ App: App }, titleConfig, genreConfig));

    App = appConfig.App;
    Genre = genreConfig.Genre;
    Title = titleConfig.Title;

    return _extends({}, appConfig, genreConfig, titleConfig);

    function AppView(_ref2) {
        var _ref2$genres = _ref2.genres,
            genres = _ref2$genres === undefined ? [] : _ref2$genres;

        return _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
                'h1',
                null,
                'Genres'
            ),
            _react2.default.createElement(
                'ul',
                { className: 'genreList' },
                genres.map(function (genre, index) {
                    return _react2.default.createElement(
                        'li',
                        { key: index + ': ' + genre.id },
                        _react2.default.createElement(Genre, { falcorData: genre })
                    );
                })
            )
        );
    }

    function GenreView(_ref3) {
        var name = _ref3.name,
            _ref3$titles = _ref3.titles,
            titles = _ref3$titles === undefined ? [] : _ref3$titles;

        return _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
                'h3',
                null,
                name
            ),
            _react2.default.createElement(
                'ul',
                { className: 'titlesList' },
                titles.map(function (title, index) {
                    return _react2.default.createElement(
                        'li',
                        { key: index + ': ' + title.id },
                        _react2.default.createElement(Title, { falcorData: title })
                    );
                })
            )
        );
    }

    function TitleView(_ref4) {
        var id = _ref4.id,
            name = _ref4.name,
            rating = _ref4.rating;

        return _react2.default.createElement(
            'div',
            { className: 'title' },
            _react2.default.createElement(
                'h6',
                null,
                name,
                ' - ',
                rating,
                '/100'
            )
        );
    }
}

function createTitleContainer() {
    var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref5$Title = _ref5.Title,
        Title = _ref5$Title === undefined ? function () {
        return null;
    } : _ref5$Title;

    var withTitleFragment = (0, _withFragment2.default)(function () {
        var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            id = _ref6.id,
            name = _ref6.name,
            rating = _ref6.rating;

        var componentProps = arguments[1];

        return '{ id, name, rating }';
    });

    var withTitleSchema = (0, _withSchema2.default)(function (QL, _ref7, context) {
        var get = _ref7.get,
            set = _ref7.set;


        var loadTitlesById = context.loadTitlesById;
        var readTitlesById = { get: get(loadTitlesById) };
        var readWriteTitlesRating = {
            get: get(loadTitlesById),
            set: set(loadTitlesById)
        };

        return QL(_templateObject, readTitlesById, readWriteTitlesRating);
    });

    return { withTitleSchema: withTitleSchema, withTitleFragment: withTitleFragment, Title: withTitleSchema(withTitleFragment(Title)) };
}

function createGenreContainer() {
    var _ref8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        Title = _ref8.Title,
        _ref8$Genre = _ref8.Genre,
        Genre = _ref8$Genre === undefined ? function () {
        return null;
    } : _ref8$Genre;

    var withGenreFragment = (0, _withFragment2.default)(function () {
        var _ref9 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            titles = _ref9.titles;

        var componentProps = arguments[1];

        return '{\n            id, name, titles: ' + Title.fragments(titles) + '\n        }';
    });

    var withGenreSchema = (0, _withSchema2.default)(function (QL, _ref10, context) {
        var get = _ref10.get,
            set = _ref10.set;


        var loadListsById = context.loadListsById;
        var readListsById = { get: get(loadListsById) };

        return QL(_templateObject2, readListsById, readListsById, readListsById);
    });

    return { withGenreSchema: withGenreSchema, withGenreFragment: withGenreFragment, Genre: withGenreSchema(withGenreFragment(Genre)) };
}

function createAppContainer() {
    var _ref11 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        Genre = _ref11.Genre,
        Title = _ref11.Title,
        _ref11$App = _ref11.App,
        App = _ref11$App === undefined ? function () {
        return null;
    } : _ref11$App;

    var withAppFragment = (0, _withFragment2.default)(function () {
        var _ref12 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            genres = _ref12.genres;

        var componentProps = arguments[1];

        return '{\n            genres: ' + Genre.fragments(genres) + '\n        }';
    });

    var withAppSchema = (0, _withSchema2.default)(function (QL, _ref13, context) {
        var get = _ref13.get,
            set = _ref13.set;

        var loadGenres = context.loadGenres;
        var readGenres = { get: get(loadGenres) };
        return QL(_templateObject3, readGenres, readGenres, Genre.schema(context), Title.schema(context));
    });

    return { withAppSchema: withAppSchema, withAppFragment: withAppFragment, App: withAppSchema(withAppFragment(App)) };
}
//# sourceMappingURL=test-containers.js.map