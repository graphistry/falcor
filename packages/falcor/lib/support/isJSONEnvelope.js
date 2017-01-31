var isObject = require('./../support/isObject');

module.exports = isJSONEnvelope;

function isJSONEnvelope(envelope) {
    return isObject(envelope) && ('json' in envelope);
}
