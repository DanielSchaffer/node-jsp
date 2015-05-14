var _ = require('underscore'),
    binding = require('../../binding');

module.exports = function htmlDirectiveHandler(nodeContext) {
    return {
        begin: '<' + binding(nodeContext.node.data, nodeContext.model) + '>'
    };
};