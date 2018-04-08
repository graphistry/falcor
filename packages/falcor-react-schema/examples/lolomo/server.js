const http = require('http');
const SocketIOServer = require('socket.io');
const Router = require('@graphistry/falcor-router');
const { FalcorPubSubDataSink } = require('@graphistry/falcor-socket-datasource');
const { createTestServices } = require('@graphistry/falcor-react-schema/lib/components/__tests__/test-services');
const { createTestContainers } = require('@graphistry/falcor-react-schema/lib/components/__tests__/test-containers');

const { App } = createTestContainers();
const schema = App.schema(createTestServices());
const routes = schema.toArray();

const server = new http.Server();
const socketServer = new SocketIOServer(server, { serveClient: false });
socketServer.on('connection', onConnection);

server.listen(3000, '127.0.0.1', () => {});

function onConnection(socket) {

    socketServer.sockets.removeListener('connection', onConnection);

    const sink = new FalcorPubSubDataSink(socket, () => new Router(routes));

    socket.on(sink.event, sink.response);

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