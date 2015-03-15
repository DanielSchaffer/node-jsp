var _ = require('underscore'),
    binding = require('../binding');

module.exports = function htmlPassThroughHandler(context, callingPath, node, model) {
    var begin, end;

    begin = '<' + node.name;
    if (node.attribs) {
        _.each(node.attribs, function (value, name) {
            begin += ' ' + name + '="' + binding(value, model) + '"';
        });
    }
    begin += '>';

    end = '</' + node.name + '>';

    return {
        begin: begin,
        end: end
    };
};