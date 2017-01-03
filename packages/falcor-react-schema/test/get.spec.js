import { expect } from 'chai';
import Router from '@graphistry/falcor-router';
import { createExampleSchema } from './example-schema';
import { createExampleServices } from './example-services';
import { ref as $ref } from '@graphistry/falcor-json-graph';

describe('get handler', () => {
    it('should traverse the JSON tree and return the data', (done) => {

        const Container = createExampleSchema();
        const schema = Container.schema(createExampleServices());
        const router = new Router(schema.toArray());

        router.get([
            ['genres', 'length'],
            ['genres', 0, 0, 'name']
        ])
        .do((x) => {
            expect(x).to.deep.equal({
                paths: [
                    ['genres', 'length'],
                    ['genres', 0, 0, 'name']
                ],
                jsonGraph: {
                    genres: {
                        length: 2,
                        0: $ref(`listsById[123]`)
                    },
                    listsById: {
                        123: {
                            0: $ref(`titlesById[123]`)
                        }
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
