import http from 'http';
import Router from "./router";
import Falcor from '@graphistry/falcor';
import SocketIO from 'socket.io-client';
import SocketIOServer from "socket.io";
import { FalcorPubSubDataSink } from "../source";
import { FalcorPubSubDataSource } from '../source';
import tests, { eventName, cancelName } from './tests.base';

export default function socketDataSourceTests(Rx, recycleJSON) {

    const context = {};

    let model = null, source = null;
    let socketServer = null, server = null;

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

                socket.on(eventName, new FalcorPubSubDataSink(
                    socket, () => new Router({ streaming: true }), eventName, cancelName
                ).response);

                if (source.socket.connected) {
                    setImmediate(() => done());
                } else {
                    source.socket.on('connect', onClientConnect);
                    function onClientConnect(clientSocket) {
                        source.socket.off('connect', onClientConnect);
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
