import React from 'react';
import { mount } from 'enzyme';
import TestUtils from 'react-dom/test-utils';

import Provider from '../Provider';
import { testInit } from './test-init';

describe('Provider', () => {

    class Child extends React.Component {
        static contextTypes = Provider.childContextTypes;
        render() { return <div /> }
    }

    it('Should store the falcorModel in Provider state', () => {
        const { App, model } = testInit();
        const wrapper = mount(
            <Provider falcorModel={model}>
                <Child/>
            </Provider>
        );
        expect(wrapper.state('falcorModel')).toBe(model);
    });

    it('Should make the falcorModel available in the context', () => {
        const { App, model } = testInit();
        const tree = TestUtils.renderIntoDocument(
            <Provider falcorModel={model}>
                <Child/>
            </Provider>
        )
        const child = TestUtils.findRenderedComponentWithType(tree, Child)
        expect(child.context.falcorModel).toBe(model);
    });
});

