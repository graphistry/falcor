var functionTypeof = 'function';
var Requests = require('./request/Queue');
var getTimestamp = require('./support/getTimestamp');

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

function defaultCompare(node, message) {
    var cType = node && node.$type;
    var mType = message && message.$type;
    if (cType) {
        // If the cache has a type, but the message is a primitive,
        // the message might be the primitive response from the datasource.
        // If so, return true, so we don't update the back-reference versions.
        if (!mType) {
            return node.value === message;
        }
        // If the message is older than the cache node, then isDistinct = false
        else if (getTimestamp(message) < getTimestamp(node) === true) {
            return true; // isDistinct = false
        }
        // Otherwise they are the same if all the following fields are the same.
        return !(
            cType !== mType ||
            node.value !== message.value ||
            node.$expires !== message.$expires
        );
    }
    // If cache doesn't have a type but the message
    // does, they must be different.
    else if (mType) {
        return false;
    }
    return node === message;
}

ModelRoot.comparator = ModelRoot.prototype.comparator = defaultCompare;

module.exports = ModelRoot;
