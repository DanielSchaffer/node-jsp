var chai = require('chai'),
    expect = chai.expect,

    binding = require('../../../src/handlers/binding');

describe('binding', function () {

    var vm, model;

    beforeEach(function () {
        vm = require('vm');
        model = { foo: { bar: 1234 }, oy: { vey: 5678 } };
        vm.createContext(model);
    });

    function test(expression, expected) {
        var result = binding(expression, model);

        expect(result).to.equal(expected);
    }

    it('should bind simple properties', function () {
       test('${foo.bar}', model.foo.bar);
    });

    it('should return an empty string when accessing a null or undefined property', function () {
        test('${foo.boor}', '');
    });

    it('should return an empty string when attempting to access a property of a null or empty object', function () {
        test('${foo.boor.wat}', '');
    });

    it('should return false when binding an inverted empty token', function () {
        test('${!empty foo.boor}', false);
    });

});