var binding = require('./binding');

module.exports = function textHandler(nodeContext, profiler) {

    var log = profiler.start('text', 'text');

    if (nodeContext.node.data === 'undefined') {
        console.log('does this really happen?');
        return '';
    }

    var result = binding(nodeContext.sourceFile, (nodeContext.node.data || '').trim(), nodeContext.model, log.profiler);
    log.end();
    return result;
};