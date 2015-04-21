var TokenTypes = require('./../TokenTypes');
var Expections = require('./../exceptions');
var indexer = require('./indexer');

/**
 * The top level of the parse tree.  This returns the generated path
 * from the tokenizer.
 */
module.exports = function head(tokenizer) {
    var token = tokenizer.next();
    var first = true;
    var state = {
        parseString: ''
    };
    var out = [];

    while (!token.done) {

        // continue to build the parse string.
        state.parseString += token.token;

        switch (token.type) {
            case TokenTypes.token:
                out[out.length] = token.token;
                break;

            // dotSeparators at the top level have no meaning
            case TokenTypes.dotSeparator:
                if (first) {
                    // TODO: Fix me
                    throw 'ohh no!';
                }
                break;

            // Spaces do nothing.
            case TokenTypes.space:
                // NOTE: Spaces at the top level are allowed.
                // titlesById  .summary is a valid path.
                break;


            // Its time to decend the parse tree.
            case TokenTypes.openingBracket:
                indexer(tokenizer, token, state, out);
                break;

            // TODO: Fix me
            default:
                throw 'ohh no!';
        }

        first = false;

        // Keep cycling through the tokenizer.
        token = tokenizer.next();
    }

    if (first) {
        // TODO: Ohh no! Fix me
        throw 'ohh no!';
    }

    return out;
};

