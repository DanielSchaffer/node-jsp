var _ = require('underscore'),
    when = require('when'),
    executor = require('./executor'),
    util = require('../util'),

    pattern = /\$\{(.+?)\}/g,
    standalonePattern = /^\$\{(.+?)\}$/,

    returnEmpty = [
        /undefined/,
        /null/,
        /not defined/
    ];

function bind(sourceFile, expression, model, profiler) {

    if (!expression) {
        return '';
    }

    try {

        var result = executor(sourceFile, expression, model, null, profiler);

        if (result === null || typeof(result) === 'undefined') {
            return '';
        }

        if (_.isObject(result)) {
            result = JSON.stringify(result);
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

}

module.exports = function binding(sourceFile, input, model, profiler) {

    var match = input.match(pattern);
    if (match && match.length == 1 && match[0] === input) {
        return bind(sourceFile, input.match(standalonePattern)[1], model, profiler);
    }

    return input.replace(pattern, function replace(match, expression) {
        return bind(sourceFile, expression, model, profiler);
    });

};