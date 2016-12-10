import Router from './router';
import EventEmitter from 'events';
import Falcor from '@graphistry/falcor';
import { PostMessageDataSink } from '../src';
import { PostMessageDataSource } from '../src';
import tests, { eventName, cancelName } from './tests.base';

export default function postMessageDataSourceTests(Rx, recycleJSON) {

    const context = {};

    let fakeWindow = null, fakeIFrame = null;
    let model = null, source = null, sink = null;

    tests(Rx, context,
        function before() {
            fakeWindow = new ContentWindow();
            fakeIFrame = new ContentWindow(fakeWindow);
            model = context.model = new Falcor.Model({ recycleJSON });
            source = model._source = new PostMessageDataSource(
                fakeWindow, fakeIFrame, model, eventName, cancelName
            );
            sink = context.sink = new PostMessageDataSink(
                () => new Router(),
                fakeIFrame, eventName, cancelName);
        },
        function after() {
            sink.dispose();
        });
}

class ContentWindow extends EventEmitter {
    constructor(source) {
        super();
        this.source = source || this;
    }
    postMessage(data, targetOrigin) {
        this.emit('message', {
            data: data, source: this.source
        });
    }
    addEventListener(...args) {
        return this.on(...args);
    }
    removeEventListener(...args) {
        return this.removeListener(...args);
    }
}
