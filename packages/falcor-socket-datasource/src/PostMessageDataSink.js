import { PostMessageEmitter } from './PostMessageEmitter';
import { FalcorPubSubDataSink } from './FalcorPubSubDataSink';

export class PostMessageDataSink extends FalcorPubSubDataSink {
    constructor(getDataSource,
                source = window,
                targetOrigin = '*',
                event = 'falcor-operation',
                cancel = 'cancel-falcor-operation') {
        super(null, getDataSource, event, cancel);
        this.source = source;
        this.targetOrigin = targetOrigin;
        this.onPostMessage = this.onPostMessage.bind(this);
        source.addEventListener('message', this.onPostMessage);
    }
    onPostMessage(event = {}) {
        const { data = {} } = event;
        const { targetOrigin } = this;
        if (data.type !== this.event || (
            targetOrigin !== '*' &&
            targetOrigin !== event.origin)) {
            return;
        }
        this.response(data, new AutoDisposeEmitter(
            this.source, event.source,
            this.targetOrigin, this.event, this.cancel
        ));
    }
    dispose() {
        this.unsubscribe();
    }
    unsubscribe() {
        const { source } = this;
        this.source = null;
        source && source.removeEventListener('message', this.onPostMessage);
    }
}

class AutoDisposeEmitter extends PostMessageEmitter {
    emit(eventName, data) {
        const { kind } = data || {};
        const retVal = super.emit(eventName, data);
        if (kind === 'E' || kind === 'C') {
            this.dispose();
        }
        return retVal;
    }
}
