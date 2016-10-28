import SocketIo from "socket.io";

import Router from "./router";
import { FalcorPubSubDataSink } from "../source";

export default class Server {

    constructor(port = 8080, config = { path: "/" }, event = "falcor-operation", cancel = "cancel-falcor-operation") {

        this.socket = new SocketIo();
        this.socket.on("connection", (socket) => {

            const sink = new FalcorPubSubDataSink(
                {
                    on: socket.on.bind(socket),
                    off: socket.removeListener.bind(socket),
                    emit: socket.emit.bind(socket),
                },
                () => Router, event, cancel);

            socket.on(event, sink.response);
        });

        this.socket.listen(port, config);
    }

    getUrl() {
        return `ws://localhost:${this.socket.httpServer.address().port}`;
    }

}
