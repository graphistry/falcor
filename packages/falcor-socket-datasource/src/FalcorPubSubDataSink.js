export class FalcorPubSubDataSink {
    constructor(emitter, getDataSource, event = 'falcor-operation', cancel = 'cancel-falcor-operation') {
        this.event = event;
        this.cancel = cancel;
        this.emitter = emitter;
        this.getDataSource = getDataSource;
        this.response = response.bind(this);
    }
}

function response({ id, callPath, callArgs,
                    jsonGraphEnvelope, method,
                    pathSets, suffixes, thisPaths }, emitter = this.emitter) {

    let parameters;

    if (method === 'call') {
        parameters = [callPath, callArgs, suffixes, thisPaths];
    } else if (method === 'get') {
        parameters = [pathSets];
    } else if (method === 'set') {
        parameters = [jsonGraphEnvelope];
    } else {
        throw new Error(`${method} is not a valid method`);
    }

    const { event, cancel, getDataSource } = this;
    const responseToken = `${event}-${id}`;
    const cancellationToken = `${cancel}-${id}`;

    let operation = {}, disposed = false, value = undefined;

    const DataSource = getDataSource(emitter);
    const streaming = DataSource._streaming || false;

    emitter.on(cancellationToken, dispose);

    operation = DataSource[method](...parameters).subscribe(
        (x) => {
            value = x;
            if (!disposed && streaming) {
                emitter.emit(responseToken, { kind: 'N', value });
            }
        },
        (error) => {
            if (dispose()) {
                if (streaming || value === undefined) {
                    emitter.emit(responseToken, { kind: 'E', error });
                } else {
                    emitter.emit(responseToken, { kind: 'E', error, value });
                }
            }
        },
        () => {
            if (dispose()) {
                if (streaming || value === undefined) {
                    emitter.emit(responseToken, { kind: 'C' });
                } else {
                    emitter.emit(responseToken, { kind: 'C', value });
                }
            }
        }
    );

    function dispose() {
        if (disposed) {
            return false;
        }
        disposed = true;
        try { emitter.removeListener(cancellationToken); } catch(e) {}
        emitter.removeListener(cancellationToken, dispose);
        if (!operation) {
            return false;
        }
        if (typeof operation.dispose === 'function') {
            operation.dispose();
        } else if (typeof operation.unsubscribe === 'function') {
            operation.unsubscribe();
        } else if (typeof operation === 'function') {
            operation();
        }
        operation = null;
        return true;
    }
}
