var vm = require('vm');

module.exports = function binder(translatedTokens, model) {
    var expression = translatedTokens.join(' ');

    if (!expression) {
        return '';
    }

    try {
        return vm.runInContext(expression, model);
    } catch (ex) {
        throw {
            message: 'error executing expression',
            expression: expression,
            model: model,
            ex: {
                message: ex.message,
                source: ex.source
            }
        };
    }
};