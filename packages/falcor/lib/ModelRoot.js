var hasOwn = require("./support/hasOwn");
var Requests = require("./request/Queue");
var isFunction = require("./support/isFunction");

function ModelRoot(o, model) {

    var options = o || {};

    this.cache = {};
    this.version = 0;
    this.syncRefCount = 0;
    this.maxRetryCount = 10;
    this.topLevelModel = model;
    this.requests = new Requests(this);
    this.expired = options.expired || [];

    this.collectRatio = 0.75;
    this.maxSize = Math.pow(2, 53) - 1;

    if (typeof options.collectRatio === 'number') {
        this.collectRatio = options.collectRatio;
    }

    if (typeof options.maxSize === 'number') {
        this.maxSize = options.maxSize;
    }

    if (isFunction(options.comparator)) {
        this.comparator = options.comparator;
    }

    if (isFunction(options.branchSelector)) {
        this.branchSelector = options.branchSelector;
    }

    if (isFunction(options.errorSelector)) {
        this.errorSelector = options.errorSelector;
    }

    if (isFunction(options.branchSelector)) {
        this.branchSelector = options.branchSelector;
    }

    if (isFunction(options.onChange)) {
        this.onChange = options.onChange;
    }

    if (isFunction(options.onChangesCompleted)) {
        this.onChangesCompleted = options.onChangesCompleted;
    }
}

ModelRoot.prototype.errorSelector = function errorSelector(x, y) {
    return y;
};

ModelRoot.prototype.comparator = function comparator(cacheNode, messageNode) {
    if (hasOwn(cacheNode, "value") && hasOwn(messageNode, "value")) {
        // They are the same only if the following fields are the same.
        return cacheNode.value === messageNode.value &&
            cacheNode.$type === messageNode.$type &&
            cacheNode.$expires === messageNode.$expires;
    }
    return cacheNode === messageNode;
};

module.exports = ModelRoot;
