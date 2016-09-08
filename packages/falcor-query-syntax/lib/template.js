var isArray = Array.isArray;

module.exports = exports = template;

function template() {
    var strings = isArray(arguments[0]) ? arguments[0] : [arguments[0]];
    var keys = Array.prototype.slice.call(arguments, 1);
    var result = strings.map(function(str, index) {
        var arg = index < keys.length ? stringify(keys[index]) : "";
        return str + arg;
    }).join("");
    return result;
}

function stringify(value) {
    if (isArray(value)) {
        return JSON.stringify(value.map(function(v) {
            return stringify(v);
        })).slice(1, -1);
    } else if (value === null) {
        return null;
    } else if (typeof value === "object") {
        var to = value.to;
        var from = value.from || 0;
        if (to === undefined) {
            return '' + from + '...' + (from + (value.length || 0));
        }
        return '' + from + '..' + (to || 0);
    } else {
        return value;
    }
}

