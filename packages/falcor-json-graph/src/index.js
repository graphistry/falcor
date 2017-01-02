var fromPath = require('@graphistry/falcor-path-syntax').fromPath;

function sentinel(type, value, props) {
    var obj = Object.create(null);
    if (props != null) {
        for (var key in props) {
            obj[key] = props[key];
        }
    }
    obj['$type'] = type;
    obj['value'] = value;
    return obj;
}

var helpers = {
    ref: function ref(path, props) {
        return sentinel('ref', fromPath(path), props);
    },
    atom: function atom(value, props) {
        return sentinel('atom', value, props);
    },
    undefined: function(props) {
        return sentinel('atom', undefined, props);
    },
    error: function error(errorValue, props) {
        return sentinel('error', errorValue, props);
    },
    pathValue: function pathValue(path, value) {
        return { path: fromPath(path), value: value };
    },
    pathInvalidation: function pathInvalidation(path) {
        return { path: fromPath(path), invalidated: true };
    }
};

helpers.$ref = helpers.ref;
helpers.$atom = helpers.atom;
helpers.$error = helpers.error;
helpers.empty = helpers.undefined;
helpers.$empty = helpers.undefined;
helpers.$value = helpers.pathValue;
helpers.$pathValue = helpers.pathValue;
helpers.$invalidate = helpers.pathInvalidation;
helpers.$invalidation = helpers.pathInvalidation;

module.exports = helpers;
