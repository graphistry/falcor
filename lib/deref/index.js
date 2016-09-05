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
        var cacheNode = cacheRoot;
        var validContainer = CONTAINER_DOES_NOT_EXIST;

        if (absolutePath.length > 0 && toReference) {

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

            if (!originalRefPath) {
                cacheNode = getCachePosition(cacheRoot, toReference);
            }
            // If the reference container is still a sentinel value then compare
            // the reference value with refPath.  If they are the same, then the
            // model is still valid.
            else if (referenceContainer && referenceContainer.$type === $ref) {
                i = 0;
                len = originalRefPath.length;
                currentRefPath = referenceContainer.value;

                validContainer = true;
                for (; validContainer && i < len; ++i) {
                    if (currentRefPath[i] !== originalRefPath[i]) {
                        validContainer = false;
                    }
                }
            } else {
                cacheNode = referenceContainer;
            }
        } else {
            cacheNode = getCachePosition(cacheRoot, absolutePath);
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
