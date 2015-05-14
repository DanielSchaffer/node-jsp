var _ = require('underscore'),
    binding = require('../../binding');

module.exports = function htmlDirectiveHandler(nodeContext) {
    var begin = '<';
    if (nodeContext.node.type === 'comment') {
        begin += '!--';
    }
    begin += binding(nodeContext.node.data, nodeContext.model);
    if (nodeContext.node.type === 'comment') {
        begin += '--';
    }
    begin += '>';

    return {
        begin: begin
    };
};