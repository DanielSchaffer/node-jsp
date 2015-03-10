var _ = require('underscore');
var q = require('q');
var ogAll = q.all;

q.all = function allObject(arg) {

    if (_.isArray(arg)) {
        return ogAll.apply(this, arguments);
    }

    return ogAll.call(this, _.values(arg))
        .then(function (result) {
            var keys = _.keys(arg);
            return _.chain(result)
                .map(function (value, i) {
                    return [keys[i], value];
                })
                .object()
                .value();
        });

};

module.exports = q;