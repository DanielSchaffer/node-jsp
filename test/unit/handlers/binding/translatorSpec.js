var chai = require('chai'),
    expect = chai.expect,

    lexer = require('../../../../src/handlers/binding/lexer'),
    translator = require('../../../../src/handlers/binding/translator');

describe('translator', function () {

    it('should translate a simple identifier binding', function () {

        var model = { foo: 'bar' },
            expression = 'foo',
            tokens = lexer(expression);

        var result = translator(tokens, model);

        expect(result.length).to.equal(1);
        expect(result[0]).to.equal('"bar"');

    });

    it('should translate a simple identifier binding when there is no corresponding property', function () {

        var model = {},
            expression = 'foo',
            tokens = lexer(expression);

        var result = translator(tokens, model);

        expect(result.length).to.equal(0);

    });

    it('should translate a complex identifier binding', function () {

        var model = { foo: { bar: 'wat' }, oy: { vey: 'okay' } },
            expression = 'foo.bar',
            tokens = lexer(expression);

        var result = translator(tokens, model);

        expect(result.length).to.equal(1);
        expect(result[0]).to.equal('"wat"');

    });

    it('should translate a complex expression', function () {

        var model = { foo: { bar: 1234 }, oy: { vey: 5678 } },
            expression = '!empty foo && foo.bar >= oy.vey ? (oy.vey + 1234.5678) : (foo.bar / .4321)',
            tokens = lexer(expression);

        var result = translator(tokens, model);

        expect(result.length).to.equal(17);
        expect(result[0]).to.equal('!(typeof({"bar":1234})===\'undefined\'||{"bar":1234}===\'\'||{"bar":1234}===null)');
        expect(result[1]).to.equal('&&');
        expect(result[2]).to.equal('1234');
        expect(result[3]).to.equal('>=');
        expect(result[4]).to.equal('5678');
        expect(result[5]).to.equal('?');
        expect(result[6]).to.equal('(');
        expect(result[7]).to.equal('5678');
        expect(result[8]).to.equal('+');
        expect(result[9]).to.equal('1234.5678');
        expect(result[10]).to.equal(')');
        expect(result[11]).to.equal(':');
        expect(result[12]).to.equal('(');
        expect(result[13]).to.equal('1234');
        expect(result[14]).to.equal('/');
        expect(result[15]).to.equal('.4321');
        expect(result[16]).to.equal(')');

    });

});