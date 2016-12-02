module.exports = createErrorClass;

function createErrorClass(name, init) {
    function E(message) {
        if (!Error.captureStackTrace) {
            this.stack = (new Error()).stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
        this.message = message;
        init && init.apply(this, arguments);
    }
    E.prototype = new Error();
    E.prototype.name = name;
    E.prototype.constructor = E;
    E.is = function(x) { return x.name === name; };
    return E;
}
