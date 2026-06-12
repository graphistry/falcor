import http from 'http';
import Router from './router';
import Falcor from '@graphistry/falcor';
import SocketIOClientV2 from 'socket.io-client';
import SocketIOServerV2 from 'socket.io';
import { io as SocketIOClientV4 } from 'socket.io-client-v4';
import { Server as SocketIOServerV4 } from 'socket.io-v4';
import { FalcorPubSubDataSink } from '../src';
import { FalcorPubSubDataSource } from '../src';
import tests, { eventName, cancelName } from './tests.base';

// Overridable so local runs can dodge ports already in use (CI default: 3000).
const PORT = Number(process.env.FALCOR_SOCKET_TEST_PORT || 3000);

// socket.io 2 ⇄ 4 compatibility matrix. The Source/Sink only use
// on/emit/removeListener + trailing acks + dynamic event names, which are
// unchanged across socket.io 2 → 4, so every combination must behave the same.
// The v4-server + v2-client combo exercises the Engine.IO 3 bridge
// (allowEIO3: true) that staged production rollouts rely on (server upgrades
// before clients do).
export const matrix = {
    'socket.io v2 server ⇄ v2 client': {
        createServer: (httpServer) => new SocketIOServerV2(httpServer, { serveClient: false }),
        createClient: (url) => SocketIOClientV2(url, { forceNew: true })
    },
    'socket.io v4 server ⇄ v4 client': {
        createServer: (httpServer) => new SocketIOServerV4(httpServer, { serveClient: false }),
        createClient: (url) => SocketIOClientV4(url, { forceNew: true })
    },
    'socket.io v4 server (allowEIO3) ⇄ v2 client': {
        createServer: (httpServer) => new SocketIOServerV4(httpServer, { serveClient: false, allowEIO3: true }),
        createClient: (url) => SocketIOClientV2(url, { forceNew: true })
    }
};

export default function socketDataSourceTests(
    Rx, recycleJSON,
    { createServer, createClient } = matrix['socket.io v2 server ⇄ v2 client']) {

    const context = {};

    let socketServer = null, server = null, clientSocket = null;
    let model = null, sink = null, source = null;

    tests(Rx, context,
        function before(done) {

            model = context.model = new Falcor.Model({ recycleJSON });
            clientSocket = createClient(`ws://localhost:${PORT}/`);
            source = model._source = new FalcorPubSubDataSource(
                clientSocket, model, eventName, cancelName);

            server = new http.Server();
            socketServer = createServer(server);
            socketServer.on('connection', onConnection);

            server.listen(PORT, '127.0.0.1', () => {});

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
        function after(done) {
            // stop the client from reconnecting to the next suite's server on
            // the shared port (suites run back to back; some tests swap
            // source.emitter for a spy, so keep our own socket reference)
            clientSocket.close();
            const httpServer = server;
            const io = socketServer;
            server = null;
            socketServer = null;
            source = null;
            clientSocket = null;
            // wait for the port to actually free up before the next before()
            io.close(() => httpServer.listening ? httpServer.close(() => done()) : done());
        });
}
