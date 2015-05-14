var _ = require('underscore'),

    lexer = require('./lexer'),

    tokenHandlers = {
        empty: {
            next: { allowed: ['ident'], required: true },
            translate: function translateEmpty(token, model, next) {
                var ident = translateNext(next, model);
                return '(typeof(' + ident + ')===\'undefined\'||' + ident + '===\'\'||' + ident + '===null)';
            }
        },
        not: {
            next: { allowed: ['empty'], required: true }
        },
        dot: {
            next: { allowed: ['ident'], required: true }
        },
        ident: {
            translate: function translateIdent(token, model) {
                return bindValue(token.value, model);
            }
        },
        sqliteral: translateLiteral,
        dqliteral: translateLiteral
    };

function translateLiteral(token) {
    return token.data;
}

function translateNext(next, model) {
    if (next) {
        return next.translate(next.token, model, next.next);
    }

    return '';
}

function defaultTranslator(token, model, next) {
    return token.value + translateNext(next, model);
}

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

    if (typeof(target) === 'undefined' || target === null) {
        return null;
    }

    return JSON.stringify(target);
}

module.exports = function translator(tokens, model) {

    var state = { stack: []};

    tokens = tokens.slice(0);

    function tokenAsLoggableString(token) {
        var result = 'token "' + token.name + '"';
        if (token.name !== token.value) {
            result += ' (' + token.value + ')';
        }
        return result;
    }

    function slurp(skipPush) {
        var token = tokens.shift(),
            handler = tokenHandlers[token.name],
            translate = handler && handler.translate || defaultTranslator,
            next;

        if (handler && handler.next) {
            next = slurp(true);

            if (handler.next.required && !next) {
                throw 'expected one of token "' + handler.next.allowed.join('","') + '", got end-of-input';
            }

            if (!_.contains(handler.next.allowed, next.token.name)) {
                if (handler.next.required) {
                    throw 'unexpected ' + tokenAsLoggableString(next.token);
                }

                tokens.unshift(token);
                next = null;
            }
        }

        if (!skipPush) {
            state.stack.push(translate(token, model, next));
        }

        return {
            token: token,
            translate: translate,
            next: next
        };
    }

    while (tokens.length) {
        slurp();
    }

    return _.filter(state.stack, function (translatedToken) {
        return translatedToken !== null;
    });
};