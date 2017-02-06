import Router from '@graphistry/falcor-router';
import { createTestServices } from './test-services';
import { createTestContainers } from './test-containers';

describe('withSchema', () => {
    describe('get', getTests);
    describe('set', setTests);
});

function getTests() {

    it('should traverse the JSON tree and return the data', () => {

        const { App } = createTestContainers();
        const schema = App.schema(createTestServices());
        const router = new Router(schema.toArray());

        return router.get([
            ['genres', 'length'],
            ['genres', 0, 'titles', 0, 'name']
        ])
        .do((x) => expect(x).toMatchSnapshot())
        .toPromise();
    });
}

function setTests() {

    it('should traverse the JSON tree and set the data', () => {

        const { App } = createTestContainers();
        const schema = App.schema(createTestServices());
        const router = new Router(schema);

        return router.set({
            paths: [
                ['genres', [0, 1], 'titles', 0, ['name', 'rating']]
            ],
            jsonGraph: {
                genres: {
                    0: {
                        titles: {
                            0: {
                                rating: 75,
                                name: 'Total Recall'
                            }
                        }
                    },
                    1: {
                        titles: {
                            0: {
                                rating: 50,
                                name: 'Independence Day'
                            }
                        }
                    }
                }
            }
        })
        .do((x) => expect(x).toMatchSnapshot())
        .toPromise();
    });
}
