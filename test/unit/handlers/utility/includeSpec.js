var chai = require('chai'),
    expect = chai.expect;

function fail(message) {
    return function(reason) {
        throw {
            message: message,
            reason: reason,
            ex: {
                message: reason.message,
                stack: reason.stack
            }
        };
    };
}

describe('include', function () {

    var include;

    beforeEach(function () {
        include = require('../../../../src/handlers/utility/include');
    });

    it('should be a function', function () {
        expect(typeof(include)).to.equal('function');
    });

    it('should return a rejected promise if no includeFile is passed', function (done) {

        var sourceFile = 'sourceFile/sourceFile.jsp';

        include({ sourceFile: sourceFile })
            .then(fail('should not be resolved'), function (reason) {
                expect(reason.message).to.equal('no includeFile provided');
            })
            .then(done, done);

    });

    it('should return a rejected promise if the specified file to be included does not exist', function (done) {

        var sourceFile = __dirname + '/sourceFile/someFile.jsp',
            includeFile = 'does.not.exist';

        include({ sourceFile: sourceFile }, includeFile)
            .then(fail('should not be resolved'), function (reason) {
                expect(reason.message).to.equal('could not find file at ' + __dirname + '/sourceFile/does.not.exist');
            })
            .then(done, done);

    });

    it('should return an object with the path and content of the file', function (done) {

        var sourceFile = __dirname + '/exampleSource.jsp',
            includeFile = __dirname + '/includeSpec.included.jsp';

        include({ sourceFile: sourceFile }, includeFile)
            .then(function (result) {
                expect(result.node.children).to.deep.have.members([{ type: 'tag', name: 'div' }]);
                expect(result.sourceFile).to.equal(includeFile);
            }, fail('should not be rejected'))
            .then(done, done);

    });

});

describe('include.fromAttrs', function () {

    var include;

    beforeEach(function () {
        include = require('../../../../src/handlers/utility/include');
    });

    it('should return a rejected promise if no node object is passed', function (done) {

        var attrName = 'file',
            sourceFile = 'sourcePath/sourceFile.jsp';

        include.fromAttrs(attrName)({ sourceFile: sourceFile })
            .then(fail('should not be resolved'), function (reason) {
                expect(reason.message).to.equal('no node provided');
            })
            .then(done, done);

    });

    it('should return a rejected promise if the attributes object does not include the specified property', function (done) {

        var attrName = 'file',
            node = { attribs: {} },
            sourceFile = 'sourcePath/sourceFile';

        include.fromAttrs(attrName)({ sourceFile: sourceFile, node: node })
            .then(fail('should not be resolved'), function (reason) {
                expect(reason.message).to.equal('invalid node attribute "file"');
            })
            .then(done, done);

    });

    it('should call include() with the value of the specified property', function (done) {

        var attrName = 'file',
            node = { attribs: { file: 'includeSpec.included.jsp' } },
            sourceFile = __dirname + '/example.jsp';

        include.fromAttrs(attrName)({ sourceFile: sourceFile, node: node })
            .then(function (result) {
                expect(result.node.children).to.deep.have.members([{ type: 'tag', name: 'div' }]);
            }, fail('should not be rejected'))
                .then(done, done);

    });

});
