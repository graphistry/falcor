export class FalcorPubSubDataSink {
    constructor(socket, getDataSource, event = 'falcor-operation', cancel = 'cancel-falcor-operation') {
        this.event = event;
        this.cancel = cancel;
        this.socket = socket;
        this.getDataSource = getDataSource;
        this.response = response.bind(this);
    }
}

function response({ id, args, functionPath,
                    jsonGraphEnvelope, method,
                    pathSets, refSuffixes, thisPaths }, socket = this.socket) {

    let parameters;

    if (method === "call") {
        parameters = [functionPath, args, refSuffixes, thisPaths];
    } else if (method === "get") {
        parameters = [pathSets];
    } else if (method === "set") {
        parameters = [jsonGraphEnvelope];
    } else {
        throw new Error(`${method} is not a valid method`);
    }

    const { event, cancel, getDataSource } = this;
    const responseToken = `${event}-${id}`;
    const cancellationToken = `${cancel}-${id}`;

    let results = null;
    let operationIsDone = false;
    let handleCancellationForId = null;

    const DataSource = getDataSource(socket);
    const operation = DataSource[method](...parameters).subscribe(
        (data) => {
            results = data;
        },
        (error) => {
            operationIsDone = true;
            if (handleCancellationForId !== null) {
                socket.off(cancellationToken, handleCancellationForId);
            }
            handleCancellationForId = null;
            socket.emit(responseToken, { error, ...results });
        },
        () => {
            operationIsDone = true;
            if (handleCancellationForId !== null) {
                socket.off(cancellationToken, handleCancellationForId);
            }
            handleCancellationForId = null;
            socket.emit(responseToken, { ...results });
        }
    );

    if (!operationIsDone) {
        handleCancellationForId = function() {
            if (operationIsDone === true) {
                return;
            }
            operationIsDone = true;
            socket.off(cancellationToken, handleCancellationForId);
            if (typeof operation.dispose === "function") {
                operation.dispose();
            } else if (typeof operation.unsubscribe === "function") {
                operation.unsubscribe();
            }
        };
        socket.on(cancellationToken, handleCancellationForId);
    }
}
