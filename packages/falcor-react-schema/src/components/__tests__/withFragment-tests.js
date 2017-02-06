import React from 'react';
import renderer from 'react-test-renderer';

import Provider from '../Provider';
import { testInit } from './test-init';

describe('withFragment', () => {

    it('should fetch all the data for a container', () => {
        const { App, model } = testInit();
        return App
            .load({ model })
            .do((x) => expect(x.data).toMatchSnapshot())
            .toPromise();
    });

    it('should fetch all the data for a container and emit intermediate states when renderLoading is true', () => {
        const { App, model } = testInit();
        return App
            .load({ model, renderLoading: true })
            .do((x) => expect(x.data).toMatchSnapshot())
            .toPromise();
    });

    it('Should render the full component tree without batching', () => {
        const { App, model } = testInit();
        expect(renderer.create(
            <Provider falcorModel={model.unbatch()}>
                <App/>
            </Provider>
        ).toJSON()).toMatchSnapshot();
    });
});
