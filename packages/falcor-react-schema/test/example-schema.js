import { withSchema } from '../src';

export function createExampleSchema() {

    const List = withSchema((QL, { get, set }, context) => {

        const loadListsById = context.loadListsById;
        const readListsById = { get: get(loadListsById) };

        return QL`{
            [{ integers: videoIndexes }]: ${
                readListsById
            }
        }`;
    })(() => null);

    const Title = withSchema((QL, { get, set }, context) => {

        const loadTitlesById = context.loadTitlesById;
        const readTitleNames = { get: get(loadTitlesById) };
        const readWriteTitleRating = {
            get: get(loadTitlesById),
            set: set(loadTitlesById)
        };

        return QL`{
            name: ${ readTitleNames },
            rating: ${ readWriteTitleRating }
        }`
    })(() => null);

    const App = withSchema((QL, { get, set }, context) => {
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
                    List.schema(context)
                }
            },
            titlesById: {
                [{ keys: titleIds }]: ${
                    Title.schema(context)
                }
            }
        }`;
    })(() => null);

    return App;
}
