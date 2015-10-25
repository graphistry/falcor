import SocketIo from "socket.io";

import Router from "./router";

export default class Server {

	constructor(port = 8080, config = { path: "/" }, event = "falcor") {
		this.socket = new SocketIo();
		this.socket.on("connection", (socket) => {
			socket.on(event, ({ args, functionPath, id, jsonGraphEnvelope, method, pathSets, refSuffixes, thisPaths }) => {
				if (["call", "get", "set"].includes(method)) {
					let parameters = [];
					switch (method) {
						case "call":
							parameters = [functionPath, args, refSuffixes, thisPaths];
							break;
						case "get":
							parameters = [pathSets];
							break;
						case "set":
							parameters = [jsonGraphEnvelope];
							break;
					}
					Router[method](...parameters).subscribe((data) => {
						data.id = id;
						socket.emit(event, data);
					});
				} else {
					throw new Error(method + " is not a valid method");
				}
			});
		});
		this.socket.listen(port, config);
	}

	getUrl() {
		return "ws://localhost:" + this.socket.httpServer.address().port;
	}

}
