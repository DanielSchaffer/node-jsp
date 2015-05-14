var vm = require('vm'),
    _ = require('underscore'),
    returnEmpty = [
        /undefined/,
        /null/,
        /not defined/
    ];

module.exports = function binder(translatedTokens, model) {
    var expression = translatedTokens.join(' ');

    if (!expression) {
        return '';
    }

    try {
        var result = vm.runInContext(expression, model);

        if (result === null || typeof(result) === 'undefined') {
            return '';
        }

        return result;
    } catch (ex) {
        // TODO - a better fix for this
        if (_.any(returnEmpty, function (p) { return p.test(ex.message); })) {
            return '';
        }

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