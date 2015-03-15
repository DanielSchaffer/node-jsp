var q = require('q');

module.exports = function taglibDirective(context, callingPath, node) {

    if (!node.attribs.uri) {
        return q.reject({
            message: 'node is missing uri attribute',
            node: node
        });
    }

    if (!node.attribs.prefix) {
        return q.reject({
            message: 'node is missing prefix attribute',
            node: node
        });
    }

    context.tagNamespaces.registerPrefix(node.attribs.uri, node.attribs.prefix);
};