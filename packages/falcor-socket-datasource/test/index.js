import Rx4 from 'rx';
import Rx5 from 'rxjs';
import Chai from 'chai';
import { devDependencies } from '../package';
import socketDataSourceTests from './tests.socket';
import eventEmitterDataSourceTests from './tests.events';

Chai.config.showDiff = true;

describe(`Falcor Event Emitter DataSource with Rx v${devDependencies.rx}`, function() {
    eventEmitterDataSourceTests(Rx4, false);
});

describe(`Falcor Event Emitter DataSource with Rx v${devDependencies.rx} and recycled JSON`, function() {
    eventEmitterDataSourceTests(Rx4, true);
});

describe(`Falcor Event Emitter DataSource with Rx v${devDependencies.rxjs}`, function() {
    eventEmitterDataSourceTests(Rx5, false);
});

describe(`Falcor Event Emitter DataSource with Rx v${devDependencies.rxjs} and recycled JSON`, function() {
    eventEmitterDataSourceTests(Rx5, true);
});

describe(`Falcor Socket DataSource with Rx v${devDependencies.rx}`, function() {
    socketDataSourceTests(Rx4, false);
});

describe(`Falcor Socket DataSource with Rx v${devDependencies.rx} and recycled JSON`, function() {
    socketDataSourceTests(Rx4, true);
});

describe(`Falcor Socket DataSource with Rx v${devDependencies.rxjs}`, function() {
    socketDataSourceTests(Rx5, false);
});

describe(`Falcor Socket DataSource with Rx v${devDependencies.rxjs} and recycled JSON`, function() {
    socketDataSourceTests(Rx5, true);
});
