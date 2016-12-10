var empty = {
    dispose: function() {},
    unsubscribe: function() {}
};

function ImmediateScheduler() {}

ImmediateScheduler.prototype.schedule = function schedule(action) {
    action();
    return empty;
};

module.exports = ImmediateScheduler;
