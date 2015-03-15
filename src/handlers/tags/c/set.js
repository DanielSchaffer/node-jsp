var vm = require('vm'),

    binding = require('../../binding');

function setTag(context, callingPath, node, model) {

    var value, setExpr;

    if (!node.attribs.var) {
        throw {
            message: 'missing required attribute "var"',
            node: node
        };
    }

    if (!node.attribs.value && !node.childContent) {
        throw {
            message: 'missing required content - no child content or value attribute',
            node: node
        };
    }

    if (node.attribs.value) {
        value = binding(node.attribs.value);
    } else {
        value = node.childContent;
    }

    if (value && isNaN(value) && (value[0] !== '{' || value[value.length - 1] !== '}')) {
        value = '"' + value + '"';
    }

    setExpr = node.attribs.var + '=' + value;

    try {
        vm.runInContext(setExpr, model);
    } catch(ex) {
        throw {
            message: 'error executing expression from c:set tag',
            expression: setExpr,
            model: model,
            ex: ex
        };
    }

    return '';
}
setTag.renderChildrenFirst = true;

module.exports = setTag;