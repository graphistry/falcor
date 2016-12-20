var typeofObject = 'object';
var CONTAINER_DOES_NOT_EXIST = 'e';
var FalcorJSON = require('../cache/get/json/FalcorJSON');
var getCachePosition = require('../cache/getCachePosition');
var InvalidDerefInputError = require('../errors/InvalidDerefInputError');

module.exports = function deref(json) {

    var seed, f_meta;

    if (!json || typeofObject !== typeof json || ! (
        f_meta = json[f_meta_data]) || typeofObject !== typeof f_meta) {
        return null;
    }

    var cacheRoot = this._root.cache;
    var recycleJSON = this._recycleJSON;
    var absolutePath = f_meta[f_meta_abs_path];
    var referenceContainer, currentRefPath, i, len;

    if (!absolutePath) {
        if (recycleJSON) {
            seed = { json: json };
            seed.__proto__ = FalcorJSON.prototype;
        }
        return this._clone({
            _node: undefined,
            _seed: seed
        });
    } else if (absolutePath.length === 0) {
        if (recycleJSON) {
            seed = { json: json };
            seed.__proto__ = FalcorJSON.prototype;
        }
        return this._clone({
            _node: cacheRoot,
            _path: absolutePath,
            _referenceContainer: true,
            _seed: seed
        });
    }

    var originalRefPath = f_meta[f_meta_deref_to];
    var originalAbsPath = f_meta[f_meta_deref_from];

    // We deref and then ensure that the reference container is attached to
    // the model.
    var cacheNode = getCachePosition(cacheRoot, absolutePath);
    var validContainer = CONTAINER_DOES_NOT_EXIST;

    if (originalAbsPath) {

        validContainer = false;

        i = -1;
        len = originalAbsPath.length;
        referenceContainer = cacheRoot;
        while (++i < len) {
            referenceContainer = referenceContainer[originalAbsPath[i]];
            if (!referenceContainer || referenceContainer.$type) {
                break;
            }
        }

        // If the reference container is still a sentinel value then compare
        // the reference value with refPath.  If they are the same, then the
        // model is still valid.
        if (originalRefPath && referenceContainer && referenceContainer.$type === $ref) {
            validContainer = true;
            len = originalRefPath.length;
            currentRefPath = referenceContainer.value;
            for (i = 0; i < len; ++i) {
                if (currentRefPath[i] !== originalRefPath[i]) {
                    cacheNode = undefined;
                    validContainer = false;
                    break;
                }
            }
        }
    }

    // Signal to the deref'd model that it has been disconnected from the
    // graph or there is no _fromWhenceYouCame
    if (!validContainer) {
        referenceContainer = false;
    }

    // The container did not exist, therefore there is no reference
    // container and fromWhenceYouCame should always return true.
    else if (validContainer === CONTAINER_DOES_NOT_EXIST) {
        referenceContainer = true;
    }

    if (recycleJSON) {
        seed = { json: json };
        seed.__proto__ = FalcorJSON.prototype;
    }

    return this._clone({
        _node: cacheNode,
        _path: absolutePath,
        _referenceContainer: referenceContainer,
        _seed: seed
    });
};
