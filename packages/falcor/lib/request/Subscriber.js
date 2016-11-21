var Subscription = require('./Subscription');

module.exports = Subscriber;

function Subscriber(destination, parent, onCompleted) {
    if (typeof destination === 'function' ||
             typeof parent === 'function' ||
        typeof onCompleted === 'function') {
        Subscription.call(this, []);
        this.destination = {
            error: parent,
            onError: parent,
            next: destination,
            onNext: destination,
            complete: onCompleted,
            onCompleted: onCompleted
        }
    } else {
        Subscription.call(this, [], parent);
        this.parent = parent;
        this.destination = destination;
    }
}

Subscriber.prototype = Object.create(Subscription.prototype);

Subscriber.prototype.next =
Subscriber.prototype.onNext = function onNext(value) {
    var dest = this.destination;
    if (dest) {
        if (dest.onNext) {
            dest.onNext(value);
        } else if (dest.next) {
            dest.next(value);
        }
    }
}

Subscriber.prototype.error =
Subscriber.prototype.onError = function onError(error) {
    var dest = this.destination;
    if (dest) {
        if (dest.onError) {
            dest.onError(error);
        } else if (dest.error) {
            dest.error(error);
        }
        this.dispose();
    } else {
        this.dispose();
        throw error;
    }
}

Subscriber.prototype.complete =
Subscriber.prototype.onCompleted = function onCompleted() {
    var dest = this.destination;
    if (dest) {
        if (dest.onCompleted) {
            dest.onCompleted();
        } else if (dest.complete) {
            dest.complete();
        }
        this.dispose();
    }
}

Subscriber.prototype.dispose =
Subscriber.prototype.unsubscribe = function () {
    this.destination = null;
    Subscription.prototype.dispose.call(this);
}
