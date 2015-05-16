var vm = require('vm'),

    translator = require('./binding/translator'),

    cache = {};

module.exports = function executor(sourceFile, expression, model, skipTranslate, profiler) {

    var cacheKey = expression + '_' + (skipTranslate || '').toString(),
        cachedExpression = cache[cacheKey],
        log;

    if (!cachedExpression) {
        log = profiler.start('executor', 'cache miss');
        cachedExpression = new vm.Script(skipTranslate ? expression : translator.translate(expression).join(' '));
        cache[cacheKey] = cachedExpression;
    } else {
        log = profiler.start('executor', 'cache hit');
    }

    var result = cachedExpression.runInContext(model, { filename: sourceFile });
    log.end();
    return result;
};