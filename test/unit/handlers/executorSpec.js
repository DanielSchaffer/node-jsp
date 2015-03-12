var chai = require('chai'),
    expect = chai.expect,

    lexer = require('../../../src/handlers/binding/lexer'),
    translator = require('../../../src/handlers/binding/translator'),
    executor = require('../../../src/handlers/executor');

describe('executor', function () {

    var vm, model;

    beforeEach(function () {
        vm = require('vm');
        model = { foo: { bar: 1234 }, oy: { vey: 5678 } };
        vm.createContext(model);
    });

    it('should execute', function () {

        var expression = '!empty foo && foo.bar >= oy.vey ? (oy.vey + 1234.5678) : (foo.bar / .4321)',
            tokens = lexer(expression),
            translatedTokens = translator(tokens, model);

        var result = executor(translatedTokens, model);

        expect(result).to.equal(1234 / 0.4321);

    });

});