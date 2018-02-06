import { get } from '../src';
import { expect } from 'chai';
import Router from '@graphistry/falcor-router';
import { routes } from '@graphistry/falcor-query-syntax';
import { ref as $ref, pathValue as $value } from '@graphistry/falcor-json-graph';

describe('get handler', () => {
    it('should traverse the JSON tree and return the data', (done) => {

        var routes = getRoutes();
        var router = new Router(routes);

        router.get([
            ['genreLists', 'length'],
            ['genreLists', 0, 0, 'name']
        ])
        .do((x) => {
            expect(x).to.deep.equal({
                paths: [
                    ['genreLists', 'length'],
                    ['genreLists', 0, 0, 'name']
                ],
                jsonGraph: {
                    genreLists: {
                        length: 1,
                        0: $ref(`listsById[123]`)
                    },
                    listsById: {
                        123: { 0: $ref(`titlesById[123]`) }
                    },
                    titlesById: {
                        123: { name: 'True Lies' }
                    }
                }
            });
        })
        .subscribe(null, done, done);
    });
});


function getRoutes() {

    var g = {
        genreLists: [$ref(`listsById[123]`)],
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
                [{ ranges: videoIndexes }]: ${{
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
                    })
                }}
            }
        }
    }`;
}
