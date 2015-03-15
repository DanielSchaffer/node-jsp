var fs = require('fs'),
    path = require('path'),

    q = require('q');

function include(context, callingPath, includeFile) {

    var deferred = q.defer(),
        resolvedPath;

    if (!callingPath) {
        return q.reject({ message: 'no callingPath provided' });
    }

    if (!includeFile) {
        return q.reject({ message: 'no includeFile provided' });
    }

    resolvedPath = path.resolve(callingPath, includeFile);

    fs.exists(resolvedPath, function (exists) {
        if (exists) {
            fs.readFile(resolvedPath, { encoding: 'utf8' }, function (err, fileContent) {
                if (err) {
                    deferred.reject({
                        message: 'error reading file ' + resolvedPath,
                        callingPath: callingPath,
                        includeFile: includeFile
                    });
                } else {
                    deferred.resolve(fileContent);
                }
            });
        } else {
            deferred.reject({
                message: 'could not find file at ' + resolvedPath,
                callingPath: callingPath,
                includeFile: includeFile
            });
        }
    });

    return deferred.promise;

}

include.fromAttrs = function includeFromAttrs(attrName) {

    return function includedFromAttrs(context, callingPath, node) {

        if (!node) {
            return q.reject({ message: 'no node provided' });
        }

        if (!node.attribs[attrName]) {
            return q.reject({
                message: 'invalid node attribute "' + attrName + '"',
                node: node
            });
        }

        return include(context, callingPath, node.attribs[attrName]);

    };

};

module.exports = include;