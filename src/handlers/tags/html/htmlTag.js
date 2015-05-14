var _ = require('underscore'),
    binding = require('../../binding'),

    shorthandClose = [
        'base',
        'br',
        'input',
        'link'
    ];

module.exports = function htmlPassThroughHandler(nodeContext) {
    var begin, end;

    begin = '<' + nodeContext.node.name;
    if (nodeContext.node.attribs) {
        _.each(nodeContext.node.attribs, function (value, name) {
            if (name === value) {
                begin += ' ' + binding(value, nodeContext.model);
            } else {
                begin += ' ' + name + '="' + binding(value, nodeContext.model) + '"';
            }
        });
    }

    if (_.contains(shorthandClose, nodeContext.node.name)) {
        begin += ' /';
    } else {
        end = '</' + nodeContext.node.name + '>';
    }
    begin += '>';


    return {
        begin: begin,
        end: end
    };
};