export class FalcorPubSubDataSink {
    constructor(socket, getDataSource, event = 'falcor-operation', cancel = 'cancel-falcor-operation') {
        this.event = event;
        this.cancel = cancel;
        this.socket = socket;
        this.getDataSource = getDataSource;
        this.response = response.bind(this);
    }
}

function response({ id, callPath, callArgs,
                    jsonGraphEnvelope, method,
                    pathSets, suffixes, thisPaths }, socket = this.socket) {

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

    let handleCancellationForId = null;
    let disposed = false, finalized = false;

    const DataSource = getDataSource(socket);
    const operation = DataSource[method](...parameters).subscribe(
        (value) => {
            if (!disposed && !finalized) {
                socket.emit(responseToken, { kind: 'N', value });
            }
        },
        (error) => {
            if (disposed || finalized) {
                return;
            }
            disposed = finalized = true;
            if (handleCancellationForId) {
                socket.removeListener(
                    cancellationToken,
                    handleCancellationForId);
                handleCancellationForId = null;
            }
            socket.emit(responseToken, { kind: 'E', error });
        },
        () => {
            if (disposed || finalized) {
                return;
            }
            disposed = finalized = true;
            if (handleCancellationForId) {
                socket.removeListener(
                    cancellationToken,
                    handleCancellationForId);
                handleCancellationForId = null;
            }
            socket.emit(responseToken, { kind: 'C' });
        }
    );

    if (!finalized) {
        handleCancellationForId = function() {
            if (disposed || finalized) {
                return;
            }
            disposed = finalized = true;
            socket.removeListener(
                cancellationToken,
                handleCancellationForId);
            handleCancellationForId = null;
            if (typeof operation.dispose === 'function') {
                operation.dispose();
            } else if (typeof operation.unsubscribe === 'function') {
                operation.unsubscribe();
            } else if (typeof operation === 'function') {
                operation();
            }
        };
        socket.on(cancellationToken, handleCancellationForId);
    }
}
