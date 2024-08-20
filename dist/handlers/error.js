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
        return new LoggerError(`Invalid date format: ${input || 'unknown'}`);
    }
    static InvalidStyle(style) {
        return new LoggerError(`Invalid style: ${style}`);
    }
    /** @deprecated getInstance() is no longer supported */
    static NoExistingInstance() {
        return new LoggerError('No existing instance of Quill');
    }
    constructor(message) {
        super(message);
        this.name = 'LoggerError';
    }
}
exports.LoggerError = LoggerError;
//# sourceMappingURL=error.js.map