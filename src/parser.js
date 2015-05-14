var htmlparser = require('htmlparser'),
    q = require('./q.allObject'),

    fileReader = require('./fileReader');

module.exports = function parser() {

    // IMPORTANT - prevents the parser from treating JSP directives as unclosed elements
    htmlparser.DefaultHandler._emptyTags['%@'] = 1;

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

    function cleanJspComments(content) {
        return content.replace(/<%--.*?--%>/g, '');
    }

    function parseContent(content) {
        if (content) {
            return parseHtml(cleanJspComments(content));
        } else {
            return [];
        }
    }

    function parseFile(file) {
        return fileReader.read(file)
            .then(function (rawContent) {
                return parseContent(rawContent);
            });
    }

    return {
        parseContent: parseContent,
        parseFile: parseFile
    };
}();