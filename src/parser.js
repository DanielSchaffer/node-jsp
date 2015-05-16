var htmlparser = require('htmlparser'),
    when = require('when'),

    fileReader = require('./fileReader');

module.exports = function parser() {

    // IMPORTANT - prevents the parser from treating JSP directives as unclosed elements
    htmlparser.DefaultHandler._emptyTags['%@'] = 1;

    function parseHtml(content) {
        var deferred = when.defer(),
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

    function cleanJspComments(content) {
        return content.replace(/<%--[\s\S]*?--%>/g, '');
    }

    function parseContent(content) {
        if (content) {
            return parseHtml(cleanJspComments(content));
        } else {
            return [];
        }
    }

    function parseFile(file) {
        var read = fileReader.read(file);

        return read.then(function (rawContent) {
            if (!read.parsed) {
                read.parsed = parseContent(rawContent);
            }
            return read.parsed;
        });
    }

    return {
        parseContent: parseContent,
        parseFile: parseFile
    };
}();