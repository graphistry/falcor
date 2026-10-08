'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Rx = require('rxjs');
const fetchDataUntilSettled = require('../lib/utils/fetchDataUntilSettled').default;

function fixture(options = {}) {
    const read = new Rx.Subject();
    const scheduler = new Rx.VirtualTimeScheduler();
    const values = [], errors = [];
    let calls = 0;
    const falcor = {
        get() { calls++; return { progressively: () => read }; },
        getVersion: () => 1
    };
    const query = fetchDataUntilSettled({
        falcor, fragment: () => '{ value }',
        disposeScheduler: scheduler, disposeDelay: 5,
        ...options
    });
    return { read, scheduler, values, errors, query, calls: () => calls };
}

test('a delayed query maps an asynchronous read error into a settled error memo', () => {
    const f = fixture(), failure = { $type: 'error', value: 'retry exhausted' };
    const sub = f.query.subscribe(v => f.values.push(v), e => f.errors.push(e));
    f.read.error(failure);
    assert.deepEqual(f.errors, []);
    assert.equal(f.values.at(-1).error, failure);
    assert.equal(f.values.at(-1).loading, false);
    assert.equal(f.calls(), 1);
    sub.unsubscribe(); f.scheduler.flush();
});

test('an exhausted read does not throw through a next-only component subscription', () => {
    const f = fixture(), failure = new Error('retry exhausted');
    const sub = f.query.subscribe(v => f.values.push(v));
    assert.doesNotThrow(() => f.read.error(failure));
    assert.equal(f.values.at(-1).error, failure);
    assert.equal(f.calls(), 1);
    sub.unsubscribe(); f.scheduler.flush();
});

test('without a disposal scheduler the existing query error handler still runs', () => {
    const f = fixture({ disposeScheduler: null }), failure = new Error('read failed');
    const sub = f.query.subscribe(v => f.values.push(v), e => f.errors.push(e));
    f.read.error(failure);
    assert.deepEqual(f.errors, []);
    assert.equal(f.values.at(-1).error, failure);
    assert.equal(f.values.at(-1).loading, false);
    sub.unsubscribe();
});

test('a successful query maps actual data without an extra read', () => {
    const f = fixture();
    const sub = f.query.subscribe(v => f.values.push(v), e => f.errors.push(e));
    f.read.next({ json: { value: 57 } });
    f.read.complete();
    assert.deepEqual(f.errors, []);
    assert.deepEqual(f.values.at(-1).data, { value: 57 });
    assert.equal(f.calls(), 1);
    sub.unsubscribe(); f.scheduler.flush();
});

test('disposal stays delayed while late values never reach a disposed component', () => {
    const f = fixture();
    const sub = f.query.subscribe(v => f.values.push(v), e => f.errors.push(e));
    assert.equal(f.read.observers.length, 1);
    const count = f.values.length;
    sub.unsubscribe();
    assert.equal(f.read.observers.length, 1, 'upstream disposal was not delayed');
    f.read.next({ json: { value: 99 } });
    assert.equal(f.values.length, count);
    f.scheduler.flush();
    assert.equal(f.read.observers.length, 0);
    assert.equal(f.calls(), 1);
});

test('a synchronous completed read settles and disposes without resubscribing', () => {
    let calls = 0, values = [], errors = [];
    const falcor = { get() { calls++; return { progressively: () => Rx.Observable.of({ json: { value: 57 } }) }; }, getVersion: () => 1 };
    const scheduler = new Rx.VirtualTimeScheduler();
    const sub = fetchDataUntilSettled({ falcor, fragment: () => '{ value }', disposeScheduler: scheduler, disposeDelay: 5 })
        .subscribe(v => values.push(v), e => errors.push(e));
    assert.deepEqual(errors, []);
    assert.deepEqual(values.at(-1).data, { value: 57 });
    assert.equal(values.at(-1).loading, false);
    assert.equal(calls, 1);
    sub.unsubscribe(); scheduler.flush();
});
