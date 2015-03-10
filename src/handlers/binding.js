var tokens = [
    ['empty', 'empty'],
    ['!', 'not'],
    ['(', 'lparen'],
    [')', 'rparen'],
    ['+', 'plus'],
    ['-', 'minus'],
    ['*', 'times'],
    ['/', 'slash'],
    [';', 'semicolon'],
    [':', 'colon'],
    ['&&', 'and'],
    ['||', 'or'],
    ['==', 'eq'],
    ['!=', 'neq'],
    ['>', 'gt'],
    ['<', 'lt'],
    ['>=', 'gte'],
    ['<=', 'lte'],
    [/\w+[\w\d]*/, 'ident'],
    [/\d+/, 'number'],
    [/\s+/, 'whitespace']
    ],
    tokenHandlers = {
        empty: {
            next: ['value'],
            exec: function execEmpty(value) {
                return typeof(value) === 'undefined' || value === '' || value === null;
            }
        },
        not: {
            next: ['empty'],
            exec: function execNot(empty) {
                return !empty;
            }
        },
        lparen: {
            next: ['empty', 'not', 'value']
        }
    },
    expression = ['value', 'not', 'empty'],
    comparators = ['and', 'or', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte'];

function bindValue(expression, model) {
    var parts, target, node;

    if (!model) {
        return null;
    }

    parts = expression.split('.');
    node = parts[0];

    if (node === 'null') {
        return null;
    }

    target = model[node];

    if (parts.length > 1) {
        return bindValue(parts.slice(1).join('.'), target);
    }

    return target;
}

module.exports = function binding(expression, model) {


    function lex(token) {

    }

    var tokens = expression.split(/\s+/);

};