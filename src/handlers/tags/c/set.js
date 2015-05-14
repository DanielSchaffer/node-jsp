var vm = require('vm'),
    _ = require('underscore'),

    binding = require('../../binding');

function setTag(nodeContext) {

    var value, setExpr;

    if (!nodeContext.node.attribs.var) {
        throw {
            message: 'missing required attribute "var"',
            nodeContext: nodeContext
        };
    }

    if (!nodeContext.node.attribs.value && !nodeContext.node.childContent) {
        throw {
            message: 'missing required content - no child content or value attribute',
            nodeContext: nodeContext
        };
    }

    if (nodeContext.node.attribs.value) {
        value = binding(nodeContext.node.attribs.value, nodeContext.model);
    } else {
        value = nodeContext.node.childContent;
    }

    value = value.replace(/"/g, '\\"');
    value = value.replace(/\n\s*/g, '');

    if (value && isNaN(value) && (value[0] !== '{' || value[value.length - 1] !== '}')) {
        value = '"' + value + '"';
    }

    setExpr = nodeContext.node.attribs.var + '=' + value;

    try {
        vm.runInContext(setExpr, nodeContext.model);
        nodeContext.node.childContent = '';
    } catch(ex) {
        throw {
            message: 'error executing expression from c:set tag',
            expression: setExpr,
            model: nodeContext.model,
            ex: {
                message: ex.message,
                stack: ex.stack.replace('\\\\', '\\')
            }
        };
    }

    return null;
}
setTag.renderChildrenFirst = true;

module.exports = setTag;