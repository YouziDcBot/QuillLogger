export declare class LoggerError extends Error {
    static NoLongerSupported(): LoggerError;
    static ValidLogLevel(level: string): LoggerError;
    static InvalidDateFormat(input: string | undefined): LoggerError;
    static InvalidStyle(style: string): LoggerError;
    /** @deprecated getInstance() is no longer supported */
    static NoExistingInstance(): LoggerError;
    static InvalidThisInstance(): LoggerError;
    static LogFileError(err: NodeJS.ErrnoException): LoggerError;
    static LogShutdown(): LoggerError;
    private constructor();
}
//# sourceMappingURL=errors.d.ts.map