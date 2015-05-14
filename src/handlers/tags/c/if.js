var binding = require('../../binding');

function ifTag(nodeContext) {

    var ifExpr;

    if (!nodeContext.node.attribs.test) {
        throw {
            message: 'missing required attribute "test"',
            nodeContext: nodeContext
        };
    }

    if (!nodeContext.node.childContent) {
        throw {
            message: 'missing required content - no child content',
            nodeContext: nodeContext
        };
    }

    ifExpr = binding(nodeContext.node.attribs.test, nodeContext.model);

    try {
        // FIXME: why is it coming out 'null' (a string) instead of just the value null?
        if (ifExpr && ifExpr !== 'null') {
            return '';
        }
    } catch(ex) {
        throw {
            message: 'error executing expression from c:if tag',
            expression: ifExpr,
            model: nodeContext.model,
            ex: ex.message
        };
    }

    nodeContext.node.childContent = null;
    return '';
}
ifTag.renderChildrenFirst = true;

module.exports = ifTag;