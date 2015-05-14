var vm = require('vm'),
    _ = require('underscore'),

    binding = require('../../binding'),
    util = require('../../../util');

function setTag(nodeContext) {

    var value, setExpr;

    if (!nodeContext.node.attribs.var) {
        throw {
            message: 'missing required attribute "var"',
            nodeContext: nodeContext
        };
    }

    if (util.definedAndNonNull(nodeContext.node.attribs.value)) {
        value = binding(nodeContext.node.attribs.value, nodeContext.model);
    } else {
        value = nodeContext.node.childContent || '';
    }

    value = value.replace(/"/g, '\\"');
    value = value.replace(/\n\s*/g, '');

    if (util.definedAndNonNull(value) && (isNaN(value) || value === '') && !/^\{.*\}$/.test(value)) {
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

    return '';
}
setTag.renderChildrenFirst = true;

module.exports = setTag;