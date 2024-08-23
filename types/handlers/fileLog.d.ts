declare class FileLogger {
    private logDirectory;
    private currentLogFilePath;
    private buffer;
    private bufferSize;
    private flushInterval;
    private maxFileSize;
    private retentionDays;
    /**
     *
     * @param logDirectory The directory where log files will be stored.
     * @param bufferSize The number of log messages to buffer before flushing to the log file.
     * @param flushInterval The interval (in milliseconds) at which the log buffer will be flushed to the log file.
     * @param maxFileSize The maximum size (in bytes) of a log file before it is rotated and compressed.
     * @param retentionDays The number of days to retain log files before deleting them.
     * @version v0.2.0 - 即將推出
     * @summary 這是一個簡單的文件記錄器，用於將日誌消息寫入文件。它支持日誌文件的旋轉和壓縮，以及舊日誌文件的刪除。
     * @example
     * // nothing here :/
     *
     */
    constructor(logDirectory?: string, bufferSize?: number, flushInterval?: number, maxFileSize?: number, retentionDays?: number);
    private formatMessage;
    private flushBuffer;
    private startBufferFlush;
    private getNewLogFilePath;
    private rotateFile;
    private startFileRotation;
    private deleteOldLogs;
    private startLogCleanup;
    log(message: string, ...optionalParams: any[]): void;
}
export default FileLogger;
export { FileLogger };
//# sourceMappingURL=fileLog.d.ts.map