var _ = require('underscore'),
    profiles = [];

function reportByFn(calls) {
    return _.chain(calls)
        .groupBy(function (call) {
            return call.module + ':' + call.fn;
        })
        .mapObject(function (callGroup) {
            var total = _.chain(callGroup)
                .filter(function (call) {
                    return call.end;
                })
                .reduce(function (total, call) { return total + (call.duration || 0); }, 0)
                .value();

            return {
                callCount: callGroup.length,
                totalTime: total,
                avgTime: total / callGroup.length,
                min: _.min(callGroup, function (call) { return call.duration; }).duration,
                max: _.max(callGroup, function (call) { return call.duration; }).duration,
                calls: reportByFn(_.chain(callGroup)
                    .map(function (call) { return call.profiler && call.profiler.calls || []; })
                    .flatten()
                    .value())
            }
        })
        .value();
}

function reportList(calls, level) {

    var childCalls = _.chain(calls)
        .map(function (call) {
            call.level = level;
            return call.profiler && call.profiler.calls || [];
        })
        .flatten()
        .value();

    return calls.concat(childCalls.length && reportList(childCalls, (level || 0) + 1) || []);
}

function report(calls) {
    if (!calls.report) {
        calls.report = {
            tree: reportByFn(calls),
            list: reportByFn(reportList(calls))
        };
    }
    return calls.report;
}

function profiler(child) {
    var calls = [],
        lastCall = new Date().valueOf(),
        profile;

    function log(module, fn, props) {
        var time = new Date().valueOf(),
            call = _.extend({
                start: time.valueOf(),
                sinceLast: time - lastCall,
                module: module,
                fn: fn
            }, props || {});
        calls.push(call);
        lastCall = time;
        return call;
    }

    function endCall(call, label) {
        var time = new Date().valueOf();

        if (label) {
            call.fn += ' (' + label + ')';
        }

        call.end = time;
        call.duration = time - call.start;
    }

    function logStart(module, fn, props) {
        var instance = profiler(true),
            call = log(module, fn, props),
            end,
            status;

        function logEnd(modifier, result) {
            endCall(call, modifier);
            return result;
        }

        function logStatus(label, result) {
            var statusLog = _.extend({}, _.omit(call, 'profiler'));
            calls.push(statusLog);
            endCall(statusLog, label);
            return result;
        }

        end = logEnd.bind(null, null);
        end.withModifier = function logEndWithModifier(modifier) {
            return logEnd.bind(null, modifier);
        };

        status = function bindLogStatus(modifier) {
            return logStatus.bind(null, modifier);
        };

        call.profiler = instance;
        return {
            end: end,
            status: status,
            profiler: instance
        };
    }

    profile = {
        start: logStart,
        report: function profilerReport() {
            return report(calls);
        },
        calls: calls
    };
    if (!child) {
        profile.id = profiles.length;
        profiles.push(profile);
    }

    return profile;
}
profiler.profiles = profiles;

profiler.passthrough = function passthrough() {
    var instance = {
        start: function () {
            var end, status;
            function logEnd(modifier, result) {
                return result;
            }

            function logStatus(label, result) {
                return result;
            }

            end = logEnd.bind(null, null);
            end.withModifier = function logEndWithModifier(modifier) {
                return logEnd.bind(null, modifier);
            };

            status = function bindLogStatus(modifier) {
                return logStatus.bind(null, modifier);
            };

            return {
                end: end,
                status: status,
                profiler: instance
            };
        }
    };
    return instance;
};

module.exports = profiler;