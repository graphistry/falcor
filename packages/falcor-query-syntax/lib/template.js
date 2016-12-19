var isArray = Array.isArray;
var typeofObject = 'object';
var typeofFunction = 'function';

module.exports = template;

function template() {

    var strings = isArray(arguments[0]) ?
           arguments[0] : [arguments[0]];
    var str = '', index = 0;
    var opts = { $__index__$: 0 };
    var stringsLen = strings.length;
    var keysLen = arguments.length - 1;

    do {
        str += strings[index];
        if (index < keysLen) {
            str += stringify(opts, arguments[index + 1]);
        }
    } while (++index < stringsLen);

    return [str, opts];
}

function stringify(opts, arg) {

    if (arg === null) {
        return null;
    } else if (arg === undefined) {
        return undefined;
    }

    var _to, _key, _from;
    var typeOfArg = typeof arg;

    if (typeOfArg !== typeofObject) {
        if (typeOfArg !== typeofFunction) {
            return arg;
        }
        _key = '$__' + (opts.$__index__$++) + '__$';
        opts[_key] = arg;
        return _key;
    }

    if (isArray(arg)) {
        return JSON.stringify(arg.map(
            stringify.bind(null, opts)
        )).slice(1, -1);
    } else if (arg.get || arg.set || arg.call) {
        _key = '$__' + (opts.$__index__$++) + '__$';
        opts[_key] = arg;
        return _key;
    }

    _to = arg.to, _from = arg.from || 0;

    return _to !== undefined ?
        _from + '..' + (_to || 0) :
        _from + '...' + (_from + (arg.length || 0));
}
