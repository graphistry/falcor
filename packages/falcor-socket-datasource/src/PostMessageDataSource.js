import { PostMessageEmitter } from './PostMessageEmitter';
import { FalcorPubSubDataSource } from './FalcorPubSubDataSource';

export class PostMessageDataSource extends FalcorPubSubDataSource {
    constructor(source, target, model, targetOrigin = '*', event = 'falcor-operation', cancel = 'cancel-falcor-operation') {
        super(new PostMessageEmitter(source, target, targetOrigin, event, cancel), model, event, cancel);
    }
}
