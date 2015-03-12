var vm = require('vm'),
    executor = require('./executor'),
    lexer = require('./binding/lexer'),
    translator = require('./binding/translator'),

    pattern = /\$\{(.+?)\}/g;

function bind(expression, model) {

    var tokens = lexer(expression),
        translatedTokens = translator(tokens, model);

    return executor(translatedTokens, model);

}

module.exports = function binding(input, model) {

    return input.replace(pattern, function replace(match, expression) {
        return bind(expression, model);
    });

};