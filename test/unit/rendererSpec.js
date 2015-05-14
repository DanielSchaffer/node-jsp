var path = require('path'),
    chai = require('chai'),
    _ = require('underscore'),
    expect = chai.expect;

describe('renderer', function () {

    var renderer, rendererOptions, parser, model,
        tagLibs = {
            c: 'http://java.sun.com/jsp/jstl/core'
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