import Router from './router';
import EventEmitter from 'events';
import Falcor from '@graphistry/falcor';
import { FalcorPubSubDataSink } from '../src';
import { FalcorPubSubDataSource } from '../src';
import tests, { eventName, cancelName } from './tests.base';

export default function eventEmitterDataSourceTests(Rx, recycleJSON) {

    const context = {};

    let emitter = null;
    let model = null, source = null, sink = null;

    tests(Rx, context,
        function before() {
            emitter = new EventEmitter();
            model = context.model = new Falcor.Model({ recycleJSON });
            source = model._source = new FalcorPubSubDataSource(
                emitter, model, eventName, cancelName
            );
            sink = context.sink = new FalcorPubSubDataSink(
                emitter, () => new Router(), eventName, cancelName
            );
            emitter.on(eventName, sink.response);
        },
        function after() {
            emitter.removeListener(eventName, sink.response);
        });
}
