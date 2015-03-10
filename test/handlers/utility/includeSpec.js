var chai = require('chai'),
    expect = chai.expect;

function fail(message) {
    return function(reason) {
        throw {
            message: message,
            reason: reason
        };
    };
}

describe('include', function () {

    var include;

    beforeEach(function () {
        include = require('../../../src/handlers/utility/include');
    });

    it('should be a function', function () {
        expect(typeof(include)).to.equal('function');
    });

    it('should return a rejected promise if no callingPath is passed', function (done) {

        include()
            .then(fail('should not be resolved'), function (reason) {
                expect(reason.message).to.equal('no callingPath provided');
            })
            .then(done, done);

    });

    it('should return a rejected promise if includePath is passed', function (done) {

        var callingPath = 'callingPath';

        include(callingPath)
            .then(fail('should not be resolved'), function (reason) {
                expect(reason.message).to.equal('no includeFile provided');
            })
            .then(done, done);

    });

    it('should return a rejected promise if the specified file to be included does not exist', function (done) {

        var callingPath = __dirname + '/callingPath',
            includeFile = 'does.not.exist';

        include(callingPath, includeFile)
            .then(fail('should not be resolved'), function (reason) {
                expect(reason.message).to.equal('could not find file at ' + __dirname + '/callingPath/does.not.exist');
            })
            .then(done, done);

    });

    it('should return the content of the file', function (done) {

        var callingPath = __dirname,
            includeFile = 'includeSpec.included.jsp';

        include(callingPath, includeFile)
            .then(function (content) {
                expect(content).to.equal('<div></div>');
            }, fail('should not be rejected'))
            .then(done, done);

    });

});

describe('include.fromAttrs', function () {

    var include;

    beforeEach(function () {
        include = require('../../../src/handlers/utility/include');
    });

    it('should return a rejected promise if no node object is passed', function (done) {

        var attrName = 'file',
            callingPath = 'callingPath';

        include.fromAttrs(attrName)(callingPath)
            .then(fail('should not be resolved'), function (reason) {
                expect(reason.message).to.equal('no node provided');
            })
            .then(done, done);

    });

    it('should return a rejected promise if the attributes object does not include the specified property', function (done) {

        var attrName = 'file',
            node = { attribs: {} },
            callingPath = 'callingPath';

        include.fromAttrs(attrName)(callingPath, node)
            .then(fail('should not be resolved'), function (reason) {
                expect(reason.message).to.equal('invalid node attribute "file"');
            })
            .then(done, done);

    });

    it('should call include() with the value of the specified property', function (done) {

        var attrName = 'file',
            node = { attribs: { file: 'includeSpec.included.jsp' } },
            callingPath = __dirname;

        include.fromAttrs(attrName)(callingPath, node)
            .then(function (content) {
                expect(content).to.equal('<div></div>');
            }, fail('should not be rejected'))
                .then(done, done);

    });

});
