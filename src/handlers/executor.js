var vm = require('vm');

module.exports = function binder(translatedTokens, model) {
    var expression = translatedTokens.join(' ');

    return vm.runInContext(expression, model);
};