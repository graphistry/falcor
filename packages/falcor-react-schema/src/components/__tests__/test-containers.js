import React from 'react';
import withSchema from '../withSchema';
import withFragment from '../withFragment';

export function createTestContainers({
    App = AppView, Genre = GenreView, Title = TitleView
} = {}) {

    const titleConfig = createTitleContainer({ Title });
    const genreConfig = createGenreContainer({ Genre, ...titleConfig });
    const appConfig = createAppContainer({ App, ...titleConfig, ...genreConfig });

    App = appConfig.App;
    Genre = genreConfig.Genre;
    Title = titleConfig.Title;

    return { ...appConfig, ...genreConfig, ...titleConfig };

    function AppView({ genres = [] }) {
        return (
            <div>
                <h1>Genres</h1>
                <ul>
                {genres.map((genre, index) => (
                    <li key={`${index}: ${genre.id}`}>
                        <Genre falcorData={genre}/>
                    </li>
                ))}
                </ul>
            </div>
        );
    }

    function GenreView({ name, titles = [] }) {
        return (
            <div>
                <h3>{name}</h3>
                <ul>
                {titles.map((title, index) => (
                    <li key={`${index}: ${title.id}`}>
                        <Title falcorData={title}/>
                    </li>
                ))}
                </ul>
            </div>
        );
    }

    function TitleView({ id, name, rating }) {
        return (
            <div>
                <h6>{name} - {rating}/100</h6>
            </div>
        );
    }
}

function createTitleContainer({ Title = (() => null) } = {}) {

    const withTitleFragment = withFragment(({ id, name, rating } = {}, componentProps) => {
        return `{ id, name, rating }`;
    });

    const withTitleSchema = withSchema((QL, { get, set }, context) => {

        const loadTitlesById = context.loadTitlesById;
        const readTitlesById = { get: get(loadTitlesById) };
        const readWriteTitlesRating = {
            get: get(loadTitlesById),
            set: set(loadTitlesById)
        };

        return QL`{
            [id, name]: ${ readTitlesById },
            rating: ${ readWriteTitlesRating }
        }`
    });

    return { withTitleSchema, withTitleFragment, Title: withTitleSchema(withTitleFragment(Title)) };
}

function createGenreContainer({ Title, Genre = (() => null) } = {}) {

    const withGenreFragment = withFragment(({ titles } = {}, componentProps) => {
        return `{
            id, titles: ${
                Title.fragments(titles)
            }
        }`;
    });

    const withGenreSchema = withSchema((QL, { get, set }, context) => {

        const loadListsById = context.loadListsById;
        const readListsById = { get: get(loadListsById) };

        return QL`{
            id: ${ readListsById },
            titles: {
                length: ${ readListsById },
                [{ integers: titleIndexes }]: ${
                    readListsById
                }
            }
        }`;
    });

    return { withGenreSchema, withGenreFragment, Genre: withGenreSchema(withGenreFragment(Genre)) };
}

function createAppContainer({ Genre, Title, App = (() => null) } = {}) {

    const withAppFragment = withFragment(({ genres } = {}, componentProps) => {
        return `{
            genres: ${
                Genre.fragments(genres)
            }
        }`;
    });

    const withAppSchema = withSchema((QL, { get, set }, context) => {
        const loadGenres = context.loadGenres;
        const readGenres = { get: get(loadGenres) };
        return QL`{
            genres: {
                length: ${ readGenres },
                [{ integers: listIndexes }]: ${
                    readGenres
                }
            },
            listsById: {
                [{ keys: listIds }]: ${
                    Genre.schema(context)
                }
            },
            titlesById: {
                [{ keys: titleIds }]: ${
                    Title.schema(context)
                }
            }
        }`;
    });

    return { withAppSchema, withAppFragment, App: withAppSchema(withAppFragment(App)) };
}
