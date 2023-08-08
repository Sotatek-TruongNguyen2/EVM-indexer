"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIndexerLogger = void 0;
var winston_1 = require("winston");
var combine = winston_1.format.combine, timestamp = winston_1.format.timestamp, label = winston_1.format.label, printf = winston_1.format.printf;
var _LOGGER_CACHE = {};
function getIndexerLogger(loggerName) {
    if (loggerName in _LOGGER_CACHE) {
        return _LOGGER_CACHE[loggerName];
    }
    var transportOptions = [];
    // Datadog logging
    if (process.env.DD_LOGGING_ENABLE) {
        var httpTransportOptions = {
            host: 'http-intake.logs.datadoghq.com',
            path: "/api/v2/logs?dd-api-key=".concat(process.env.DD_API_KEY, "&ddsource=nodejs&service=").concat(process.env.DD_APP_NAME),
            ssl: false,
        };
        console.log(httpTransportOptions.path);
        transportOptions.push(new winston_1.transports.Http(httpTransportOptions));
    }
    transportOptions.push(new winston_1.transports.Console());
    var myFormat = printf(function (_a) {
        var level = _a.level, message = _a.message, label = _a.label, timestamp = _a.timestamp;
        return "".concat(timestamp, " [").concat(level, "] ").concat(label, ": ").concat(message);
    });
    return (_LOGGER_CACHE[loggerName] = (0, winston_1.createLogger)({
        level: 'debug',
        format: combine(label({ label: loggerName }), timestamp(), myFormat),
        // transports: transportOptions,
        transports: [
            //
            // - Write all logs with importance level of `error` or less to `error.log`
            // - Write all logs with importance level of `info` or less to `combined.log`
            //
            new winston_1.transports.Console(),
            new winston_1.transports.File({
                filename: 'src/logs/transaction.log',
                level: 'debug',
            }),
        ],
    }));
}
exports.getIndexerLogger = getIndexerLogger;
