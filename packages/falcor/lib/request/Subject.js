var Subscriber = require('./Subscriber');
var Subscription = require('./Subscription');

module.exports = Subject;

function Subject(observers, parent) {
    Subscriber.call(this, null, parent);
    this.observers = observers || [];
}

Subject.prototype = Object.create(Subscriber.prototype);

Subject.prototype.onNext = function(value) {
    this.observers.slice(0).forEach(function(observer) {
        observer.onNext(value);
    });
}

Subject.prototype.onError = function(error) {
    var observers = this.observers.slice(0);
    this.dispose();
    observers.forEach(function(observer) {
        observer.onError(error);
    });
}

Subject.prototype.onCompleted = function() {
    var observers = this.observers.slice(0);
    this.dispose();
    observers.forEach(function(observer) {
        observer.onCompleted();
    });
}

Subject.prototype.subscribe = function(subscriber) {
    this.observers.push(subscriber);
    this.subscriptions.push(subscriber = new Subscription([subscriber], this));
    return subscriber;
}

Subject.prototype.dispose =
Subject.prototype.unsubscribe = function () {
    this.observers = [];
}
