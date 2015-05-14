var _ = require('underscore');

module.exports = require('../../utility/include').fromAttrs('page', true, function (childNode) {
    if (childNode.name !== 'jsp:param') {
       throw {
           message: 'unexpected tag "' + childNode.name + '"',
           node: childNode
       };
    }

    return [childNode.attribs.name, childNode.childContent];
});