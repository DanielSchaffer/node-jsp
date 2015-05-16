var lexer = require('./lexer'),
    _ = require('underscore'),

    tokenHandlers = {
        empty: {
            next: { allowed: ['ident'], required: true },
            translate: function translateEmpty(token, next) {
                var ident = translateNext(next);
                return '(typeof(' + ident + ')===\'undefined\'||' + ident + '===\'\'||' + ident + '===null)';
            }
        },
        not: {
            next: { allowed: ['empty', 'ident', 'lparen'], required: true }
        },
        dot: {
            next: { allowed: ['ident'], required: true },
            propertyAccessor: true
        },
        lparen: {
            next: { allowed: ['ident', 'lparen', 'sqliteral', 'dqliteral', 'lbracket', 'number'], required: true },
            closedBy: ['rparen'],
            translate: translateClosedToken
        },
        lbracket: {
            next: { allowed: ['ident', 'lparen', 'sqliteral', 'dqliteral', 'lbracket', 'number'], required: true },
            closedBy: ['rbracket'],
            translate: translateClosedToken,
            propertyAccessor: true
        },
        sqliteral: translateLiteral,
        dqliteral: translateLiteral
    };

function translateClosedToken(token, next) {
    return token.value + _.map(next, function (next) {
            return next.translate(next.token, next.next);
        }).join('');
}

function translateLiteral(token) {
    return token.data;
}

function translateNext(next) {
    if (next) {
        return next.translate(next.token, next.next);
    }

    return '';
}

function defaultTranslator(token, next) {
    return token.value + translateNext(next);
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

function translateTokens(tokens) {

    var state = {
        stack: [],
        toClose: [],
        awaitingNext: []
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
            firstNext = state.awaitingNext.length && _.first(state.awaitingNext),
            currentNext = state.awaitingNext.length && _.last(state.awaitingNext),
            context = {
                handler: handler,
                token: token,
                translate: translate,
                contents: []
            };

        if (state.awaitingNext.length) {
            var isValidNext = _.contains(currentNext.handler.next.allowed, token.name);
            if (!isValidNext && currentNext.handler.next.required) {
                throw 'unexpected ' + tokenAsLoggableString(token);
            }

            currentNext.next = context;
            if (!handler || !handler.next) {
                state.awaitingNext = [];
                if (!currentNext.handler.closedBy && !currentNext.handler.continuedBy) {
                    if (isValidNext) {
                        state.stack.push(firstNext.translate(firstNext.token, firstNext.next));
                    } else {
                        state.stack.push(firstNext.translate(firstNext.token));
                        state.stack.push(translate(token));
                    }
                    return state;
                }
            }
        }

        if (handler && handler.next) {
            state.awaitingNext.push(context);

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
                    state.stack.push(closed.translate(closed.token, closed.contents));
                }
            }

            return state;
        }

        state.stack.push(translate(token));

        return state;
    }, state);

    var currentNext = state.awaitingNext.length && _.last(state.awaitingNext);
    if (currentNext && currentNext.handler.next.required) {
        throw state.stack.join('') + 'expected one of token "' + currentNext.handler.next.allowed.join('","') + '", got end-of-input';
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
            state.stack.push(closed.translate(closed.token, closed.contents));
        }
    }

    return state.stack;
}

function translateExpression(expression) {
    var tokens = lexer.lex(expression);
    return translateTokens(tokens);
}

module.exports = (function translator() {
    var cache = {};

    return {
        translate: function translate(expression) {
            var cached = cache[expression];
            if (typeof (cached) === 'undefined') {
                cached = translateExpression(expression);
                cache[expression] = cached;
            }
            return cached;
        }
    };
}());