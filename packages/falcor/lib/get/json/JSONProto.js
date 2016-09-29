function JSONProto(f_meta) {
    this[ƒ_meta] = f_meta || {};
}

JSONProto.prototype = Object.create(Object.prototype, Object.assign({
        toJSON: { value: toJSON },
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
    arrayProtoMethods().reduce((jsonProto, methodName) => {
        var method = Array.prototype[methodName];
        jsonProto[methodName] = {
            writable: true, enumerable: false, value() {
                return method.apply(this, arguments);
            }
        };
        return jsonProto;
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

function toJSON() {

    var count, total, value, f_meta, keys, key, xs;

    if (isArray(this)) {
        count = -1;
        total = this.length;
        xs = new Array(total);
        while (++count < total) {
            xs[count] = this[count];
        }
    } else {
        xs = {};
        count = -1;
        f_meta = this[ƒ_meta];
        keys = Object.keys(this);
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
                value = this[key];
                xs[key] = !(!value || typeof value !== typeofObject) &&
                    toJSON.call(value) || value;
            }
        }
    }

    return xs;
}

module.exports = JSONProto;
