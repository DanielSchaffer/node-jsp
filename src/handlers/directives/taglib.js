var q = require('q');

module.exports = function taglibDirective(nodeContext) {

    if (!nodeContext.node.attribs.uri) {
        return q.reject({
            message: 'node is missing uri attribute',
            nodeContext: nodeContext
        });
    }

    if (!nodeContext.node.attribs.prefix) {
        return q.reject({
            message: 'node is missing prefix attribute',
            nodeContext: nodeContext
        });
    }

    nodeContext.tagNamespaces.registerPrefix(nodeContext.node.attribs.uri, nodeContext.node.attribs.prefix);
};