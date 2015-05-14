var binding = require('./binding');

module.exports = function textHandler(nodeContext) {

    if (nodeContext.node.data === 'undefined') {
        console.log('does this really happen?');
        return '';
    }

    return binding(nodeContext.node.data, nodeContext.model);
};