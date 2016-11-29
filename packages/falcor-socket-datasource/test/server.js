import Router from './router';
import SocketIOServer from 'socket.io';
import { FalcorPubSubDataSink } from '../src';

export default class Server {
    constructor(event = 'falcor-operation',
                cancel = 'cancel-falcor-operation') {
        this.socket = new SocketIOServer({
            path: `/socket.io`, serveClient: false
        });
        this.socket.on('connection', (socket) => {
            const sink = new FalcorPubSubDataSink(
                {
                    on: socket.on.bind(socket),
                    off: socket.removeListener.bind(socket),
                    emit: socket.emit.bind(socket),
                },
                () => Router, event, cancel);

            socket.on(event, sink.response);
        });
    }
}
