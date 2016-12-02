import { simpleflake } from 'simpleflakes';

export class FalcorPubSubDataSource {
    constructor(socket, model, event = 'falcor-operation', cancel = 'cancel-falcor-operation') {
        this.event = event;
        this.model = model;
        this.cancel = cancel;
        this.socket = socket;
    }
    call(callPath, callArgs, suffixes, thisPaths) {
        if (!Array.isArray(callPath)) { callPath = [callPath]; }
        if (!Array.isArray(callArgs)) { callArgs = [callArgs]; }
        if (!Array.isArray(suffixes)) { suffixes = [suffixes]; }
        if (!Array.isArray(thisPaths)) { thisPaths = [thisPaths]; }
        return this.operation('call', { callPath, callArgs, suffixes, thisPaths });
    }
    get(pathSets) {
        return this.operation('get', { pathSets });
    }
    set(jsonGraphEnvelope) {
        return this.operation('set', { jsonGraphEnvelope });
    }
    operation(method, parameters) {
        return {
            subscribe: request.bind(this, method, parameters)
        };
    }
}

function request(method, parameters, observer, ...rest) {

    if (typeof observer === 'function') {
        observer = { onNext: observer, onError: rest[0], onCompleted: rest[1] };
    }

    const { event, cancel, model, socket } = this;

    if (socket.connected !== false) {

        let finalized = false;
        const id = simpleflake().toJSON();
        const responseToken = `${event}-${id}`;
        const cancellationToken = `${cancel}-${id}`;

        socket.on(responseToken, handler);
        socket.emit(event, { id, method, ...parameters });

        return {
            unsubscribe() { this.dispose(); },
            dispose() {
                socket.removeListener(responseToken, handler);
                if (!finalized) {
                    socket.emit(cancellationToken);
                }
            }
        };

        function handler({ kind, value, error }) {
            switch (kind) {
                case 'N':
                    observer.onNext && observer.onNext(value);
                    break;
                case 'E':
                    finalized = true;
                    observer.onError && observer.onError(error);
                    break;
                case 'C':
                    finalized = true;
                    if (value && observer.onNext) {
                        observer.onNext(value);
                    }
                    observer.onCompleted && observer.onCompleted();
                    break;
            }
        };

    } else if (model) {
        let thisPath, callPath, pathSets, jsonGraphEnvelope;
        if (method === 'set') {
            jsonGraphEnvelope = parameters.jsonGraphEnvelope;
        } else if (method === 'get' || method === 'call') {
            jsonGraphEnvelope = {};
            pathSets = parameters.pathSets;
            if (method === 'call') {
                callPath = parameters.callPath;
                thisPath = callPath.slice(0, -1);
                pathSets = parameters.thisPaths || [];
                pathSets = pathSets.map((path) => thisPath.concat(path));
            }
            model._getPathValuesAsJSONG(
                model
                    ._materialize()
                    .withoutDataSource()
                    .treatErrorsAsValues(),
                pathSets, jsonGraphEnvelope, false, false);
        }
        observer.onNext && observer.onNext(jsonGraphEnvelope);
    }
    observer.onCompleted && observer.onCompleted();
    return { unsubscribe() {}, dispose() {} };
}
