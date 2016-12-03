var CONTAINER_DOES_NOT_EXIST = 'e';
var $ref = require('../types/ref');
var FalcorJSON = require('../cache/get/json/FalcorJSON');
var getCachePosition = require('../cache/getCachePosition');
var InvalidDerefInputError = require('../errors/InvalidDerefInputError');

module.exports = function deref(json) {

    if (!json || typeof json !== 'object') {
        throw new InvalidDerefInputError();
    }

    var referenceContainer, currentRefPath, i, len;
    var f_meta = json && json[f_meta_data];

    if (!f_meta || typeof f_meta !== 'object') {
        return this._clone({
            _node: undefined,
            _seed: recycleJSON && {
                __proto__: FalcorJSON.prototype
            } || undefined
        });
    }

    var cacheRoot = this._root.cache;
    var recycleJSON = this._recycleJSON;
    var absolutePath = f_meta[f_meta_abs_path];

    if (!absolutePath) {
        return this._clone({
            _node: undefined,
            _seed: recycleJSON && {
                json: json, __proto__: FalcorJSON.prototype
            } || undefined
        });
    } else if (absolutePath.length === 0) {
        return this._clone({
            _node: cacheRoot,
            _path: absolutePath,
            _referenceContainer: true,
            _seed: recycleJSON && {
                json: json, __proto__: FalcorJSON.prototype
            } || undefined
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

    return this._clone({
        _node: cacheNode,
        _path: absolutePath,
        _referenceContainer: referenceContainer,
        _seed: recycleJSON && {
            json: json, __proto__: FalcorJSON.prototype
        } || undefined
    });
};
