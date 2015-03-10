var fs = require('fs'),
    path = require('path'),
    chai = require('chai'),
    expect = chai.expect;

function fail(message) {
    return function(reason) {
        throw {
            message: message,
            reason: reason
        };
    };
}

describe('parser', function () {

    var parser;

    beforeEach(function () {
        parser = require('../src/parser');
    });

    it('should blah blah blah', function (done) {

        var filePath = path.resolve(__dirname, './examples/example.jsp'),
            callingPath = path.dirname(filePath),
            content = fs.readFileSync(filePath, { encoding: 'utf8'}),
            model = { foo: 'bar' };

        parser(callingPath, content, model)
            .then(function (result) {
                console.log('result', result);

                expect(result).to.equal('<div id="included"></div><div id="on-example">testContent</div>');
            })
            .then(done, done);

    });

});