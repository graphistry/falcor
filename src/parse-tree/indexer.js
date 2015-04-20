var TokenTypes = require('./../TokenTypes');
var E = require('./../exceptions');
var idxE = E.indexer;
var range = require('./range');

/**
 * The indexer is all the logic that happens in between
 * the '[', opening bracket, and ']' closing bracket.
 */
module.exports = function indexer(tokenizer, openingToken, state, out) {
    var token = tokenizer.next();
    var first = true;
    var done = false;

    // State variables
    state.indexer = [];

    while (!token.done) {

        // continue to build the parse string.
        state.parseString += token.token;

        switch (token.type) {
            case TokenTypes.token:
                var t = +token.token;
                if (isNaN(t)) {
                    E.throwError(idxE.needQuotes, state);
                }
                state.indexer[state.indexer.length] = t;
                break;

            // dotSeparators at the top level have no meaning
            case TokenTypes.dotSeparator:
                if (first) {
                    E.throwError(idxE.leadingDot, state);
                }
                range(tokenizer, token, state, out);
                break;

            // Spaces do nothing.
            case TokenTypes.space:
                break;

            case TokenTypes.closingBracket:
                done = true;
                break;


            // Its time to decend the parse tree.
            case TokenTypes.openingBracket:
                E.throwError(idxE.nested, state);
                break;

            default:
                E.throwError(idxE.unexpectedToken, state);
        }

        // If done, leave loop
        if (done) {
            break;
        }

        first = false;

        // Keep cycling through the tokenizer.
        token = tokenizer.next();
    }

    if (first) {
        E.throwError(idxE.empty, state);
    }

    // Remember, if an array of 1, keySets will be generated.
    if (state.indexer.length === 1) {
        state.indexer = state.indexer[0];
    }
    out[out.length] = state.indexer;

    // Clean state.
    state.indexer = undefined;
};

