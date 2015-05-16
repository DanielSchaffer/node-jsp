var _ = require('underscore'),
    binding = require('../../binding'),

    shorthandClose = [
        'base',
        'br',
        'input',
        'link'
    ];

module.exports = function htmlPassThroughHandler(nodeContext, profiler) {
    var begin, end;

    var log = profiler.start('htmlTag', 'htmlTag');

    begin = '<' + nodeContext.node.name;
    if (nodeContext.node.attribs) {
        _.each(nodeContext.node.attribs, function (value, name) {
            if (name === value) {
                begin += ' ' + binding(nodeContext.sourceFile, value, nodeContext.model, log.profiler);
            } else {
                begin += ' ' + name + '="' + binding(nodeContext.sourceFile, value, nodeContext.model, log.profiler) + '"';
            }
        });
    }

    if (_.contains(shorthandClose, nodeContext.node.name)) {
        begin += ' /';
    } else {
        end = '</' + nodeContext.node.name + '>';
    }
    begin += '>';

    log.end();

    return {
        begin: begin,
        end: end
    };
};