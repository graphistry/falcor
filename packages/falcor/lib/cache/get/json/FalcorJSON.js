function FalcorJSON(f_meta) {
    this[f_meta_data] = f_meta || {};
}

FalcorJSON.prototype = Object.create(Object.prototype, Object.assign({
        toJSON: { value: toJSON },
        toProps: { value: toProps },
        toString: { value: toString },
        $__hash: {
            enumerable: false,
            get() {
                var f_meta = this[f_meta_data];
                return f_meta && f_meta['$code'] || '';
            }
        },
        $__version: {
            enumerable: false,
            get() {
                var f_meta = this[f_meta_data];
                return f_meta && f_meta[f_meta_version] || 0;
            }
        }
    },
    arrayProtoMethods().reduce(function (falcorJSONProto, methodName) {
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
    return serialize(
        getInst.apply(this, arguments), toJSON, false
    );
}

function toString(includeMetadata) {
    return JSON.stringify(serialize(
        getInst.call(this, this), serialize, includeMetadata === true
    ));
}

function toProps(inst) {

    inst = getInst.apply(this, arguments);

    var f_meta_inst, f_meta_json, version = 0;
    var json = serialize(inst, toProps, true);

    if (inst && (f_meta_inst = inst[f_meta_data])) {
        version = f_meta_inst[f_meta_version];
    }

    if (!(!json || typeof json !== typeofObject)) {
        json.__proto__ = FalcorJSON.prototype;
        if (f_meta_json = json[f_meta_data]) {
            f_meta_json[f_meta_version] = version;
        }
    }

    return json;
}

function serialize(inst, serializer, includeMetadata) {

    if (!inst || typeof inst !== typeofObject) {
        return inst;
    }

    var count, total, f_meta, keys, key, xs;

    if (isArray(inst)) {
        xs = inst;
        // count = -1;
        // total = inst.length;
        // xs = new Array(total);
        // while (++count < total) {
        //     xs[count] = inst[count];
        // }
    } else {

        xs = {};
        count = -1;
        keys = Object.keys(inst);
        total = keys.length;

        if (includeMetadata && (f_meta = inst[f_meta_data])) {

            var $code = f_meta['$code'];
            var abs_path = f_meta[f_meta_abs_path];
            var deref_to = f_meta[f_meta_deref_to];
            var deref_from = f_meta[f_meta_deref_from];

            f_meta = xs[f_meta_data] = {};
            $code && (f_meta['$code'] = $code);
            abs_path && (f_meta[f_meta_abs_path] = abs_path);
            deref_to && (f_meta[f_meta_deref_to] = deref_to);
            deref_from && (f_meta[f_meta_deref_from] = deref_from);
        }

        while (++count < total) {
            if ((key = keys[count]) !== f_meta_data) {
                xs[key] = serializer(inst[key], serializer, includeMetadata);
            }
        }
    }

    return xs;
}

module.exports = FalcorJSON;
