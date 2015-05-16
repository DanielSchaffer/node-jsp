var fs = require('fs'),

    _ = require('underscore'),
    when = require('when'),

    cache = {};

module.exports = function fileReader() {
    return {
        read: function read(file) {
            var deferred,
                cached;

            if (!file || !_.isString(file)) {
                return when.reject({
                    message: 'file must be a defined, non-null, and non-empty string'
                });
            }

            cached = cache[file];
            if (cached) {
                return cached;
            }

            deferred = when.defer();

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
                            cache[file] = deferred.promise;
                            fs.watch(file, function () {
                                delete cache[file];
                            });
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