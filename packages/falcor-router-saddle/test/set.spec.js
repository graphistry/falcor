import { get } from '../src';
import { set } from '../src';
import { expect } from 'chai';
import Router from '@graphistry/falcor-router';
import { routes } from '@graphistry/falcor-query-syntax';
import { ref as $ref, pathValue as $value } from '@graphistry/falcor-json-graph';

describe('get handler', () => {
    it('should traverse the JSON tree and set the data', (done) => {

        var routes = getRoutes();
        var router = new Router(routes);

        router.set({
            paths: [
                ['genreLists', [0, 1], 0, ['name', 'rating']]
            ],
            jsonGraph: {
                genreLists: {
                    0: {
                        0: {
                            rating: 75,
                            name: 'Total Recall'
                        }
                    },
                    1: {
                        0: {
                            rating: 50,
                            name: 'Independence Day'
                        }
                    }
                }
            }
        })
        .do(function(x) {
            expect(x).to.deep.equal({
                paths: [
                    ['genreLists', {from:0, to:1}, 0, ['name', 'rating']]
                ],
                jsonGraph: {
                    genreLists: {
                        0: $ref(`listsById[123]`),
                        1: $ref(`listsById[456]`)
                    },
                    listsById: {
                        123: {
                            0: $ref(`titlesById[123]`)
                        },
                        456: {
                            0: $ref(`titlesById[456]`)
                        }
                    },
                    titlesById: {
                        123: {
                            rating: 75,
                            name: 'True Lies'
                        },
                        456: {
                            rating: 50,
                            name: 'Kindergarten Cop'
                        }
                    }
                }
            });
        })
        .subscribe(null, done, done);
    });
});


function getRoutes() {

    var g = {
        genreLists: [
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

    const loadRoot = () => [g];
    const loadListsById = ({ listIds }) => listIds.map((id) => ({
        list: g.listsById[id]
    }));
    const loadTitlesById = ({ titleIds }) => titleIds.map((id) => ({
        title: g.titlesById[id]
    }));

    return routes`{
        genreLists: {
            length: ${{
                get: get({ loader: loadRoot })
            }},
            [{ integers: listIndexes }]: ${{
                get: get({ loader: loadRoot })
            }}
        },
        listsById: {
            [{ keys: listIds }]: {
                [{ integers: videoIndexes }]: ${{
                    get: get({
                        lists: ['list'],
                        loader: loadListsById
                    })
                }}
            }
        },
        titlesById: {
            [{ keys: titleIds }]: {
                name: ${{
                    get: get({
                        lists: ['title'],
                        loader: loadTitlesById
                    })
                }},
                rating: ${{
                    get: get({
                        lists: ['title'],
                        loader: loadTitlesById
                    }),
                    set: set({
                        lists: ['title'],
                        loader: loadTitlesById
                    })
                }}
            }
        }
    }`;
}
