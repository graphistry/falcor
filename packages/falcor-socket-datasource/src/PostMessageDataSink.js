import { PostMessageEmitter } from './PostMessageEmitter';
import { FalcorPubSubDataSink } from './FalcorPubSubDataSink';

export class PostMessageDataSink extends FalcorPubSubDataSink {
    constructor(getDataSource, source = window, event = 'falcor-operation', cancel = 'cancel-falcor-operation') {
        super(null, getDataSource, event, cancel);
        this.source = source;
        this.onPostMessage = this.onPostMessage.bind(this);
        source.addEventListener('message', this.onPostMessage);
    }
    onPostMessage(event = {}) {
        const { data = {} } = event;
        const { type, ...rest } = data;
        if (type !== this.event) {
            return;
        }
        const emitter = new PostMessageEmitter(
            this.source, event.source || parent, this.event, this.cancel
        );
        this.response(rest, {
            on(...args) { return emitter.on(...args); },
            removeListener(...args) { return emitter.removeListener(...args); },
            emit(eventName, data) {
                const { kind } = data || {};
                const retVal = emitter.emit(eventName, data);
                if (kind === 'E' || kind === 'C') {
                    emitter.dispose();
                }
                return retVal;
            }
        });
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
