var Source = require('./Source');
var Request = require('./Request');
var Subscriber = require('./Subscriber');
var Subscription = require('./Subscription');
var ImmediateScheduler = require('../schedulers/ImmediateScheduler');

module.exports = Queue;

function Queue(modelRoot) {
    Subscription.call(this, []);
    this.modelRoot = modelRoot;
}

Queue.prototype = Object.create(Subscription.prototype);

Queue.prototype.set = isolateSet;
Queue.prototype.call = isolateCall;
Queue.prototype.get = batchAndDedupeGet;

function isolateSet(model, optimized, requested, env) {
    var queue = this;
    return new Source(function(destination) {

        var request = new Request('set', queue, model._source, new ImmediateScheduler())
            .batch(requested, optimized || env.paths, env.jsonGraph);

        var subscriber = request.subscribe(new Subscriber(destination, request));

        queue.add(request);

        request.connect();

        return subscriber;
    });
}

function isolateCall(model, optimized, requested, env) {
    var queue = this;
    return new Source(function(destination) {

        var request = new Request('call', queue, model._source, new ImmediateScheduler())
            .batch(null, null, env);

        var subscriber = request.subscribe(new Subscriber(destination, request));

        queue.add(request);

        request.connect();

        return subscriber;
    });
}

function batchAndDedupeGet(model, optimized, requested) {
    return new Dedupe(
        this, model._source, model._scheduler, requested, optimized
    );
}

function Dedupe(queue, source, scheduler, requested, optimized) {
    this.queue = queue;
    this.dataSource = source;
    this.scheduler = scheduler;
    this.requested = requested;
    this.optimized = optimized;
}

Dedupe.prototype.subscribe = function(destination) {

    var queue = this.queue;
    var source = this.dataSource;
    var requested = this.requested;
    var optimized = this.optimized;
    var scheduler = this.scheduler;

    var requestsIndex = -1;
    var requests  = queue.subscriptions;
    var requestsCount = requests.length;
    var subscription = new Subscription([], destination);

    while (++requestsIndex < requestsCount) {

        var request = requests[requestsIndex];

        if (request.type !== 'get') {
            continue;
        }

        if (request = request.batch(requested, optimized, requested = [], optimized = [])) {
            subscription.add(request.subscribe(new Subscriber(destination, request)));
        }

        if (!optimized.length) {
            break;
        }
    }

    if (optimized.length) {
        request = requests[requestsIndex] =
            new Request('get', queue, source, scheduler).batch(requested, optimized);
        subscription.add(request.subscribe(new Subscriber(destination, request)));
        request.connect();
    }

    return subscription;
}
