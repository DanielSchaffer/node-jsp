var fs = require('fs'),
    path = require('path'),
    vm = require('vm'),

    htmlparser = require('htmlparser'),
    q = require('./q.allObject'),
    _ = require('underscore'),

    tagNamespaces = require('./handlers/tags/namespaces'),
    htmlHandler = require('./handlers/tags/html'),
    textHandler = require('./handlers/text');

module.exports = function parser(callingPath, jspContent, model, options) {
    var handlers = options && options.parser && options.parser.handlers,
        directiveHandlers = handlers && handlers.directives || {},

        tags = _.extend({
            html: htmlHandler
        }, handlers && handlers.tags || {}),

        context = {
            tagNamespaces: tagNamespaces(options && options.tagNamespaces || {})
        };

    function parseHtml(content) {
        var deferred = q.defer(),
            handler = new htmlparser.DefaultHandler(function (err, dom) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(dom);
                }
            }, { verbose: false, ignoreWhitespace: true }),
            parser = new htmlparser.Parser(handler);

        parser.parseComplete(content);

        return deferred.promise;
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
                console.warn('no handler for directive', name);
                deferred.reject({
                    message: 'no handler for directive "' + name + '"'
                });

            }
        });

        return deferred.promise;
    }

    function renderDirective(node) {
        var directiveName = _.keys(node.attribs)[0];

        return findDirectiveHandler(directiveName)
            .then(function (directiveHandler) {
                return directiveHandler(context, callingPath, node, model);
            })
            .then(renderContent);
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

    function renderTag(node) {
        return findTagHandler(node.name)
            .then(function (tagHandler) {
                if (tagHandler.renderChildrenFirst) {
                    return renderChildren(node)
                        .then(function (childContent) {
                            node.childContent = childContent && childContent.join('') || '';
                            node.children = null;
                            return tagHandler;
                        });
                }
                return tagHandler;
            })
            .then(function (tagHandler) {
                return tagHandler(context, callingPath, node, model);
            });
    }

    function renderChildren(node) {
        if (node.children && node.children.length) {
            return renderNode(node.children.shift())
                .then(function (renderedChild) {
                    if (!node.childContent) {
                        node.childContent = '';
                    }
                    node.childContent += renderedChild;
                    return renderChildren(node);
                });
        }
        node.children = null;

        return q.when(node.childContent ? [node.childContent] : null);
    }

    function renderNode(node) {

        var content;

        switch(node.type) {

            case 'tag':
                if (node.name === '%@') {
                    content = renderDirective(node);
                } else {
                    content = renderTag(node);
                }
                break;

            case 'text':
                content = textHandler(context, callingPath, node, model);
                break;

        }

        return q.when(content || '')
            .then(function (renderedContent) {
                return q.all({
                    node: renderedContent,
                    children: renderChildren(node)
                });
            })
            .then(function (renderedContent) {

                var result = '';

                if (_.isString(renderedContent.node)) {
                    result += renderedContent.node;
                }

                if (renderedContent.node.begin) {
                    result += renderedContent.node.begin;
                }

                if (renderedContent.children) {
                    result += renderedContent.children.join('');
                }

                if (renderedContent.node.end) {
                    result += renderedContent.node.end;
                }

                // console.log('\npiecing together node', node.name || node.type, node);
                // console.log(renderedContent);
                // console.log('result:', result);

                return result;

            });
    }

    function renderContent(content) {
        if (content) {
            //console.log('\nrendering content', content);
            return parseHtml(content)
                .then(function handleHtml(dom) {
                    return q.all(_.map(dom, renderNode));
                })
                .then(function (result) {
                    return result.join('');
                });
        } else {
            return '';
        }
    }

    if (!model) {
        model = {};
    }
    vm.createContext(model);

    return renderContent(jspContent);
};