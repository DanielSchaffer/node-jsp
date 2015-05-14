var binding = require('../../binding');

module.exports = function paramTag(nodeContext) {

    if (nodeContext.node.attribs.value) {
        nodeContext.node.childContent = binding(nodeContext.node.attribs.value.trim(), nodeContext.model);
    }

    return '';
};