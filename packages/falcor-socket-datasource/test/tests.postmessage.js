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
        beforeWithOrigin('*', '*'),
        function after() {
            sink.dispose();
        });

    tests(Rx, context,
        beforeWithOrigin(
            'http://localhost:3000',
            'http://localhost:9000'
        ),
        function after() {
            sink.dispose();
        });

    function beforeWithOrigin(windowOrigin = '*', iFrameOrigin = '*') {
        return function before() {
            fakeWindow = new ContentWindow(windowOrigin);
            fakeIFrame = new ContentWindow(iFrameOrigin, fakeWindow);
            model = context.model = new Falcor.Model({ recycleJSON });
            source = model._source = new PostMessageDataSource(
                fakeWindow, fakeIFrame, model, windowOrigin, eventName, cancelName
            );
            sink = context.sink = new PostMessageDataSink(
                () => new Router(),
                fakeIFrame, iFrameOrigin, eventName, cancelName);
        }
    }
}

class ContentWindow extends EventEmitter {
    constructor(origin, source) {
        super();
        this.origin = origin;
        this.source = source || this;
    }
    postMessage(data, targetOrigin) {
        this.emit('message', {
            data: data,
            source: this.source,
            origin: this.origin
        });
    }
    addEventListener(...args) {
        return this.on(...args);
    }
    removeEventListener(...args) {
        return this.removeListener(...args);
    }
}
