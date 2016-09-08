/**
 * Will allow for state tracking of the current disposable.  Also fulfills the
 * disposable interface.
 * @private
 */
var AssignableDisposable = function AssignableDisposable(disosableCallback) {
    this.disposed = false;
    this.currentDisposable = disosableCallback;
};


AssignableDisposable.prototype = {

    unsubscribe: function unsubscribe() {
        return this.dispose();
    },
    /**
     * Disposes of the current disposable.  This would be the getRequestCycle
     * disposable.
     */
    dispose: function dispose() {

        if (this.disposed || !this.currentDisposable) {
            return;
        }

        this.disposed = true;

        // If the current disposable fulfills the disposable interface or just
        // a disposable function.
        var currentDisposable = this.currentDisposable;
        this.currentDisposable = null;

        if (currentDisposable.dispose) {
            currentDisposable.dispose();
        } else if (currentDisposable.unsubscribe) {
            currentDisposable.unsubscribe();
        } else if (typeof currentDisposable === "function") {
            currentDisposable();
        }
    }
};


module.exports = AssignableDisposable;
