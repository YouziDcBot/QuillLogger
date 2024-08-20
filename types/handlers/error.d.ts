export declare class LoggerError extends Error {
    static NoLongerSupported(): LoggerError;
    static ValidLogLevel(level: string): LoggerError;
    static InvalidDateFormat(input: string | undefined): LoggerError;
    static InvalidStyle(style: string): LoggerError;
    /** @deprecated getInstance() is no longer supported */
    static NoExistingInstance(): LoggerError;
    private constructor();
}
//# sourceMappingURL=error.d.ts.map