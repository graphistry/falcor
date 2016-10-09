function FalcorJSON(f_meta) {
    this[ƒ_meta] = f_meta || {};
}

FalcorJSON.prototype = Object.create(Object.prototype, Object.assign({
        toJSON: { value: toJSON },
        toProps: { value: toProps },
        $__hash: {
            enumerable: false,
            get() {
                var f_meta = this[ƒ_meta];
                return f_meta && f_meta["$code"] || '';
            }
        },
        $__version: {
            enumerable: false,
            get() {
                var f_meta = this[ƒ_meta];
                return f_meta && f_meta[ƒm_version] || 0;
            }
        }
    },
    arrayProtoMethods().reduce((falcorJSONProto, methodName) => {
        var method = Array.prototype[methodName];
        falcorJSONProto[methodName] = {
            writable: true, enumerable: false, value() {
                return method.apply(this, arguments);
            }
        };
        return falcorJSONProto;
    }, {}))
);

function arrayProtoMethods() {
    return [
        'concat', 'copyWithin', 'entries', 'every', 'fill', 'filter', 'find',
        'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'keys',
        'lastIndexOf', 'map', 'pop', 'push', 'reduce', 'reduceRight',
        'reverse', 'shift', 'slice', 'some', 'sort', 'splice', 'unshift', 'values'
    ];
}

var isArray = Array.isArray;
var typeofObject = 'object';

function toProps(inst, serialize) {
    var argsLen = arguments.length;
    inst = argsLen === 0 ? this : inst;
    if (!inst || typeof inst !== typeofObject) {
        return inst;
    } else if (inst['self'] === inst ||
               inst['global'] === inst ||
               inst['window'] === inst) {
        return undefined;
    }
    var json = toJSON(inst, argsLen > 0 && serialize || toProps);
    var f_meta = json[ƒ_meta];
    if (f_meta) {
        delete json[ƒ_meta];
        f_meta[ƒm_version] = inst[ƒ_meta][ƒm_version];
    }
    json.__proto__ = new FalcorJSON(f_meta);
    return json;
}

function toJSON(inst, serialize) {

    var argsLen = arguments.length;
    inst = argsLen === 0 ? this : inst;
    if (!inst || typeof inst !== typeofObject) {
        return inst;
    } else if (inst['self'] === inst ||
               inst['global'] === inst ||
               inst['window'] === inst) {
        return undefined;
    }

    var count, total, f_meta, keys, key, xs;

    serialize = argsLen > 0 && serialize || toJSON;

    if (isArray(inst)) {
        count = -1;
        total = inst.length;
        xs = new Array(total);
        while (++count < total) {
            xs[count] = inst[count];
        }
    } else {
        xs = {};
        count = -1;
        f_meta = inst[ƒ_meta];
        keys = Object.keys(inst);
        total = keys.length;
        if (f_meta) {
            var $code = f_meta["$code"],
                fm_abs_path = f_meta[ƒm_abs_path],
                fm_deref_to = f_meta[ƒm_deref_to],
                fm_deref_from = f_meta[ƒm_deref_from];
            xs[ƒ_meta] = f_meta = {};
            $code && (f_meta["$code"] = $code);
            fm_abs_path && (f_meta[ƒm_abs_path] = fm_abs_path);
            fm_deref_to && (f_meta[ƒm_deref_to] = fm_deref_to);
            fm_deref_from && (f_meta[ƒm_deref_from] = fm_deref_from);
        }
        while (++count < total) {
            key = keys[count]
            if (key !== ƒ_meta) {
                xs[key] = serialize(inst[key], serialize);
            }
        }
    }

    return xs;
}

module.exports = FalcorJSON;
