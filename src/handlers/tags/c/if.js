var binding = require('../../binding');

function ifTag(nodeContext, profiler) {

    var log = profiler.start('ifTag', 'ifTag');

    var ifExpr;

    if (!nodeContext.node.attribs.test) {
        throw {
            message: 'missing required attribute "test"',
            nodeContext: nodeContext
        };
    }

    ifExpr = binding(nodeContext.sourceFile, nodeContext.node.attribs.test, nodeContext.model, log.profiler);

    // FIXME: why is it coming out 'null' (a string) instead of just the value null?
    if (ifExpr && ifExpr !== 'null') {
        return '';
    }

    nodeContext.node.childContent = null;
    log.end();
    return '';
}
ifTag.renderChildrenFirst = true;

module.exports = ifTag;