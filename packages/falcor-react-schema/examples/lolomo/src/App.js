import React from 'react';
import Provider from '@graphistry/falcor-react-schema/lib/components/Provider';
import { testInit } from '@graphistry/falcor-react-schema/lib/components/__tests__/test-init';

const { App: Lolomo, model } = testInit();

const App = () => (
  <Provider falcorModel={model}>
    <Lolomo/>
  </Provider>
);

export default App;