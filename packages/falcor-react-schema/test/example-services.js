import { ref as $ref } from '@graphistry/falcor-json-graph';

export function createExampleServices() {

    let g = {
        genres: [
            $ref(`listsById[123]`),
            $ref(`listsById[456]`)
        ],
        listsById: {
            123: {
                id: 123,
                0: $ref(`titlesById[123]`)
            },
            456: {
                id: 456,
                0: $ref(`titlesById[456]`)
            }
        },
        titlesById: {
            123: {
                id: 123,
                rating: 25,
                name: 'True Lies'
            },
            456: {
                id: 456,
                rating: 15,
                name: 'Kindergarten Cop'
            }
        }
    };

    const loadGenres = () => [g];
    const loadListsById = ({ listIds }) => listIds.map((id) => ({
        list: g.listsById[id]
    }));
    const loadTitlesById = ({ titleIds }) => titleIds.map((id) => ({
        title: g.titlesById[id]
    }));

    return {
        loadGenres,
        loadListsById,
        loadTitlesById
    };
}
