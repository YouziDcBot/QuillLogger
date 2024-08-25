"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerError = void 0;
class LoggerError extends Error {
    static NoLongerSupported() {
        return new LoggerError("This method is no longer supported");
    }
    static ValidLogLevel(level) {
        return new LoggerError(`${level} is not a valid log level`);
    }
    static InvalidDateFormat(input) {
        return new LoggerError(`Invalid date format: ${input || "unknown"}`);
    }
    static InvalidStyle(style) {
        return new LoggerError(`Invalid style: ${style}`);
    }
    /** @deprecated getInstance() is no longer supported */
    static NoExistingInstance() {
        return new LoggerError("No existing instance of Quill");
    }
    static InvalidThisInstance() {
        return new LoggerError("log method called with incorrect `this` context. Did you forget to bind the method? E.g. `this.log = quill.log.bind(this)`");
    }
    static LogFileError(err) {
        return new LoggerError(`Failed at log file: ${err.message} \n${JSON.stringify(err)}`);
    }
    static LogShutdown() {
        return new LoggerError("Logger was shut down");
    }
    constructor(message) {
        super(message);
        this.name = "Quill#LoggerError";
    }
}
exports.LoggerError = LoggerError;
//# sourceMappingURL=errors.js.map