var util = require('util');
var internalKeyMap = require('./../lib/internal');
var internalKeys = Object.keys(internalKeyMap).map(function(key) {
    return internalKeyMap[key];
});

module.exports = {
    clean: clean,
    strip: strip,
    internalKeys: internalKeys,
    convertKey: convert,
    convertModelCreatedAtoms: convertModelCreatedAtoms,
    convertNodes: function convertNodesHeader(obj, transform) {
        return convertNodes(null, null, obj, transform);
    },
    stripDerefAndVersionKeys: function(item) {
        return strip.apply(null, [item, '$size'].concat(internalKeys));
    },
    traverseAndConvert: traverseAndConvert
};

function convertModelCreatedAtoms(cache) {
    convertNodes(null, null, cache, function transform(sentinel) {
        if (sentinel.$type === 'atom' && sentinel[f_wrapped_value] &&
            typeof sentinel.value !== 'object') {

            return sentinel.value;
        }
        return sentinel;
    });
};

function clean(item, options) {
    options = options || {
        strip: ['$size'].concat(internalKeys)
    };

    item = strip.apply(null, [item].concat(options.strip));
    item = traverseAndConvert(item);

    return item;
}

function convertNodes(parent, fromKey, obj, transform) {
    if (obj != null && typeof obj === 'object') {
        if (obj.$type) {
            parent[fromKey] = transform(obj);
        }

        Object.keys(obj).forEach(function(k) {
            if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
                convertNodes(obj, k, obj[k], transform);
            }
        });
    }
    return obj;
}

function convert(obj, config) {
    if (obj != null && typeof obj === 'object') {
        Object.keys(config).forEach(function(key) {
            // Converts the object.
            if (obj[key]) {
                obj[key] = config[key](obj[key]);
            }
        });

        Object.keys(obj).forEach(function(k) {
            if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
                convert(obj[k], config);
            }
        });
    }
    return obj;
}

function traverseAndConvert(obj) {
    if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
            if (typeof obj[i] === 'object') {
                traverseAndConvert(obj[i]);
            } else if (typeof obj[i] === 'number') {
                obj[i] = obj[i] + '';
            } else if(typeof obj[i] === 'undefined') {
                obj[i] = null;
            }
        }
    } else if (obj != null && typeof obj === 'object') {
        Object.keys(obj).forEach(function(k) {
            if (typeof obj[k] === 'object') {
                traverseAndConvert(obj[k]);
            } else if (typeof obj[k] === 'number') {
                obj[k] = obj[k] + '';
            } else if(typeof obj[k] === 'undefined') {
                obj[k] = null;
            }
        });
    }
    return obj;
}

function strip(obj, key) {
    var keys = Array.prototype.slice.call(arguments, 1);
    var args = [0].concat(keys);
    if (obj != null && typeof obj === 'object') {
        return Object.keys(obj).reduce(function(newObj, k) {
            if (keys.indexOf(k) === -1) {
                if ((args[0] = obj[k]) != null && typeof obj[k] === 'object') {
                    newObj[k] = strip.apply(null, args);
                } else {
                    newObj[k] = obj[k];
                }
            }
            return newObj;
        }, Array.isArray(obj) ? [] : {});
    }
    return obj;
}
