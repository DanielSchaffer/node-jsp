var path = require('path'),

    _ = require('underscore'),
    when = require('when'),

    parser = require('../../parser');

function include(nodeContext, includeFile, profiler) {

    var resolvedPath;

    var log = profiler.start('include', 'include');

    if (!includeFile) {
        return when.reject({ message: 'no includeFile provided' });
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
            return when.reject(_.extend(err, {
                nodeContext: nodeContext,
                includeFile: includeFile
            }));
        })
        .then(log.end);
}

//include.renderChildrenFirst = true;

include.fromAttrs = function includeFromAttrs(attrName, renderChildrenFirst, mapChildren) {

    function includedFromAttrs(nodeContext, profiler) {

        if (!nodeContext.node) {
            return when.reject({ message: 'no node provided' });
        }

        if (!nodeContext.node.attribs[attrName]) {
            return when.reject({
                message: 'invalid node attribute "' + attrName + '"',
                nodeContext: nodeContext
            });
        }

        return include(nodeContext, nodeContext.node.attribs[attrName], profiler);
    }

    includedFromAttrs.renderChildrenFirst = renderChildrenFirst;
    includedFromAttrs.mapChildren = mapChildren;
    return includedFromAttrs;
};

module.exports = include;