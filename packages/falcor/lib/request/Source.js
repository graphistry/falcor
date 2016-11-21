var Subscriber = require('./Subscriber');
var Subscription = require('./Subscription');
var $$observable = require('symbol-observable').default;

module.exports = Source;

function Source(subscribe) {
    if (!subscribe) {
        return;
    }
    switch (typeof subscribe) {
        case 'object':
            this.source = subscribe;
            break;
        case 'function':
            this.source = { subscribe: subscribe };
            break;
    }
}

Source.prototype[$$observable] = function() {
    return this;
}

Source.prototype.operator = function(destination) {
    return this.subscribe(destination);
}

Source.prototype.lift = function(operator, source) {
    source = new Source(source || this);
    source.operator = operator;
    return source;
}

Source.prototype.subscribe = function(destination, x, y) {
    return new Subscription([
        this.operator.call(
            this.source, !(destination instanceof Subscriber) ?
                new Subscriber(destination, x, y) : destination)
    ]);
}

Source.prototype.then = function then(onNext, onError) {
    /* global Promise */
    var source = this;
    if (!this._promise) {
        this._promise = new global['Promise'](function(resolve, reject) {
            var values = [], rejected = false;
            source.subscribe({
                next: function(value) { values[values.length] = value; },
                error: function(errors) { (rejected = true) && reject(errors); },
                complete: function() {
                    !rejected &&
                    resolve(values.length <= 1 ? values[0] : values);
                }
            });
        });
    }
    return this._promise.then(onNext, onError);
};
