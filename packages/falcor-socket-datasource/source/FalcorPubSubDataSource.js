import { simpleflake } from 'simpleflakes';

export class FalcorPubSubDataSource {
    constructor(socket, model, event = 'falcor-operation', cancel = 'cancel-falcor-operation') {
        this.event = event;
        this.model = model;
        this.cancel = cancel;
        this.socket = socket;
    }
    call(functionPath, args, refSuffixes, thisPaths) {
        return this.operation('call', { args, functionPath, refSuffixes, thisPaths });
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

function request(method, parameters, observerOrNext, ...rest) {
    let observer = observerOrNext;

    if (typeof observerOrNext === 'function') {
        // Falcor internals still expect DataSources to conform to the Rx4 Observer spec.
        observer = {
            onCompleted: rest[1],
            onError: rest[0],
            onNext: observerOrNext
        };
    }

    const { event, cancel, model, socket } = this;

    if (socket.connected === false && model) {

        let thisPath, functionPath,
            pathSets, jsonGraphEnvelope;

        if (method === 'set') {
            jsonGraphEnvelope = parameters.jsonGraphEnvelope;
        } else if (method === 'get' || method === 'call') {

            jsonGraphEnvelope = {};
            pathSets = parameters.pathSets;

            if (method === 'call') {
                pathSets = parameters.thisPaths || [];
                functionPath = parameters.functionPath;
                thisPath = functionPath.slice(0, -1);
                pathSets = pathSets.map((path) => thisPath.concat(path));
            }

            model._getPathValuesAsJSONG(
                model
                    .boxValues()
                    ._materialize()
                    .withoutDataSource()
                    .treatErrorsAsValues(),
                pathSets,
                [jsonGraphEnvelope]
            );
        }
        observer.onNext(jsonGraphEnvelope);
        observer.onCompleted && observer.onCompleted();
        return { dispose() {} };
    }

    let acknowledged = false;

    const id = simpleflake().toJSON();

    const responseToken = `${event}-${id}`;
    const cancellationToken = `${cancel}-${id}`;

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
        if (typeof error !== 'undefined') {
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
