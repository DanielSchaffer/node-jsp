var jspRenderer = require('./renderer');
var profiler = require('./profiler');

module.exports = function nodeJspEngine(app, rendererOptions) {
    var renderer = jspRenderer(rendererOptions);
    app.engine('jsp', function (filePath, options, callback) {
        var profile = (rendererOptions.profiler || profiler.passthrough)();
        if (!options) {
            options = {};
        }
        options.__profileId = profile.id;
        console.log('profile id:', profile.id);
        renderer.renderFile(filePath, options, profile)
            .then(function (result) {
                callback(null, result);
            }, callback);
    });
};
module.exports.profiles = profiler.profiles;