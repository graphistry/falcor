module.exports = createErrorClass;

function createErrorClass(name, init) {
    function E(message) {
        this.message = message;
        init && init.apply(this, arguments);
        if (!Error.captureStackTrace) {
            this.stack = (new Error()).stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    E.prototype = new Error();
    E.prototype.name = name;
    E.prototype.constructor = E;
    E.is = function(x) { return x.name === name; };
    return E;
}
