import { PostMessageEmitter } from './PostMessageEmitter';
import { FalcorPubSubDataSource } from './FalcorPubSubDataSource';

export class PostMessageDataSource extends FalcorPubSubDataSource {
    constructor(source, target, model, event = 'falcor-operation', cancel = 'cancel-falcor-operation') {
        super(new PostMessageEmitter(source, target, event, cancel), model, event, cancel);
    }
}
