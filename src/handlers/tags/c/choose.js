var _ = require('underscore'),

    binding = require('../../binding');

function chooseTag(nodeContext) {

    var match = _.find(nodeContext.node.children, function (childNode) {

        var test;

        if (childNode.name !== 'c:when') {
            return false;
        }

        if (!childNode.attribs.test) {
            throw {
                message: 'missing required attribute "test"',
                node: childNode
            };
        }

        test = binding(childNode.attribs.test, nodeContext.model);

        return test && test !== 'null';

    });

    if (!match) {
        match = _.find(nodeContext.node.children, function (childNode) {
            return childNode.name === 'c:otherwise';
        });
    }

    if (match) {
        nodeContext.node.children = [match];
    } else {
        nodeContext.node.children = null;
    }

    return '';

}

module.exports = chooseTag;