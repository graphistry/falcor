import { PostMessageEmitter } from './PostMessageEmitter';
import { FalcorPubSubDataSource } from './FalcorPubSubDataSource';

export class PostMessageDataSource extends FalcorPubSubDataSource {
    constructor(source, target, ...args) {
        super(new PostMessageEmitter(source, target), ...args);
    }
}
