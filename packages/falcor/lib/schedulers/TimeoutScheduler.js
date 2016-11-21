function TimeoutScheduler(delay) {
    this.delay = delay;
}

var TimerDisposable = function TimerDisposable(id) {
    this.id = id;
    this.disposed = false;
};

TimeoutScheduler.prototype.schedule = function schedule(action) {
    return new TimerDisposable(setTimeout(action, this.delay));
};

TimerDisposable.prototype.dispose =
TimerDisposable.prototype.unsubscribe = function() {
    if (!this.disposed) {
        clearTimeout(this.id);
        this.id = null;
        this.disposed = true;
    }
};

module.exports = TimeoutScheduler;
