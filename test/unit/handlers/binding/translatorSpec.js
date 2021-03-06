var chai = require('chai'),
    expect = chai.expect,

    translator = require('../../../../src/handlers/binding/translator');

describe('translator', function () {

    it('should translate a simple identifier binding', function () {

        var expression = 'foo',
            result = translator.translate(expression);

        expect(result.length).to.equal(1);
        expect(result[0]).to.equal('foo');

    });

    it('should translate a complex identifier binding', function () {

        var expression = 'foo.bar',
            result = translator.translate(expression);

        expect(result.length).to.equal(1);
        expect(result[0]).to.equal('foo.bar');

    });

    //(featureGates['ThirdPartyOfferContinuousHeaderOffers'] || false)
    it('should translate an expression using hash accessors', function () {

        var expression = 'foo["bar"]',
            result = translator.translate(expression);

        expect(result.length).to.equal(2);
        expect(result[0]).to.equal('foo');
        expect(result[1]).to.equal('["bar"]');

    });

    //(featureGates['ThirdPartyOfferContinuousHeaderOffers'] || false)
    it('should translate an expression using hash accessors', function () {

        var expression = 'foo["bar"] || other',
            result = translator.translate(expression);

        expect(result.length).to.equal(4);
        expect(result[0]).to.equal('foo');
        expect(result[1]).to.equal('["bar"]');
        expect(result[2]).to.equal('||');
        expect(result[3]).to.equal('other');

    });

    it('should translate "!empty" correctly', function () {

        var expression = '!empty foo',
            result = translator.translate(expression);

        expect(result.length).to.equal(1);
        expect(result[0]).to.equal('!(typeof(foo)===\'undefined\'||foo===\'\'||foo===null)');
    });

    it('should allow identifiers to be negated', function () {

        var expression = 'empty foo || !foo.bar',
            result = translator.translate(expression);

        expect(result.length).to.equal(3);
        expect(result[0]).to.equal('(typeof(foo)===\'undefined\'||foo===\'\'||foo===null)');
        expect(result[1]).to.equal('||');
        expect(result[2]).to.equal('!foo.bar');

    });

    /*

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

    });*/

});