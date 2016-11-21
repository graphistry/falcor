module.exports = Subscription;

function Subscription(subscriptions, parent) {
    this.parent = parent;
    this.subscriptions = subscriptions || [];
}

Subscription.prototype.add = function(subscription) {
    return this.subscriptions.push(subscription) && this || this;
}

Subscription.prototype.remove = function(subscription) {
    var index = this.subscriptions.indexOf(subscription);
    if (~index) {
        this.subscriptions.splice(index, 1);
    }
    return this;
}

Subscription.prototype.dispose =
Subscription.prototype.unsubscribe = function () {
    var subscription, subscriptions = this.subscriptions;
    while (subscriptions.length) {
        (subscription = subscriptions.pop()) &&
            subscription.dispose &&
            subscription.dispose();
    }
    var parent = this.parent;
    if (parent) {
        this.parent = null;
        parent.remove && parent.remove(this);
    }
}

