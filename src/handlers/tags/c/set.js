var _ = require('underscore'),

    executor = require('../../executor'),

    binding = require('../../binding'),
    util = require('../../../util');

function setTag(nodeContext, profiler) {

    var value, setExpr;

    var log = profiler.start('setTag', 'setTag');

    if (!nodeContext.node.attribs.var) {
        throw {
            message: 'missing required attribute "var"',
            nodeContext: nodeContext
        };
    }

    if (util.definedAndNonNull(nodeContext.node.attribs.value)) {
        value = binding(nodeContext.sourceFile, nodeContext.node.attribs.value, nodeContext.model, log.profiler) || '';
    } else {
        value = nodeContext.node.childContent || '';
    }

    if (_.isString(value)) {
        value = value.replace(/"/g, '\\"');
        value = value.replace(/\n\s*/g, '');
    }

    if (_.isString(value) && util.definedAndNonNull(value) && !/^\{.*\}$/.test(value)) {
        value = '"' + value + '"';
    }

    setExpr = nodeContext.node.attribs.var + '=' + value;

    try {

        executor(nodeContext.sourceFile, setExpr, nodeContext.model, true, log.profiler);
        nodeContext.node.childContent = '';

    } catch(ex) {

        throw {
            message: 'error executing expression from c:set tag',
            expression: setExpr,
            model: nodeContext.model,
            ex: {
                message: ex.message,
                stack: ex.stack
            }
        };

    } finally {
        log.end();
    }

    return '';
}
setTag.renderChildrenFirst = true;

module.exports = setTag;