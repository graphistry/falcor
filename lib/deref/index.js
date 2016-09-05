var CONTAINER_DOES_NOT_EXIST = "e";
var $ref = require("./../types/ref");
var getCachePosition = require("../get/getCachePosition");
var InvalidDerefInputError = require("./../errors/InvalidDerefInputError");

module.exports = function deref(boundJSONArg) {

    var referenceContainer, currentRefPath, i, len;
    var absolutePath = boundJSONArg && boundJSONArg.$__path;
    var originalRefPath = boundJSONArg && boundJSONArg.$__refPath;
    var toReference = boundJSONArg && boundJSONArg.$__toReference;

    // We deref and then ensure that the reference container is attached to
    // the model.
    if (absolutePath) {
        var cacheRoot = this._root.cache;
        var cacheNode = getCachePosition(cacheRoot, absolutePath);
        var validContainer = CONTAINER_DOES_NOT_EXIST;

        if (absolutePath.length === 0) {
            return this._clone({
                _path: absolutePath,
                _referenceContainer: true
            });
        }

        if (toReference) {

            validContainer = false;

            i = -1;
            len = toReference.length;
            referenceContainer = cacheRoot;
            while (++i < len) {
                referenceContainer = referenceContainer[toReference[i]];
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
            _referenceContainer: referenceContainer
        });
    }

    throw new InvalidDerefInputError();
};
