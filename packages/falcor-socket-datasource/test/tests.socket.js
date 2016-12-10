import http from 'http';
import Router from './router';
import Falcor from '@graphistry/falcor';
import SocketIO from 'socket.io-client';
import SocketIOServer from 'socket.io';
import { FalcorPubSubDataSink } from '../src';
import { FalcorPubSubDataSource } from '../src';
import tests, { eventName, cancelName } from './tests.base';

export default function socketDataSourceTests(Rx, recycleJSON) {

    const context = {};

    let socketServer = null, server = null;
    let model = null, sink = null, source = null;

    tests(Rx, context,
        function before(done) {

            model = context.model = new Falcor.Model({ recycleJSON });
            source = model._source = new FalcorPubSubDataSource(new SocketIO(
                `ws://localhost:3000/`, { forceNew: true }
            ), model, eventName, cancelName);

            server = new http.Server();
            socketServer = new SocketIOServer(server, { serveClient: false });
            socketServer.on('connection', onConnection);

            server.listen(3000, '127.0.0.1', () => {});

            function onConnection(socket) {

                socketServer.sockets.removeListener('connection', onConnection);

                sink = context.sink = context.sink = new FalcorPubSubDataSink(
                    socket, () => new Router(), eventName, cancelName
                );

                socket.on(eventName, sink.response);

                if (source.emitter.connected) {
                    setImmediate(() => done());
                } else {
                    source.emitter.on('connect', onClientConnect);
                    function onClientConnect(clientSocket) {
                        source.emitter.off('connect', onClientConnect);
                        setImmediate(() => done());
                    }
                }
            }
        },
        function after() {
            socketServer.close();
            server.close();
            server = null;
            socketServer = null;
        });
}
