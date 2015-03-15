var binding = require('./binding');

module.exports = function textHandler(context, callingPath, node, model) {

    if (node.data === 'undefined') {
        console.log('does this really happen?');
        return '';
    }

    return binding(node.data, model);

};