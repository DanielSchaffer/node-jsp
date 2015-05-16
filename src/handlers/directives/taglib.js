var when = require('when');

module.exports = function taglibDirective(nodeContext) {

    if (!nodeContext.node.attribs.uri) {
        return when.reject({
            message: 'node is missing uri attribute',
            nodeContext: nodeContext
        });
    }

    if (!nodeContext.node.attribs.prefix) {
        return when.reject({
            message: 'node is missing prefix attribute',
            nodeContext: nodeContext
        });
    }

    nodeContext.tagNamespaces.registerPrefix(nodeContext.node.attribs.uri, nodeContext.node.attribs.prefix);
};