var fs = require('fs'),
    path = require('path'),
    vm = require('vm'),

    q = require('./q.allObject'),
    _ = require('underscore'),

    parser = require('./parser'),

    tagNamespaces = require('./handlers/tags/namespaces'),
    htmlHandler = require('./handlers/tags/html'),
    textHandler = require('./handlers/text');

module.exports = function renderer(options) {

    var handlers = options && options.handlers,
        directiveHandlers = handlers && handlers.directives || {},

        tags = _.extend({
            html: htmlHandler
        }, handlers && handlers.tags || {}),

        context = {
            tagNamespaces: tagNamespaces(options && options.tagNamespaces || {})
        };

    function nodeContext(sourceFile, node, model) {
        return _.extend({
            sourceFile: sourceFile,
            node: node,
            model: model
        }, context);
    }

    function findDirectiveHandler(name) {
        var deferred;

        if (directiveHandlers[name]) {
            return directiveHandlers[name];
        }

        deferred = q.defer();
        directiveHandlers[name] = deferred.promise;

        fs.exists(path.resolve(__dirname, './handlers/directives/' + name + '.js'), function (exists) {
            if (exists) {
                deferred.resolve(require('./handlers/directives/' + name));
            } else {
                deferred.reject({
                    message: 'no handler for directive "' + name + '"'
                });
            }
        });

        return deferred.promise;
    }

    function renderDirective(nodeContext) {
        var directiveName = _.keys(nodeContext.node.attribs)[0];
        return processHandler(findDirectiveHandler(directiveName), nodeContext);
    }

    function findTagHandler(tagName) {
        if (!tags[tagName]) {
            tags[tagName] = q.when(context.tagNamespaces.getHandler(tagName))
                .then(function (handler) {
                    return handler;
                }, function () {
                    return tags.html;
                });
        }

        return tags[tagName];
    }

    function renderTag(nodeContext) {
        return processHandler(findTagHandler(nodeContext.node.name), nodeContext);
    }

    function processHandler(handlerPromise, nodeContext) {
        return q.when(handlerPromise)
            .then(function (handler) {
                if (handler.renderChildrenFirst) {
                    return renderChildren(nodeContext)
                        .then(function () {
                            return handler;
                        });
                }
                return handler;
            })
            .then(function (handler) {
                return handler(nodeContext);
            });
    }

    function renderChildren(nodeContext) {
        if (nodeContext.node.children && nodeContext.node.children.length) {
            return renderNodes(nodeContext.sourceFile, nodeContext.node.children, nodeContext.model)
                .then(function (result) {
                    nodeContext.node.childContent = result;
                    nodeContext.node.children = null;
                    return result;
                });
        }
        return q.when(nodeContext.node.childContent || null);
    }

    function renderNode(nodeContext) {

        var content;

        switch(nodeContext.node.type) {

            case 'tag':
                if (nodeContext.node.name === '%@') {
                    content = renderDirective(nodeContext);
                } else {
                    content = renderTag(nodeContext);
                }
                break;

            case 'text':
                content = textHandler(nodeContext);
                break;

        }

        return q.when(content || '')
            .then(function (renderedContent) {
                return q.all({
                    node: renderedContent,
                    includedChildren: q.when(renderedContent && renderedContent.node && renderChildren(renderedContent) || ''),
                    children: renderChildren(nodeContext)
                });
            })
            .then(function (renderedContent) {

                var result = '';

                if (!renderedContent.node && !renderedContent.children && !renderedContent.includedChildren) {
                    return result;
                }

                if (_.isString(renderedContent.node)) {
                    result += renderedContent.node;
                }

                if (renderedContent.node && renderedContent.node.begin) {
                    result += renderedContent.node.begin;
                }

                if (renderedContent.includedChildren) {
                    result += renderedContent.includedChildren;
                }

                if (renderedContent.children) {
                    result += renderedContent.children;
                }

                if (renderedContent.node && renderedContent.node.end) {
                    result += renderedContent.node.end;
                }

                return result;

            });
    }

    function renderNodes(sourceFile, nodes, model) {
        model = setupModel(model);
        return q.all(_.reduce(nodes, function (state, node) {
            var prev = state.pop();

            state.push(prev.then(function (content) {
                return renderNode(nodeContext(sourceFile, node, model))
                    .then(function (nodeContent) {
                        return content + nodeContent;
                    });
            }));

            return state;
        }, [q.when('')]))
            .then(function (renderedContent) {
                return renderedContent.join('');
            });
    }

    function renderFile(file, model) {
        return parser.parseFile(file)
            .then(function (dom) {
                return renderNodes(file, dom, model);
            });
    }

    function setupModel(model) {
        if (!model) {
            model = {};
        }
        vm.createContext(model);
        return model;
    }

    return {
        renderNodes: renderNodes,
        renderFile: renderFile
    };
};