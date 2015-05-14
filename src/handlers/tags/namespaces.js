var q = require('q'),
    _ = require('underscore');

var builtIn = {
    'http://java.sun.com/jsp/jstl/core': { handlers: { handlerPath: './c/' } },
    'http://java.sun.com/jsp': { prefix: 'jsp', handlers: { handlerPath: './jsp/' } }
};

module.exports = function namespaces(options) {

    var ns = _.extend(_.mapObject(builtIn, function (entry) { return _.extend({}, entry); }), options || {}),
        handlersByPrefix = _.chain(ns)
            .map(function (entry) {
                if (!entry.prefix) {
                    return null;
                }
                return [entry.prefix, entry.handlers];
            })
            .filter(function (entry) { return entry; })
            .object()
            .value();

    function registerPrefix(namespace, prefix) {
        if (!ns[namespace]) {
            throw 'no handler configured for namespace "' + namespace + '"'
        }

        ns[namespace].prefix = prefix;
        handlersByPrefix[prefix] = ns[namespace].handlers;
    }

    function getHandler(tagName) {
        var parts = tagName.split(':'),
            prefix = parts[0],
            name = parts[1];

        if (!handlersByPrefix[prefix]) {
            return q.reject({
                message: 'prefix "' + prefix + '" has not been configured'
            });
        }

        if (!handlersByPrefix[prefix].handlerPath && !handlersByPrefix[prefix][name]) {
            return q.reject({
                message: 'no handler registered for tag ' + tagName
            });
        }

        if (handlersByPrefix[prefix].handlerPath && (!handlersByPrefix[prefix].handlers || !handlersByPrefix[prefix][name])) {
            try {
                return require(handlersByPrefix[prefix].handlerPath + name);
            } catch (ex) {
                return q.reject({
                    message: 'exception loading handler',
                    ex: {
                        message: ex.message,
                        stack: ex.stack
                    },
                    prefix: prefix,
                    name: name,
                    handlerPath: handlersByPrefix[prefix].handlerPath
                });
            }
        }

        return handlersByPrefix[prefix][name];
    }

    return {
        registerPrefix: registerPrefix,
        getHandler: getHandler
    };

};