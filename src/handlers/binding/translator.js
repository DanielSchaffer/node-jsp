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
        lbracket: {
            next: { allowed: ['ident', 'lparen', 'sqliteral', 'dqliteral', 'lbracket', 'number'], required: true },
            closedBy: ['rbracket'],
            translate: translateClosedToken
            /*translate: function translateBracket(token, model, next) {
                console.log('translateBracket', token, next);
            }*/
        },
        ident: {
            translate: translateClosedToken,
            /*translate: function translateIdent(token, model, next) {
                //return bindValue(token.value, model);
                return token.value + _.map(next, function (next) {
                        return next.translate(next.token, model, next.next);
                    }).join('');
            },*/
            next: { allowed: ['dot', 'lbracket'] },
            continuedBy: ['dot', 'lbracket']
        },
        sqliteral: translateLiteral,
        dqliteral: translateLiteral
    };

function translateClosedToken(token, model, next) {
    return token.value + _.map(next, function (next) {
            if (!next.translate) {
                var foo = '';
            }
            return next.translate(next.token, model, next.next);
        }).join('');
}

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

    var state = {
        stack: [],
        toClose: [],
        awaitingNext: null
    };

    tokens = tokens.slice(0);

    function tokenAsLoggableString(token) {
        var result = 'token "' + token.name + '"';
        if (token.name !== token.value) {
            result += ' (' + token.value + ')';
        }
        return result;
    }

    _.reduce(tokens, function (state, token) {

        var handler = tokenHandlers[token.name],
            translate = handler && handler.translate || defaultTranslator,
            currentToClose = state.toClose.length && _.last(state.toClose),
            context = {
                handler: handler,
                token: token,
                translate: translate,
                contents: []
            };

        if (state.awaitingNext) {
            var isValidNext = _.contains(state.awaitingNext.handler.next.allowed, token.name);
            if (!isValidNext && state.awaitingNext.handler.next.required) {
                throw 'unexpected ' + tokenAsLoggableString(token);
            }
            var awaitingNext = state.awaitingNext;
            state.awaitingNext = null;

            if (!awaitingNext.handler.closedBy && !awaitingNext.handler.continuedBy) {
                if (isValidNext) {
                    state.stack.push(awaitingNext.translate(awaitingNext.token, model, token));
                } else {
                    state.stack.push(awaitingNext.translate(awaitingNext.token, model));
                }
                return state;
            }
        }

        if (handler && handler.next) {
            state.awaitingNext = context;

            if (handler.closedBy || handler.continuedBy) {
                if (currentToClose) {
                    currentToClose.contents.push(context);
                }
                state.toClose.push(context);
                return state;
            }

            return state;
        }

        if (currentToClose) {
            var canBeClosed =
                (currentToClose.handler.closedBy && _.contains(currentToClose.handler.closedBy, token.name)) ||
                (currentToClose.handler.continuedBy && !_.contains(currentToClose.handler.continuedBy, token.name));

            currentToClose.contents.push(context);

            if (canBeClosed) {
                state.toClose.pop();
                var closed = currentToClose;
                currentToClose = state.toClose.length && _.last(state.toClose);
                if (currentToClose) {
                    currentToClose.contents.push(closed);
                } else {
                    state.stack.push(closed.translate(closed.token, model, closed.contents));
                }
            }

            return state;
        }

        return state;
    }, state);

    if (state.awaitingNext && state.awaitingNext.handler.next.required) {
        throw state.stack.join('') + 'expected one of token "' + state.awaitingNext.handler.next.allowed.join('","') + '", got end-of-input';
    }

    while (state.toClose.length) {
        var currentToClose = state.toClose.pop();
        if (currentToClose.closedBy) {
            throw state.stack.join('') + 'expected one of token "' + currentToClose.closedBy.join('","') + '", got end-of-input';
        }
        var closed = currentToClose;
        currentToClose = state.toClose.length && _.last(state.toClose);
        if (currentToClose) {
            currentToClose.contents.push(closed);
        } else {
            state.stack.push(closed.translate(closed.token, model, closed.contents));
        }
    }

    return state.stack;
};