import Router from "./router";
import EventEmitter from 'events';
import Falcor from '@graphistry/falcor';
import { FalcorPubSubDataSink } from "../source";
import { FalcorPubSubDataSource } from '../source';
import tests, { eventName, cancelName } from './tests.base';

export default function eventEmitterDataSourceTests(Rx, recycleJSON) {

    const context = {};

    let source = null, sink = null;
    let model = null, emitter = null;

    tests(Rx, context,
        function before() {
            emitter = new EventEmitter();
            model = context.model = new Falcor.Model({ recycleJSON });
            source = model._source = new FalcorPubSubDataSource(emitter, model, eventName, cancelName);
            sink = new FalcorPubSubDataSink(emitter, () => new Router({ streaming: true }), eventName, cancelName);
            emitter.on(eventName, sink.response);
        },
        function after() {
            emitter.removeListener(eventName, sink.response);
        });
}
