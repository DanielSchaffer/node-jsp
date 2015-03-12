var fs = require('fs'),
    path = require('path'),
    chai = require('chai'),
    expect = chai.expect;

describe('parser', function () {

    var parser;

    beforeEach(function () {
        parser = require('../../src/parser');
    });

    it('should render the template', function (done) {

        var filePath = path.resolve(__dirname, '../examples/example.jsp'),
            callingPath = path.dirname(filePath),
            content = fs.readFileSync(filePath, { encoding: 'utf8'}),
            model = { foo: 'bar', oy: 'vey' };

        parser(callingPath, content, model)
            .then(function (result) {
                expect(result).to.equal('<div id="if-content"></div><div id="included"></div><div id="on-example">testContent</div><div id="binding">bound value 1: wat bound value 2: vey</div>');
            })
            .then(done, done);

    });

});