import { expect } from 'chai';
import Router from '@graphistry/falcor-router';
import { createExampleSchema } from './example-schema';
import { createExampleServices } from './example-services';
import { ref as $ref } from '@graphistry/falcor-json-graph';

describe('set handler', () => {
    it('should traverse the JSON tree and set the data', (done) => {

        const Container = createExampleSchema();
        const schema = Container.schema(createExampleServices());
        const router = new Router(schema);

        router.set({
            paths: [
                ['genres', [0, 1], 0, ['name', 'rating']]
            ],
            jsonGraph: {
                genres: {
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
                    ['genres', {from:0, to:1}, 0, ['name', 'rating']]
                ],
                jsonGraph: {
                    genres: {
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
