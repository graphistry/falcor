var functionTypeof = 'function';
var Requests = require('./request/Queue');

function ModelRoot(o, model) {

    var options = o || {};

    this.cache = {};
    this.version = -1;
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

    if (typeof options.comparator === functionTypeof) {
        this.comparator = options.comparator;
    }

    if (typeof options.branchSelector === functionTypeof) {
        this.branchSelector = options.branchSelector;
    }

    if (typeof options.errorSelector === functionTypeof) {
        this.errorSelector = options.errorSelector;
    }

    if (typeof options.branchSelector === functionTypeof) {
        this.branchSelector = options.branchSelector;
    }

    if (typeof options.onChange === functionTypeof) {
        this.onChange = options.onChange;
    }

    if (typeof options.onChangesCompleted === functionTypeof) {
        this.onChangesCompleted = options.onChangesCompleted;
    }
}

ModelRoot.comparator = function comparator(cacheNode, messageNode) {
    var cType = cacheNode && cacheNode.$type;
    var mType = messageNode && messageNode.$type;
    if (cType) {
        if (!mType) {
            return cacheNode.value === messageNode;
        } else {
            // They are the same only if the following fields are the same.
            return !(cType !== mType ||
                     cacheNode.value !== messageNode.value ||
                     cacheNode.$expires !== messageNode.$expires);
        }
    } else if (mType) {
        return false;
    }
    return cacheNode === messageNode;
};

module.exports = ModelRoot;
