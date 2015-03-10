var bindingHandler = require('./binding'),

    bindingPattern = /^\$\{(.+)\}$/;

module.exports = function textHandler(node, model) {
    var match;

    if (node.data === 'undefined') {
        console.log('does this really happen?');
        return '';
    }

    console.log('text node', node.data);
    match = node.data.match(bindingPattern);

    if (!match) {
        return node.data;
    }

    return bindingHandler(match[1], model);

};