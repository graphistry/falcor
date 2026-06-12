import Rx4 from 'rx';
import Rx5 from 'rxjs';
import Chai from 'chai';
import { devDependencies } from '../package';
import socketDataSourceTests, { matrix } from './tests.socket';
import eventEmitterDataSourceTests from './tests.events';
import postMessageDataSourceTests from './tests.postmessage';

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

describe(`Falcor PostMessage DataSource with Rx v${devDependencies.rx}`, function() {
    postMessageDataSourceTests(Rx4, false);
});

describe(`Falcor PostMessage DataSource with Rx v${devDependencies.rx} and recycled JSON`, function() {
    postMessageDataSourceTests(Rx4, true);
});

describe(`Falcor PostMessage DataSource with Rx v${devDependencies.rxjs}`, function() {
    postMessageDataSourceTests(Rx5, false);
});

describe(`Falcor PostMessage DataSource with Rx v${devDependencies.rxjs} and recycled JSON`, function() {
    postMessageDataSourceTests(Rx5, true);
});

// socket.io 2 ⇄ 4 compatibility matrix (see tests.socket.js): same Source⇄Sink
// behavior over real sockets for v2⇄v2, v4⇄v4, and the v4-server(allowEIO3)⇄v2-client
// bridge used for staged production rollouts.
Object.keys(matrix).forEach((combo) => {

    describe(`Falcor Socket DataSource over ${combo} with Rx v${devDependencies.rx}`, function() {
        socketDataSourceTests(Rx4, false, matrix[combo]);
    });

    describe(`Falcor Socket DataSource over ${combo} with Rx v${devDependencies.rx} and recycled JSON`, function() {
        socketDataSourceTests(Rx4, true, matrix[combo]);
    });

    describe(`Falcor Socket DataSource over ${combo} with Rx v${devDependencies.rxjs}`, function() {
        socketDataSourceTests(Rx5, false, matrix[combo]);
    });

    describe(`Falcor Socket DataSource over ${combo} with Rx v${devDependencies.rxjs} and recycled JSON`, function() {
        socketDataSourceTests(Rx5, true, matrix[combo]);
    });
});
