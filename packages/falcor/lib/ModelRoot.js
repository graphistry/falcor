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
    var cTime, cType = node && node.$type;
    var mTime, mType = message && message.$type;
    if (cType) {
        // If the cache has a type, but the message is a primitive,
        // the message might be the primitive response from the datasource.
        // If so, return true, so we don't update the back-reference versions.
        if (!mType) { return node.value === message; }
        // If their types are different, then isDistinct = true
        if (cType !== mType) { return false; }
        // If the message is older than the cache node, then isDistinct = false
        if ((mTime = message.$timestamp) < (cTime = node.$timestamp)) { return true; }
        // If the message has a timestamp but the cache doesn't, then isDistinct = true
        if (mTime !== undefined && cTime === undefined) { return false; }
        // If $expires is different, then isDistinct = true
        if (node.$expires !== message.$expires) { return false; }
        // If they're both refs, compare their paths
        if (cType === $ref) {
            var nRef = node.value;
            var nLen = nRef.length;
            var mRef = message.value;
            // If their lengths are different, then isDistinct = true
            if (nLen !== mRef.length) { return false; }
            while (~--nLen) {
                // If their paths are different, then isDistinct = true
                if (nRef[nLen] !== mRef[nLen]) { return false; }
            }
            // The refs are equal, so isDistinct = false
            return true;
        }
        // If everything else matches, compare their values
        return node.value === message.value;
    }
    // If cache doesn't have a type but the message does, they must be different.
    // If neither have a type, they must be primitives, so compare the raw values.
    return mType ? false : node === message;
}

ModelRoot.comparator = ModelRoot.prototype.comparator = defaultCompare;

module.exports = ModelRoot;
