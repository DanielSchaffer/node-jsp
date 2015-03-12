var chai = require('chai'),
    expect = chai.expect,

    lexer = require('../../../../src/handlers/binding/lexer');

describe('lexer', function () {

    describe('identifiers', function () {

        it('should lex a simple identifier expression', function () {

            var result = lexer('foo');

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
            expect(result).to.have.property(0).that.deep.equals({ name: lexer.tokens.ident, value: 'foo' });

        });

        it('should lex a simple identifier expression with numbers', function () {

            var result = lexer('foo12');

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
            expect(result).to.have.property(0).that.deep.equals({ name: lexer.tokens.ident, value: 'foo12' });

        });

        it('should lex a simple identifier expression with numbers followed by numbers', function () {

            var result = lexer('foo12boo');

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
            expect(result).to.have.property(0).that.deep.equals({ name: lexer.tokens.ident, value: 'foo12boo' });

        });


        it('should lex an identifier expression with 2 levels of properties', function () {

            var result = lexer('foo.bar');

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
            expect(result).to.have.property(0).that.deep.equals({ name: lexer.tokens.ident, value: 'foo.bar' });

        });


        it('should lex an identifier expression with 3 levels of properties', function () {

            var result = lexer('foo.bar.oy');

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
            expect(result).to.have.property(0).that.deep.equals({ name: lexer.tokens.ident, value: 'foo.bar.oy' });

        });

    });

    describe('numbers', function () {

        it('should lex a simple number', function () {

            var result = lexer('1');

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
            expect(result).to.have.property(0).that.deep.equals({ name: lexer.tokens.number, value: '1' });

        });

        it('should lex a number with decimals and preceding zero', function () {

            var result = lexer('0.1234');
            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
            expect(result).to.have.property(0).that.deep.equals({ name: lexer.tokens.number, value: '0.1234' });

        });

        it('should lex a number with decimals and no preceding zero', function () {

            var result = lexer('.1234');
            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
            expect(result).to.have.property(0).that.deep.equals({ name: lexer.tokens.number, value: '.1234' });

        });

    });

    describe('whitespace', function () {

        it('should ignore whitespace', function () {

            var result = lexer('foo && bar && oy');
            expect(result).to.be.an('array');
            expect(result.length).to.equal(5);
            expect(result).to.have.property(0).that.deep.equals({ name: lexer.tokens.ident, value: 'foo' });
            expect(result).to.have.property(1).that.deep.equals({ name: lexer.tokens.and, value: '&&' });
            expect(result).to.have.property(2).that.deep.equals({ name: lexer.tokens.ident, value: 'bar' });
            expect(result).to.have.property(3).that.deep.equals({ name: lexer.tokens.and, value: '&&' });
            expect(result).to.have.property(4).that.deep.equals({ name: lexer.tokens.ident, value: 'oy' });

        });

    });

    describe('empty', function () {

        it('should lex the empty keyword', function () {

            var result = lexer('empty foo');
            expect(result).to.be.an('array');
            expect(result.length).to.equal(2);
            expect(result).to.have.property(0).that.deep.equals({ name: lexer.tokens.empty, value: 'empty' });
            expect(result).to.have.property(1).that.deep.equals({ name: lexer.tokens.ident, value: 'foo' });

        });

        it('should lex not empty', function () {

            var result = lexer('!empty foo');
            expect(result).to.be.an('array');
            expect(result.length).to.equal(3);
            expect(result).to.have.property(0).that.deep.equals({ name: lexer.tokens.not, value: '!' });
            expect(result).to.have.property(1).that.deep.equals({ name: lexer.tokens.empty, value: 'empty' });
            expect(result).to.have.property(2).that.deep.equals({ name: lexer.tokens.ident, value: 'foo' });

        });

    });

    describe('advanced', function () {

        it('should lex this long absurd expression', function () {

            var result = lexer('!empty foo && foo.bar >= oy.vey ? (oy.vey + 1234.5678) : (foo.bar / .4321)');
            expect(result).to.be.an('array');
            expect(result.length).to.equal(19);
            expect(result).to.have.property(0).that.deep.equals({ name: lexer.tokens.not, value: '!' });
            expect(result).to.have.property(1).that.deep.equals({ name: lexer.tokens.empty, value: 'empty' });
            expect(result).to.have.property(2).that.deep.equals({ name: lexer.tokens.ident, value: 'foo' });
            expect(result).to.have.property(3).that.deep.equals({ name: lexer.tokens.and, value: '&&' });
            expect(result).to.have.property(4).that.deep.equals({ name: lexer.tokens.ident, value: 'foo.bar' });
            expect(result).to.have.property(5).that.deep.equals({ name: lexer.tokens.gte, value: '>=' });
            expect(result).to.have.property(6).that.deep.equals({ name: lexer.tokens.ident, value: 'oy.vey' });
            expect(result).to.have.property(7).that.deep.equals({ name: lexer.tokens.qmark, value: '?' });
            expect(result).to.have.property(8).that.deep.equals({ name: lexer.tokens.lparen, value: '(' });
            expect(result).to.have.property(9).that.deep.equals({ name: lexer.tokens.ident, value: 'oy.vey' });
            expect(result).to.have.property(10).that.deep.equals({ name: lexer.tokens.plus, value: '+' });
            expect(result).to.have.property(11).that.deep.equals({ name: lexer.tokens.number, value: '1234.5678' });
            expect(result).to.have.property(12).that.deep.equals({ name: lexer.tokens.rparen, value: ')' });
            expect(result).to.have.property(13).that.deep.equals({ name: lexer.tokens.colon, value: ':' });
            expect(result).to.have.property(14).that.deep.equals({ name: lexer.tokens.lparen, value: '(' });
            expect(result).to.have.property(15).that.deep.equals({ name: lexer.tokens.ident, value: 'foo.bar' });
            expect(result).to.have.property(16).that.deep.equals({ name: lexer.tokens.slash, value: '/' });
            expect(result).to.have.property(17).that.deep.equals({ name: lexer.tokens.number, value: '.4321' });
            expect(result).to.have.property(18).that.deep.equals({ name: lexer.tokens.rparen, value: ')' });

        });

    });

});