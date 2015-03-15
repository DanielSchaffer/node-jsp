var fs = require('fs'),
    path = require('path'),
    chai = require('chai'),
    expect = chai.expect;

describe('parser', function () {

    var parser, parserOptions;

    beforeEach(function () {
        parser = require('../../src/parser');
        parserOptions = {
            tagNamespaces: {
                '/test/examples/taglib.tld': {
                    handlers: {
                        example: function (context, callingPath, node) {
                            return '';
                        }
                    }
                }
            }
        }
    });

    it('should render the template', function (done) {

        var filePath = path.resolve(__dirname, '../examples/example.jsp'),
            callingPath = path.dirname(filePath),
            content = fs.readFileSync(filePath, { encoding: 'utf8'}),
            model = { foo: 'bar', oy: 'vey' };

        parser(callingPath, content, model, parserOptions)
            .then(function (result) {
                expect(result).to.equal(
                    '<div id="if-content"></div>' +
                    '<div id="when-content"></div>' +
                    '<div id="otherwise-content"></div>' +
                    '<div id="included"></div>' +
                    '<div id="on-example">testContent</div>' +
                    '<div id="binding">bound value 1: wat bound value 2: vey</div>' +
                    '<div id="attr-binding" class="wat"></div>' +
                    '<div id="binding-with-sqliteral">sqliteral!</div>' +
                    '<div id="binding-with-dqliteral">dqliteral!</div>' +
                    '<div id="custom-tag-passthrough"></div>'
                );
            })
            .then(done, done);

    });

});