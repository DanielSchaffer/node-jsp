var binding = require('../../binding');

function ifTag(context, callingPath, node, model) {

    var ifExpr;

    if (!node.attribs.test) {
        throw {
            message: 'missing required attribute "test"',
            node: node
        };
    }

    if (!node.childContent) {
        throw {
            message: 'missing required content - no child content',
            node: node
        };
    }

    ifExpr = binding(node.attribs.test, model);

    try {
        // FIXME: why is it coming out 'null' (a string) instead of just the value null?
        if (ifExpr && ifExpr !== 'null') {
            return '';
        }
    } catch(ex) {
        throw {
            message: 'error executing expression from c:if tag',
            expression: ifExpr,
            model: model,
            ex: ex.message
        };
    }

    node.childContent = null;
    return '';
}
ifTag.renderChildrenFirst = true;

module.exports = ifTag;