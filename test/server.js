import SocketIo from "socket.io";

import Router from "./router";

export default class Server {

	constructor(port = 8080, config = { path: "/" }, event = "falcor", cancel = "cancel_falcor_operation") {
		this.socket = new SocketIo();
		this.socket.on("connection", (socket) => {
			socket.on(event, onEvent);

			function onEvent({ id, args, functionPath, jsonGraphEnvelope, method, pathSets, refSuffixes, thisPaths }) {
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

				const responseToken = `${event}_${id}`;
				const cancellationToken = `${cancel}_${id}`;

				let results = null;
				let operationIsDone = false;
				let handleCancellationForId = null;

				const operation = Router[method](...parameters).subscribe(
					(data) => {
						results = data;
					},
					(error) => {
						operationIsDone = true;
						if (handleCancellationForId !== null) {
							socket.removeListener(cancellationToken, handleCancellationForId);
						}
						socket.emit(responseToken, { error, ...results });
					},
					() => {
						operationIsDone = true;
						if (handleCancellationForId !== null) {
							socket.removeListener(cancellationToken, handleCancellationForId);
						}
						socket.emit(responseToken, { ...results });
					}
				);

				if (!operationIsDone) {
					socket.on(
						cancellationToken,
						handleCancellationForId = function() {
							if (operationIsDone === true) {
								return;
							}
							operationIsDone = true;
							socket.removeListener(cancellationToken, handleCancellationForId);
							if (typeof operation.dispose === "function") {
								operation.dispose();
							} else if (typeof operation.unsubscribe === "function") {
								operation.unsubscribe();
							}
						}
					);
				}
			}
		});
		this.socket.listen(port, config);
	}

	getUrl() {
		return `ws://localhost:${this.socket.httpServer.address().port}`;
	}

}
