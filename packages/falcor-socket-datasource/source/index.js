import SocketIoClient from "socket.io-client";
import Uuid from "uuid";

export default class FalcorWebSocketDataSource {

	constructor(...args) {
		let event = null;
		let socket = null;
		let cancel = null;

		if (typeof args[0] === "string") {
			socket = new SocketIoClient(
				args.shift(),
				args[0] && typeof args[0] === "object" ? args.shift() : {}
			);
		} else {
			socket = args.shift();
		}

		event = args.shift() || "falcor";
		cancel = args.shift() || "cancel_falcor_operation";

		this.socket = socket;
		this.event = event;
		this.cancel = cancel;
	}

	call(functionPath, args, refSuffixes, thisPaths) {
		return this.operation("call", { args, functionPath, refSuffixes, thisPaths });
	}

	get(pathSets) {
		return this.operation("get", { pathSets });
	}

	set(jsonGraphEnvelope) {
		return this.operation("set", { jsonGraphEnvelope });
	}

	operation(method, parameters) {
		return {
			subscribe: subscribe.bind(this, method, parameters)
		};
	}

}

function subscribe(method, parameters, observerOrNext, ...rest) {
	let observer = observerOrNext;

	if (typeof observerOrNext === "function") {
		// Falcor internals still expect DataSources to conform to the Rx4 Observer spec.
		observer = {
			onCompleted: rest[1],
			onError: rest[0],
			onNext: observerOrNext
		};
	}

	let acknowledged = false;

	const id = Uuid();
	const { socket, event, cancel } = this;

	const responseToken = `${event}_${id}`;
	const cancellationToken = `${cancel}_${id}`;

	socket.on(responseToken, handler);
	socket.emit(event, { id, method, ...parameters });

	return {
		dispose() {
			socket.off(responseToken, handler);
			if (!acknowledged) {
				socket.emit(cancellationToken);
			}
		}
	};

	function handler({ error, ...rest }) {
		// Don't emit the cancelation event if the subscription is
		// disposed as a result of `error` or `complete`.
		acknowledged = true;
		if (typeof error !== "undefined") {
			// If there's at least one own-property key in ...rest,
			// notify the subscriber of the data before erroring.
			for (const restKey in rest) {
				if (!rest.hasOwnProperty(restKey)) {
					continue;
				}
				observer.onNext(rest);
				break;
			}
			observer.onError && observer.onError(error);
		} else {
			observer.onNext(rest);
			// todo: update falcor client and router to support
			// streaming, then update socket datasource with `nextEvent`
			// 'errorEvent', and `completeEvent` constructor args.
			observer.onCompleted && observer.onCompleted();
		}
	}
}
