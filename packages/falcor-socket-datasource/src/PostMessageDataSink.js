import { PostMessageEmitter } from './PostMessageEmitter';
import { FalcorPubSubDataSink } from './FalcorPubSubDataSink';

export class PostMessageDataSink extends FalcorPubSubDataSink {
    constructor(dataSource) {
        super(null, () => dataSource);
        this.onPostMessage = this.onPostMessage.bind(this);
        window.addEventListener('message', this.onPostMessage);
    }
    onPostMessage(event = {}) {
        const { data = {} } = event;
        const { type, ...rest } = data;
        if (type !== 'falcor-operation') {
            return;
        }
        this.response(rest, new PostMessageEmitter(
            window, event.source || parent
        ));
    }
    unsubscribe() {
        window.removeEventListener('message', this.onPostMessage);
    }
}
