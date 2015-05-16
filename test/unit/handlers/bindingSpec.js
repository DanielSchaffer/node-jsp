var chai = require('chai'),
    expect = chai.expect,

    binding = require('../../../src/handlers/binding'),
    profiler = require('../../../src/profiler');

describe('binding', function () {

    var vm, model, profile;

    beforeEach(function () {
        vm = require('vm');
        model = { foo: { bar: 1234 }, oy: { vey: 5678 } };
        vm.createContext(model);
        profile = profiler.passthrough();
    });

    function test(expression, expected) {
        var result = binding('bindingSpec', expression, model, profile);

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

    it('should stringify expressions if they contain anything more than a single binding expression', function () {
        test('${foo.bar} ', '1234 ');
        test('${foo.bar} ${oy.vey}', '1234 5678');
    });

    it('should execute "!empty foo"', function () {
        test('${!empty foo}', true);
    });

    it('should execute "!empty foo && foo.bar"', function () {
        test('${!empty foo && foo.bar}', 1234);
    });

    it('should execute "!empty foo && foo.bar >= oy.vey"', function () {
        test('${!empty foo && foo.bar >= oy.vey}', false);
    });

    it('should execute "!empty foo && foo.bar >= oy.vey + 1"', function () {
        test('${!empty foo && foo.bar >= oy.vey + 1}', false);
    });

    it('should execute "!empty foo && foo.bar >= (oy.vey + 1)"', function () {
        test('${!empty foo && foo.bar >= (oy.vey + 1)}', false);
    });

    it('should execute "!empty foo && foo.bar >= oy.vey ? (oy.vey + 1234.5678) : (foo.bar / .4321)"', function () {
        test('${!empty foo && foo.bar >= oy.vey ? (oy.vey + 1234.5678) : (foo.bar / .4321)}', 1234 / 0.4321);
    });

});