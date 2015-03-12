var vm = require('vm'),

    binding = require('./binding');

module.exports = function setTag(callingPath, node, model) {

    var value;

    if (!node.attribs.var) {
        throw {
            message: 'missing required attribute "var"',
            node: node
        };
    }

    if (!node.attribs.value && (!node.children || !node.children.length)) {
        throw {
            message: 'missing required content - no child content or value attribute',
            node: node
        };
    }



};