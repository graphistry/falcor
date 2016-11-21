var CONTAINER_DOES_NOT_EXIST = "e";
var $ref = require("../types/ref");
var getCachePosition = require("../cache/getCachePosition");
var InvalidDerefInputError = require("../errors/InvalidDerefInputError");

module.exports = function deref(boundJSONArg) {

    if (!boundJSONArg || typeof boundJSONArg !== 'object') {
        throw new InvalidDerefInputError();
    }

    var referenceContainer, currentRefPath, i, len;
    var jsonMetadata = boundJSONArg && boundJSONArg[ƒ_meta];

    if (!jsonMetadata || typeof jsonMetadata !== 'object') {
        return this._clone({
            _node: undefined
        });
    }

    var recycleJSON = this._recycleJSON;
    var absolutePath = jsonMetadata[ƒm_abs_path];

    if (!absolutePath) {
        return this._clone({
            _node: undefined,
            _seed: recycleJSON && { json: boundJSONArg } || undefined
        });
    } else if (absolutePath.length === 0) {
        return this._clone({
            _path: absolutePath,
            _node: this._root.cache,
            _referenceContainer: true,
            _seed: recycleJSON && { json: boundJSONArg } || undefined
        });
    }

    var originalRefPath = jsonMetadata[ƒm_deref_to];
    var originalAbsPath = jsonMetadata[ƒm_deref_from];

    // We deref and then ensure that the reference container is attached to
    // the model.
    var cacheRoot = this._root.cache;
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
            i = 0;
            len = originalRefPath.length;
            currentRefPath = referenceContainer.value;

            validContainer = true;
            for (; validContainer && i < len; ++i) {
                if (currentRefPath[i] !== originalRefPath[i]) {
                    validContainer = false;
                }
            }
            if (validContainer === false) {
                cacheNode = undefined;
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
        _seed: recycleJSON && { json: boundJSONArg } || undefined
    });
};
