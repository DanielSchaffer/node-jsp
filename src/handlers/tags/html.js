var _ = require('underscore'),
    binding = require('../binding');

module.exports = function htmlPassThroughHandler(nodeContext) {
    var begin, end;

    begin = '<' + nodeContext.node.name;
    if (nodeContext.node.attribs) {
        _.each(nodeContext.node.attribs, function (value, name) {
            begin += ' ' + name + '="' + binding(value, nodeContext.model) + '"';
        });
    }
    begin += '>';

    end = '</' + nodeContext.node.name + '>';

    return {
        begin: begin,
        end: end
    };
};