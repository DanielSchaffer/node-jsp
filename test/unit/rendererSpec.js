var path = require('path'),
    chai = require('chai'),
    _ = require('underscore'),
    expect = chai.expect;

describe('renderer', function () {

    var renderer, rendererOptions, parser, model,
        tagLibs = {
            c: 'http://java.sun.com/jsp/jstl/core',
            jsp: 'http://java.sun.com/jsp'
        };

    beforeEach(function () {
        rendererOptions = {
            tagNamespaces: {
                '/test/examples/taglib.tld': {
                    handlers: {
                        example: function (nodeContext) {
                            return '';
                        }
                    }
                }
            }
        };
        renderer = require('../../src/renderer')(rendererOptions);
        parser = require('../../src/parser');
        model = {};
    });

    function tagLib(namespaces) {
        return _.map(namespaces, function (namespace) {
            return '<%@ taglib uri="' + tagLibs[namespace] + '" prefix="' + namespace + '"%>';
        })
            .join('');
    }

    function renderContent(content) {
        var namespaces = Array.prototype.slice.call(arguments, 1);
        return parser.parseContent(tagLib(namespaces) + content)
            .then(function (dom) {
                return renderer.renderNodes('test', dom, model);
            });
    }

    it('should render a single element', function (done) {

        renderContent('<div></div>')
            .then(function (result) {
                expect(result).to.equal('<div></div>');
            })
            .then(done, done);
    });

    it('should render a simple include directive', function (done) {
        renderContent('<%@ include file="test/examples/simpleInclude.jsp"%>')
            .then(function (result) {
                expect(result).to.equal('<div></div>');
            })
            .then(done, done);
    });

    it('should render a simple include tag', function (done) {
        renderContent('<jsp:include page="test/examples/simpleInclude.jsp" />')
            .then(function (result) {
                expect(result).to.equal('<div></div>');
            })
            .then(done, done);
    });

    it('should render a page directive', function (done) {
        renderContent('<%@ page language="java" pageEncoding="UTF-8" %>')
            .then(function (result) {
                expect(result).to.equal('');
            })
            .then(done, done);
    });

    it('should set a value using c:set', function (done) {
        renderContent('<c:set var="foo" value="wat" />', 'c')
            .then(function (result) {
                expect(result).to.equal('');
                expect(model.foo).to.equal('wat');
            })
            .then(done, done);
    });

    it('should render an empty string when binding to a null or undefined property', function (done) {
        renderContent('${foo}')
            .then(function (result) {
                expect(result).to.equal('');
            })
            .then(done, done);
    });

    it('should render content using c:set', function (done) {
        renderContent('<c:set var="foo" value="wat" />${foo}', 'c')
            .then(function (result) {
                expect(result).to.equal('wat');
            })
            .then(done, done);
    });

    it('should make c:set set the var to empty if the conditional inside evaluates to empty', function (done) {
        var content =
            '<c:set var="qs">\n' +
            '    <c:if test="${!empty foo}">?foo=${foo}</c:if>\n' +
            '</c:set>';

        renderContent(content, 'c')
            .then(function (result) {
                expect(result).to.equal('');
                expect(model.qs).to.equal('');
            })
            .then(done, done);
    });

    it('should render a conditional tag inside a c:set', function (done) {
        var content =
            '<c:set var="qs">\n' +
            '    <c:if test="${!empty foo}">?foo=${foo}</c:if>\n' +
            '</c:set>';

        model.foo = 'bizzle';

        renderContent(content, 'c')
            .then(function (result) {
                expect(result).to.equal('');
                expect(model.qs).to.equal('?foo=bizzle');
            })
            .then(done, done);
    });

    it('should render tags inside c:when', function (done) {
        var content =
            '<c:choose>\n' +
            '    <c:when test="${foo}"><c:if test="${foo.bar}">yes</c:if></c:when>\n' +
            '    <c:otherwise>no</c:otherwise>\n' +
            '</c:choose>';

        model.foo = { bar: 'blah' };

        renderContent(content, 'c')
            .then(function (result) {
                expect(result).to.equal('yes');
            })
            .then(done, done);
    });

    it('should render tags inside c:otherwise', function (done) {
        var content =
            '<c:choose>\n' +
            '    <c:when test="${foo}"><c:if test="${foo.bar}">yes</c:if></c:when>\n' +
            '    <c:otherwise>no</c:otherwise>\n' +
            '</c:choose>';

        renderContent(content, 'c')
            .then(function (result) {
                expect(result).to.equal('no');
            })
            .then(done, done);
    });

    it('should render script tags', function (done) {
        var content =
            '<c:choose>\n' +
            '    <c:when test="${foo}"><c:if test="${foo.bar}">yes</c:if></c:when>\n' +
            '    <c:otherwise><script>scriptyscript</script></c:otherwise>\n' +
            '</c:choose>';

        renderContent(content, 'c')
            .then(function (result) {
                expect(result).to.equal('<script>scriptyscript</script>');
            })
            .then(done, done);
    });

    it('should render HTML directives', function (done) {

        renderContent('<!DOCTYPE html>')
            .then(function (result) {
                expect(result).to.equal('<!DOCTYPE html>');
            })
            .then(done, done);
    });

    it('should render parameterized includes that put content directly in the param body', function (done) {

        renderContent(
            '<jsp:include page="test/examples/parameterizedInclude.jsp">\n' +
            '    <jsp:param name="content">\n' +
            '        <div id="parameterized-content"></div>\n' +
            '    </jsp:param>\n' +
            '</jsp:include>', 'jsp')
            .then(function (result) {
                expect(result).to.equal('<div id="include-content"><div id="parameterized-content"></div></div>');
            })
            .then(done, done);
    });

    it('should render parameterized includes that put content in the param value attribute', function (done) {

        renderContent(
            '<c:set var="content"><div id="parameterized-content"></div></c:set>\n' +
            '<jsp:include page="test/examples/parameterizedInclude.jsp">\n' +
            '    <jsp:param name="content" value="${content}" />\n' +
            '</jsp:include>', 'c', 'jsp')
            .then(function (result) {
                expect(result).to.equal('<div id="include-content"><div id="parameterized-content"></div></div>');
            })
            .then(done, done);

    });

    it('should render HTML comments', function (done) {
        renderContent(
            '<!-- foo\n' +
            'bar\n' +
            '-->')
            .then(function (result) {
                expect(result).to.equal('<!-- foo\nbar\n-->');
            })
            .then(done, done);
    });

    it('should render IE conditional comments', function (done) {
        renderContent(
            '<!--[if IE 8]>\n' +
            '<link rel="stylesheet" type="text/css" href="foo" />\n' +
            '<![endif]-->')
            .then(function (result) {
                expect(result).to.equal('<!--[if IE 8]>\n<link rel="stylesheet" type="text/css" href="foo" />\n<![endif]-->');
            })
            .then(done, done);
    });

    it('should render the example template', function (done) {

        var filePath = path.resolve(__dirname, '../examples/example.jsp'),
            model = { foo: 'bar', oy: 'vey' };

        renderer.renderFile(filePath, model)
            .then(function (result) {
                expect(result.replace(/\n\s*/g)).to.equal(
                    '<div id="if-content"></div>' +
                    '<div id="when-content"></div>' +
                    '<div id="otherwise-content"></div>' +
                    '<div id="included"></div>' +
                    '<div id="on-example">testContent</div>' +
                    '<div id="binding">bound value 1: wat bound value 2: vey</div>' +
                    '<div id="attr-binding" class="wat"></div>' +
                    '<div id="binding-with-sqliteral">sqliteral!</div>' +
                    '<div id="binding-with-dqliteral">dqliteral!</div>' +
                    '<div id="custom-tag-passthrough"></div>' +
                    '<div id="nested-setting"><span>top:<div id="nested-setting-top"><span>nested:<div id="nested-set-content">foo</div></span></div></span></div>'
                );
            })
            .then(done, done);

    });

});