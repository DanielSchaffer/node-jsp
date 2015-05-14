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

    it('should execute "!empty foo"', function () {


        var expression = '!empty foo',
            tokens = lexer(expression),
            translatedTokens = translator(tokens, model);

        var result = executor(translatedTokens, model);

        expect(result).to.equal(true);
    });

    it('should execute "!empty foo && foo.bar"', function () {


        var expression = '!empty foo && foo.bar',
            tokens = lexer(expression),
            translatedTokens = translator(tokens, model);

        var result = executor(translatedTokens, model);

        expect(result).to.equal(1234);
    });

    it('should execute "!empty foo && foo.bar >= oy.vey"', function () {


        var expression = '!empty foo && foo.bar >= oy.vey',
            tokens = lexer(expression),
            translatedTokens = translator(tokens, model);

        var result = executor(translatedTokens, model);

        expect(result).to.equal(false);
    });

    it('should execute "!empty foo && foo.bar >= oy.vey + 1"', function () {


        var expression = '!empty foo && foo.bar >= oy.vey + 1',
            tokens = lexer(expression),
            translatedTokens = translator(tokens, model);

        var result = executor(translatedTokens, model);

        expect(result).to.equal(false);
    });


    it('should execute "!empty foo && foo.bar >= (oy.vey + 1)"', function () {


        var expression = '!empty foo && foo.bar >= (oy.vey + 1)',
            tokens = lexer(expression),
            translatedTokens = translator(tokens, model);

        var result = executor(translatedTokens, model);

        expect(result).to.equal(false);
    });

    it('should execute "!empty foo && foo.bar >= oy.vey ? (oy.vey + 1234.5678) : (foo.bar / .4321)"', function () {

        var expression = '!empty foo && foo.bar >= oy.vey ? (oy.vey + 1234.5678) : (foo.bar / .4321)',
            tokens = lexer(expression),
            translatedTokens = translator(tokens, model);

        var result = executor(translatedTokens, model);

        expect(result).to.equal(1234 / 0.4321);

    });

});