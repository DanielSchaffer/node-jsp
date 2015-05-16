var fs = require('fs'),
    path = require('path'),
    vm = require('vm'),

    when = require('when'),
    keys = require('when/keys'),
    _ = require('underscore'),

    parser = require('./parser'),
    binding = require('./handlers/binding'),

    tagNamespaces = require('./handlers/tags/namespaces'),
    htmlDefaultTagHandler = require('./handlers/tags/html/htmlTag'),
    htmlDirectiveHandler = require('./handlers/tags/html/htmlDirective'),
    textHandler = require('./handlers/text');

module.exports = function renderer(options) {

    var handlers = options && options.handlers,
        directiveHandlers = handlers && handlers.directives || {},

        tags = _.extend({
            html: {
                tag: htmlDefaultTagHandler,
                script: htmlDefaultTagHandler,
                comment: htmlDirectiveHandler,
                directive: htmlDirectiveHandler,
                style: htmlDefaultTagHandler
            }
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

        deferred = when.defer();
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

    function renderDirective(nodeContext, profiler) {
        var log = profiler.start('renderer', 'renderDirective');
        var directiveName = _.keys(nodeContext.node.attribs)[0];
        return processHandler(findDirectiveHandler(directiveName), nodeContext, log.profiler)
            .then(log.end);
    }

    function findTagHandler(node) {

        if (node.type === 'tag') {
            if (node.name === 'html') {
                return tags.html.tag;
            }

            if (!tags[node.name]) {
                tags[node.name] = when(context.tagNamespaces.getHandler(node.name))
                    .then(function (handler) {
                        return handler;
                    }, function () {
                        return tags.html.tag;
                    });
            }

            return tags[node.name];
        }

        return tags.html[node.type];
    }

    function renderTag(nodeContext, profiler) {
        var log = profiler.start('renderer', 'renderTag');
        return processHandler(findTagHandler(nodeContext.node), nodeContext, log.profiler)
            .then(log.end);
    }

    function processHandler(handlerPromise, nodeContext, profiler) {
        var log = profiler.start('renderer', 'processHandler');
        return when(handlerPromise)
            .then(function (handler) {
                if (handler.renderChildrenFirst) {
                    return renderChildren(nodeContext, handler.mapChildren, log.profiler)
                        .then(function () {
                            return handler;
                        });
                }
                return handler;
            })
            .then(function (handler) {
                return handler(nodeContext, log.profiler);
            })
            .then(log.end);
    }

    function renderChildren(nodeContext, mapChildren, profiler) {
        var log = profiler.start('renderer', 'renderChildren');
        if (nodeContext.node.children && nodeContext.node.children.length) {
            return renderNodes(nodeContext.sourceFile, nodeContext.node.children, nodeContext.model, mapChildren, log.profiler)
                .then(function (result) {
                    nodeContext.node.childContent = result;
                    nodeContext.node.children = null;
                    return result;
                })
                .then(log.end.withModifier('with children'));
        }
        return when(nodeContext.node.childContent || null)
            .then(log.end.withModifier('pre-rendered or no children'));
    }

    function renderNode(nodeContext, profiler) {
        var logKey = 'renderNode: ' + nodeContext.node.type,
            log;

        if (nodeContext.node.type === 'tag') {
            logKey += '[' + nodeContext.node.name + ']';
        }
        log = profiler.start('renderer', logKey);

        var content;

        switch(nodeContext.node.type) {

            case 'text':
                content = textHandler(nodeContext, log.profiler);
                break;

            /*case 'tag':
             case 'script':
             case 'comment':
             case 'directive':*/
            default:
                if (nodeContext.node.name === '%@') {
                    content = renderDirective(nodeContext, log.profiler);
                } else {
                    content = renderTag(nodeContext, log.profiler);
                }
                break;
        }

        return when(content || '')
            .then(log.status('content resolved'))
            .then(function (renderedContent) {
                return keys.all({
                    node: renderedContent,
                    includedChildren: when(renderedContent && renderedContent.node && renderChildren(renderedContent, null, log.profiler) || ''),
                    children: renderChildren(nodeContext, null, log.profiler)
                });
            })
            .then(function (renderedContent) {

                var result = '';

                if (!renderedContent.node && !renderedContent.children && !renderedContent.includedChildren) {
                    return '';
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

            })
            .then(log.end);
    }

    function renderNodes(sourceFile, nodes, model, mapper, profiler) {
        var log = profiler.start('renderer', 'renderNodes');

        model = setupModel(model);
        return when.all(_.reduce(nodes, function (state, node) {
            var prev = state.pop();

            state.push(prev.then(function (content) {
                return renderNode(nodeContext(sourceFile, node, model), log.profiler)
                    .then(function (nodeContent) {
                        return content + nodeContent;
                    });
            }));

            return state;
        }, [when('')]))
            .then(function (renderedContent) {
                if (mapper) {
                    return _.chain(nodes)
                        .map(function (node) {
                            return mapper(node);
                        })
                        .object()
                        .value();
                }

                return renderedContent.join('');
            })
            .then(log.end);
    }

    function renderFile(file, model, profiler) {
        var log = profiler.start('renderer', 'renderFile');
        return parser.parseFile(file)
            .then(function (dom) {
                return renderNodes(file, dom, model, null, log.profiler);
            })
            .then(log.end);
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