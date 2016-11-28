import Rx4 from 'rx';
import Rx5 from 'rxjs';
import Chai from 'chai';
import { devDependencies } from '../package';
import socketDataSourceTests from './tests.socket';
import eventEmitterDataSourceTests from './tests.events';

Chai.config.showDiff = true;

describe(`Falcor Event Emitter DataSource with Rx v${devDependencies.rx}`, function() {
    this.timeout(5000);
    eventEmitterDataSourceTests(Rx4, false);
});

describe(`Falcor Event Emitter DataSource with Rx v${devDependencies.rx} and recycled JSON`, function() {
    this.timeout(5000);
    eventEmitterDataSourceTests(Rx4, true);
})

describe(`Falcor Event Emitter DataSource with Rx v${devDependencies.rxjs}`, function() {
    this.timeout(5000);
    eventEmitterDataSourceTests(Rx5, false);
});

describe(`Falcor Event Emitter DataSource with Rx v${devDependencies.rxjs} and recycled JSON`, function() {
    this.timeout(5000);
    eventEmitterDataSourceTests(Rx5, true);
});

describe(`Falcor Socket DataSource with Rx v${devDependencies.rx}`, function() {
    this.timeout(5000);
    socketDataSourceTests(Rx4, false);
});

describe(`Falcor Socket DataSource with Rx v${devDependencies.rx} and recycled JSON`, function() {
    this.timeout(5000);
    socketDataSourceTests(Rx4, true);
});

describe(`Falcor Socket DataSource with Rx v${devDependencies.rxjs}`, function() {
    this.timeout(5000);
    socketDataSourceTests(Rx5, false);
});

describe(`Falcor Socket DataSource with Rx v${devDependencies.rxjs} and recycled JSON`, function() {
    this.timeout(5000);
    socketDataSourceTests(Rx5, true);
});
