import _ from 'lodash';
import { expect } from 'chai';

export const eventName = 'falcor-operation';
export const cancelName = 'cancel-falcor-operation';

export default function tests({ Observable }, context, runBefore, runAfter) {

    beforeEach(runBefore);
    afterEach(runAfter);

    it('should get data from the server', (done) => {
        const { model } = context;
        Observable
            .defer(() => model.get(['foo', 'bar']))
            .do((data) => {
                expect(data.toJSON()).to.deep.equal({
                    json: {
                        foo: {
                            bar: 'foo'
                        }
                    }
                });
            })
            .subscribe(() => {}, done, done);
    });
    it('should set data on the server', (done) => {
        const { model } = context;
        Observable
            .defer(() => model.set({ path: ['foo', 'bar'], value: 'bar' }))
            .do((data) => {
                expect(data.toJSON()).to.deep.equal({
                    json: {
                        foo: {
                            bar: 'bar'
                        }
                    }
                });
            })
            .subscribe(() => {}, done, done);
    });
    it('should call a function on the server', (done) => {
        const { model } = context;
        Observable
            .defer(() => model.call('bar', ['foo']))
            .do((data) => {
                expect(data.toJSON()).to.deep.equal({
                    json: {
                        foo: {
                            bar: 'foo'
                        }
                    }
                });
            })
            .subscribe(() => {}, done, done);
    });
    it('should cancel a get operation', (done) => {
        const messages = [];
        const { model } = context;
        const { _source: { emitter } } = model;

        model._source.emitter = {
            on(...args) {
                return emitter.on(...args);
            },
            emit(event, data, ...rest) {
                messages.push({ data, event });
                emitter.emit(event, data, ...rest);
            },
            removeListener(...args) {
                return emitter.removeListener(...args);
            }
        };

        Observable
            .create((observer) => {
                const disposable = model
                    .get(['long', 'running', 'operation'])
                    .subscribe(observer);
                if (!disposable.unsubscribe) {
                    disposable.unsubscribe = disposable.dispose.bind(disposable);
                } else if (!disposable.dispose) {
                    disposable.dispose = disposable.unsubscribe.bind(disposable);
                }
                return disposable;
            })
            .timeout(25)
            .catch((e) => {
                // delay forwarding the timeout so the stack has time to unwind to unsubscribe
                return Observable.of(e).delay(10);
            })
            .do(() => {
                expect(messages.length).to.equal(2);

                const [requestEvent, cancelEvent] = messages;
                const { id: requestId } = requestEvent.data;

                // validate the request event.
                expect(requestEvent.event).to.equal(eventName);
                expect(requestEvent.data.method).to.equal('get');
                expect(requestEvent.data.pathSets).to.deep.equal([
                    ['long', 'running', 'operation']
                ]);

                // validate that the cancelation event was send properly
                expect(cancelEvent.event).to.equal(`${cancelName}-${requestId}`);

                // make sure the route response definitely isn't in the cache.
                const { _root: { cache } } = model;
                expect(typeof cache.long).to.equal('undefined');
            })
            .subscribe(() => {}, done, done);
    });
    it('should get data from the local model when disconnected', function(done) {
        const { model } = context;
        model._source.emitter.readyState = 'closed';
        Observable
            .defer(() => model.get(['foo', 'bar']))
            .do((data) => {
                expect(data.toJSON()).to.deep.equal({
                    json: {
                        foo: {
                            bar: { $type: 'atom' }
                        }
                    }
                });
            })
            .subscribe(() => {}, done, done);
    });
    it('should set data on the local model when disconnected', (done) => {
        const { model } = context;
        model._source.emitter.readyState = 'closed';
        Observable
            .defer(() => model.set({ path: ['foo', 'bar'], value: 'bar' }))
            .do((data) => {
                expect(data.toJSON()).to.deep.equal({
                    json: {
                        foo: {
                            bar: 'bar'
                        }
                    }
                });
            })
            .subscribe(() => {}, done, done);
    });
    it('should call a function on the local model when disconnected', (done) => {
        const { model } = context;
        model._source.emitter.readyState = 'closed';
        Observable
            .defer(() => model.call('bar', ['foo'], [], ['foo', 'bar']))
            .do((data) => {
                expect(data.toJSON()).to.deep.equal({
                    json: {
                        foo: {
                            bar: { $type: 'atom' }
                        }
                    }
                });
            })
            .subscribe(() => {}, done, done);
    });
    it('should get streaming data from the server', function(done) {
        const {sink,  model } = context;
        sink.getDataSource = getStreamingDataSource(sink.getDataSource);
        // sort same as collapse
        const keys = [1, 3, 'cinco', 'four', 'two'];
        const expected = expectedProgressive(keys);

        Observable
            .defer(() => model
                .get(['streaming', keys])
                .progressively())
            .do((data) => {
                expect(data.toJSON()).to.deep.equal(expected.shift());
            })
            .subscribe(() => {}, done, done);
    });
    it('should set streaming data on the server', function(done) {
        const { sink, model } = context;
        sink.getDataSource = getStreamingDataSource(sink.getDataSource);
        // sort same as collapse
        const keys = [1, 3, 'cinco', 'four', 'two'];
        const vals = ['val-1', 'val-3', 'val-cinco', 'val-four', 'val-two'];
        const expected = expectedProgressive(keys, vals).map((x, i, arr) =>
            _.merge({}, arr[arr.length - 1])
        );

        // push an extra value on to account for the inital local progressive set
        expected.push(_.merge({}, expected[0]));

        const pathValues = keys.map((key, i) => ({
            value: vals[i],
            path: ['streaming', key]
        }));

        Observable
            .defer(() => model
                .set(...pathValues)
                .progressively())
            .do((data) => {
                expect(data.toJSON()).to.deep.equal(expected.shift());
            })
            .subscribe(() => {}, done, done);
    });
    it('should stream function call results from the server', (done) => {
        const { sink, model } = context;
        sink.getDataSource = getStreamingDataSource(sink.getDataSource);
        const keys = [1, 'two', 3, 'four', 'cinco'];
        const vals = [
            'call-1-val',
            'call-two-val',
            'call-3-val',
            'call-four-val',
            'call-cinco-val'
        ];
        const expected = expectedProgressive(keys, vals);
        expected.splice(0, 0, _.merge({}, expected[0]));
        expected.splice(2, 0, _.merge({}, expected[2]));
        expected[1].json.streaming[1] = 'call-1-followup';
        expected[2].json.streaming[1] = 'call-1-followup';
        expected[3].json.streaming[1] = 'call-1-followup';
        expected[4].json.streaming[1] = 'call-1-followup';
        expected[5].json.streaming[1] = 'call-1-followup';
        expected[6].json.streaming[1] = 'call-1-followup';
        expected[3].json.streaming['two'] = 'call-two-followup';
        expected[4].json.streaming['two'] = 'call-two-followup';
        expected[5].json.streaming['two'] = 'call-two-followup';
        expected[6].json.streaming['two'] = 'call-two-followup';

        Observable
            .defer(() => model
                .call(['streaming', 'call'], keys)
                .progressively())
            .do((data) => {
                expect(data.toJSON()).to.deep.equal(expected.shift());
            })
            .subscribe(() => {}, done, done);
    });
}

function getStreamingDataSource(getDataSource) {
    return function(...args) {
        const dataSource = getDataSource(...args);
        dataSource._streaming = true;
        return dataSource;
    }
}

function expectedProgressive(keys, vals = []) {
    return keys
        .map((key, i) => ({
            json: {
                streaming: {
                    [key]: vals[i] || `${key}-val`
                }
            }
        }))
        .reduce((values, data, i) => {
            values[i] = values.reduce((xs, x) => {
                return _.merge({}, x, xs);
            }, data);
            return values;
        }, []);
}
