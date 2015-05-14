var fs = require('fs'),

    _ = require('underscore'),
    q = require('q');

module.exports = function fileReader() {
    return {
        read: function read(file) {
            var deferred = q.defer();

            if (!file || !_.isString(file)) {
                return q.reject({
                    message: 'file must be a defined, non-null, and non-empty string'
                });
            }

            fs.exists(file, function (exists) {
                if (exists) {
                    fs.readFile(file, { encoding: 'utf8' }, function (err, fileContent) {
                        if (err) {
                            deferred.reject({
                                message: 'error reading file ' + file,
                                error: err,
                                ex: {
                                    message: err.message,
                                    stack: err.stack
                                }
                            });
                        } else {
                            deferred.resolve(fileContent);
                        }
                    });
                } else {
                    deferred.reject({
                        message: 'could not find file at ' + file
                    });
                }
            });

            return deferred.promise;
        }
    };
}();