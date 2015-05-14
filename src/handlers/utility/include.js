var fs = require('fs'),
    path = require('path'),

    _ = require('underscore'),
    q = require('q'),

    parser = require('../../parser');

function include(nodeContext, includeFile) {

    var resolvedPath;

    if (!includeFile) {
        return q.reject({ message: 'no includeFile provided' });
    }

    resolvedPath = path.resolve(path.dirname(nodeContext.sourceFile), includeFile);

    return parser.parseFile(resolvedPath)
        .then(function (rawContent) {
            var param = nodeContext.node.childContent;
            nodeContext.node.childContent = null;
            return _.extend({}, nodeContext, {
                sourceFile: resolvedPath,
                node: {
                    children: rawContent
                },
                model: _.extend({}, nodeContext.model, {
                    param: param
                })
            });
        }, function (err) {
            return q.reject(_.extend(err, {
                nodeContext: nodeContext,
                includeFile: includeFile
            }));
        });
}

//include.renderChildrenFirst = true;

include.fromAttrs = function includeFromAttrs(attrName, renderChildrenFirst, mapChildren) {

    function includedFromAttrs(nodeContext) {

        if (!nodeContext.node) {
            return q.reject({ message: 'no node provided' });
        }

        if (!nodeContext.node.attribs[attrName]) {
            return q.reject({
                message: 'invalid node attribute "' + attrName + '"',
                nodeContext: nodeContext
            });
        }

        return include(nodeContext, nodeContext.node.attribs[attrName]);
    }

    includedFromAttrs.renderChildrenFirst = renderChildrenFirst;
    includedFromAttrs.mapChildren = mapChildren;
    return includedFromAttrs;
};

module.exports = include;