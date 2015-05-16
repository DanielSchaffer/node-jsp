var _ = require('underscore'),
    binding = require('../../binding');

module.exports = function htmlDirectiveHandler(nodeContext, profiler) {

    var log = profiler.start('htmlDirective', 'htmlDirective');
    var begin = '<';
    if (nodeContext.node.type === 'comment') {
        begin += '!--';
    }
    begin += binding(nodeContext.sourceFile, nodeContext.node.data, nodeContext.model, log.profiler);
    if (nodeContext.node.type === 'comment') {
        begin += '--';
    }
    begin += '>';

    log.end();

    return {
        begin: begin
    };
};