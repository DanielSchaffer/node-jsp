module.exports = {
    definedAndNonNull: function (obj) {
        return obj !== null && typeof(obj) !== 'undefined';
    }
};