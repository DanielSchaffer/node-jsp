var binding = require('../../binding');

module.exports = function paramTag(nodeContext, profiler) {

    var log = profiler.start('paramTag', 'paramTag');

    if (nodeContext.node.attribs.value) {
        nodeContext.node.childContent = binding(nodeContext.sourceFile, nodeContext.node.attribs.value.trim(), nodeContext.model, log.profiler);
    }

    log.end();

    return '';
};