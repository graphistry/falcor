var Tokenizer = require('./tokenizer');
var head = require('./parse-tree/head');

module.exports = function parser(string, extendedRules) {
    return head(new Tokenizer(string, extendedRules));
};
