var fs = require('fs'),
    path = require('path'),

    htmlparser = require('htmlparser'),
    q = require('./q.allObject'),
    _ = require('underscore'),

    bindingHandler = require('./handlers/binding'),
    htmlHandler = require('./handlers/tags/html'),
    textHandler = require('./handlers/text');

module.exports = function parser(callingPath, jspContent, model, options) {
    var handlers = options && options.parser && options.parser.handlers,
        directiveHandlers = handlers && handlers.directives || {},

        tags = _.extend({
            html: htmlHandler
        }, handlers && handlers.tags || {});

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

    function blankHandler() {}

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
                return directiveHandler(callingPath, node);
            })
            .then(renderContent);
    }

    function findTagHandler(tagName) {
        var deferred,
            parts = tagName.split(':'),
            prefixed = parts.length > 1,
            handlerPath;

        if (tags[tagName]) {
            return tags[tagName];
        }

        if (prefixed) {
            handlerPath = './handlers/tags/' + parts[0] + '/' + parts[1];
        } else {
            handlerPath = './handlers/tags/' + tagName;
        }

        deferred = q.defer();
        tags[tagName] = deferred.promise;

        fs.exists(path.resolve(__dirname, handlerPath + '.js'), function (exists) {
            if (exists) {
                deferred.resolve(require(handlerPath));
            } else {
                deferred.resolve(tags.html);
            }
        });

        return deferred.promise;
    }

    function renderTag(node) {
        return findTagHandler(node.name)
            .then(function (tagHandler) {
                return tagHandler(callingPath, node);
            });
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
                content = textHandler(node);
                break;

        }

        return q.all({
            node: q.when(content || ''),
            children: q.when(node.children ? q.all(_.map(node.children, renderNode)) : '')
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

    return renderContent(jspContent);
};