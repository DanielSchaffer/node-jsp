var _ = require('underscore'),

    binding = require('../../binding');

function chooseTag(context, callingPath, node, model) {

    var match = _.find(node.children, function (childNode) {

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

        test = binding(childNode.attribs.test, model);

        return test && test !== 'null';

    });

    if (!match) {
        match = _.find(node.children, function (childNode) {
            return childNode.name === 'c:otherwise';
        });
    }

    if (match) {
        node.children = [match];
    } else {
        node.children = null;
    }

    return '';

}

module.exports = chooseTag;