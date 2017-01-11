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
                    value: bindArrayMethod(name, fn),
                    writable: true, enumerable: false
                };
            }
        }
        return descriptors;
    }, protoDescriptors)
);

function bindArrayMethod(name, fn) {
    return new Function('fn',
        'return function ' + name + ' () {' +
            'return fn.apply(this, arguments);' +
        '};'
    )(fn);
}

var isArray = Array.isArray;
var typeofObject = 'object';
var typeofString = 'string';

function getInst(inst) {
    var typeofInst = typeof inst;
    var argsLen = arguments.length;
    if (argsLen === 0) {
        inst = this;
    } else if (typeofInst !== typeofString) {
        if (!inst || typeofInst !== typeofObject) {
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

function toProps(inst) {

    inst = getInst.apply(this, arguments);

    var f_meta_inst, f_meta_json, version = 0;
    var json = serialize(inst, toProps, true, true);

    if (inst && (f_meta_inst = inst[f_meta_data])) {
        version = f_meta_inst[f_meta_version];
    }

    if (!(!json || typeof json !== typeofObject)) {
        if (f_meta_json = json[f_meta_data]) {
            f_meta_json[f_meta_version] = version;
        }
    }

    return json;
}

function serialize(inst, serializer, includeMetadata, createWithProto, includeStatus) {

    if (!inst || typeof inst !== typeofObject) {
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
