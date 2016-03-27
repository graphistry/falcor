import Rx from "rx";
import SocketIoClient from "socket.io-client";
import Uuid from "uuid";

export default class FalcorWebSocketDataSource {

	constructor(url, config, event = "falcor") {
		this.socket = new SocketIoClient(url, config);
		this.event = event;
	}

	call(functionPath, args, refSuffixes, thisPaths) {
		return this.subscribe("call", { args, functionPath, refSuffixes, thisPaths });
	}

	get(pathSets) {
		return this.subscribe("get", { pathSets });
	}

	set(jsonGraphEnvelope) {
		return this.subscribe("set", { jsonGraphEnvelope });
	}

	subscribe(method, parameters) {
		const id = Uuid();
		this.socket.emit(this.event, { id, method, ...parameters });
		return Rx.Observable.create((observer) => {
			this.socket.on(this.event, (data) => {
				if (data.id === id) {
					observer.onNext(data);
					observer.onCompleted();
				}
			});
		});
	}

}
