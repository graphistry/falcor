var JSONGraphError = module.exports = function JSONGraphError(typeValue) {
    var err = Error.call(this);
    this.stack = err.stack;
    this.typeValue = typeValue;
};
JSONGraphError.prototype = Object.create(Error.prototype);

