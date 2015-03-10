var _ = require('underscore');

module.exports = function htmlPassThroughHandler(callingPath, node) {
    var begin, end;

    begin = '<' + node.name;
    if (node.attribs) {
        begin += ' ';
        _.each(node.attribs, function (value, name) {
            begin += name + '="' + value + '"';
        });
    }
    begin += '>';

    end = '</' + node.name + '>';

    return {
        begin: begin,
        end: end
    };
};