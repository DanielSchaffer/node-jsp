var executor = require('./executor'),
    lexer = require('./binding/lexer'),
    translator = require('./binding/translator'),

    pattern = /\$\{(.+?)\}/g,
    standalonePattern = /^\$\{(.+?)\}$/;

function bind(expression, model) {

    var tokens = lexer(expression),
        translatedTokens = translator(tokens, model);

    return executor(translatedTokens, model);

}

module.exports = function binding(input, model) {

    var match = input.match(pattern);
    if (match && match.length == 1 && match[0] === input) {
        return bind(input.match(standalonePattern)[1], model);
    }

    return input.replace(pattern, function replace(match, expression) {
        return bind(expression, model);
    });

};