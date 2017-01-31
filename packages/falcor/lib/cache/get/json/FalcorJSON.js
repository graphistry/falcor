function FalcorJSON(f_meta) {
    if (!f_meta) {
        this[f_meta_data] = {};
    } else if (!(this[f_meta_data] = f_meta[f_meta_data])) {
        this[f_meta_data] = f_meta;
    }
}

var protoBlacklist = {
    length: true,
    toString: true,
    constructor: true,
    toLocaleString: true
};

var protoDescriptors = {
    toJSON: { enumerable: false, value: toJSON },
    toProps: { enumerable: false, value: toProps },
    toString: { enumerable: false, value: toString },
    toLocaleString: { enumerable: false, value: toString },
    $__hash: {
        enumerable: false,
        get: function() {
            var f_meta = this[f_meta_data];
            return f_meta && f_meta['$code'] || '';
        }
    },
    $__path: {
        enumerable: false,
        get: function() {
            var f_meta = this[f_meta_data];
            return f_meta && f_meta[f_meta_abs_path] || [];
        }
    },
    $__status: {
        enumerable: false,
        get: function() {
            var f_meta = this[f_meta_data];
            return f_meta && f_meta[f_meta_status] || 'resolved';
        }
    },
    $__version: {
        enumerable: false,
        get: function() {
            var f_meta = this[f_meta_data];
            return f_meta && f_meta[f_meta_version] || 0;
        }
    }
};

Object.defineProperties(FalcorJSON.prototype, Object
    .getOwnPropertyNames(Array.prototype)
    .reduce(function (descriptors, name) {
        if (!protoBlacklist.hasOwnProperty(name)) {
            var fn = Array.prototype[name];
            if (typeof fn === 'function') {
                descriptors[name] = {
                    value: bindArrayMethod(fn),
                    writable: true, enumerable: false
                };
            }
        }
        return descriptors;
    }, protoDescriptors)
);

function bindArrayMethod(fn) {
    return function() {
        var node = this, json = node, atom = node.length, length = atom, type;
        // If length isn't a number, an $atom with a numeric `value`, or if the
        // unboxed length isn't a valid Array length, bail early.
        // If we're still waiting on pending updates, return an empty Array.
        // Otherwise, throw a RangeError.
        if ((type = typeof atom) !== 'number' && (!atom ||
              type !== 'object' || atom.$type !== $atom ||
              typeof (length = atom.value) !== 'number')||
            length < 0 || length !== (length | 0)) {
            if (node.$__status === 'pending') {
                return [];
            }
            throw new RangeError('Invalid FalcorJSON length');
        }
        // Temporarily set length to the unboxed length, call the bound Array
        // method, then reset the length back to the boxed value. This is
        // necessary because a few Array methods (like sort) operate on the
        // Array in-place, so we can't pass a sliced copy of this instance to
        // the bound Array method. Do this even when the length isn't boxed, so
        // if calling the bound Array method writes to length, it's reset to the
        // value in the cache.
        node.length = length;
        json = fn.apply(node, arguments);
        node.length = atom;
        return json;
    }
}

var isArray = Array.isArray;

function getInst(x) {
    var inst = x;
    var typeofInst = typeof inst;
    var argsLen = arguments.length;
    if (argsLen === 0) {
        inst = this;
    } else if (typeofInst !== 'string') {
        if (!inst || typeofInst !== 'object') {
            return inst;
        }
    } else if (argsLen !== 1) {
        return inst;
    } else {
        inst = this;
    }
    return inst === global ? undefined : inst;
}

function toJSON() {
    return serialize(getInst.apply(this, arguments), toJSON);
}

function toString(includeMetadata, includeStatus) {
    return JSON.stringify(serialize(
        getInst.call(this, this),
        serialize,
        includeMetadata === true,
        false, includeStatus === true
    ));
}

function toProps(x) {

    var inst = getInst.apply(this, arguments);
    var f_meta_inst, f_meta_json, version = 0;
    var json = serialize(inst, toProps, true, true);

    if (inst && (f_meta_inst = inst[f_meta_data])) {
        version = f_meta_inst[f_meta_version];
    }

    if (!(!json || typeof json !== 'object')) {
        if (f_meta_json = json[f_meta_data]) {
            f_meta_json[f_meta_version] = version;
        }
    }

    return json;
}

function serialize(inst, serializer, includeMetadata, createWithProto, includeStatus) {

    if (!inst || typeof inst !== 'object') {
        return inst;
    }

    var count, total, f_meta, keys, key, xs, ys;

    if (isArray(inst)) {
        xs = inst;
    } else {

        count = -1;
        keys = Object.keys(inst);
        total = keys.length;
        xs = {};

        if (createWithProto) {
            xs.__proto__ = FalcorJSON.prototype;
        }

        if (includeMetadata && (f_meta = inst[f_meta_data])) {

            var $code = f_meta['$code'];
            var status = f_meta[f_meta_status];
            var abs_path = f_meta[f_meta_abs_path];
            var deref_to = f_meta[f_meta_deref_to];
            var deref_from = f_meta[f_meta_deref_from];

            f_meta = {};
            $code && (f_meta['$code'] = $code);
            abs_path && (f_meta[f_meta_abs_path] = abs_path);
            deref_to && (f_meta[f_meta_deref_to] = deref_to);
            deref_from && (f_meta[f_meta_deref_from] = deref_from);
            includeStatus && status && (f_meta[f_meta_status] = status);

            xs[f_meta_data] = f_meta;

            if (createWithProto) {
                ys = {};
                ys.__proto__ = xs;
                xs = ys;
            }
        }

        while (++count < total) {
            if ((key = keys[count]) !== f_meta_data) {
                xs[key] = serializer(inst[key], serializer, includeMetadata, createWithProto, includeStatus);
            }
        }
    }

    return xs;
}

module.exports = FalcorJSON;
