import SocketIo from "socket.io";

import Router from "./router";

export default class Server {

	constructor(port = 8080, config = { path: "/" }, event = "falcor") {
		this.socket = new SocketIo();
		this.socket.on("connection", (socket) => {
			socket.on(event, ({ args, functionPath, id, jsonGraphEnvelope, method, pathSets, refSuffixes, thisPaths }) => {
				let parameters = [];
				if (method === "call") {
					parameters = [functionPath, args, refSuffixes, thisPaths];
				} else if (method === "get") {
					parameters = [pathSets];
				} else if (method === "set") {
					parameters = [jsonGraphEnvelope];
				} else {
					throw new Error(`${method} is not a valid method`);
				}
				Router[method](...parameters).subscribe((data) => {
					socket.emit(event, { ...data, id });
				});
			});
		});
		this.socket.listen(port, config);
	}

	getUrl() {
		return `ws://localhost:${this.socket.httpServer.address().port}`;
	}

}
