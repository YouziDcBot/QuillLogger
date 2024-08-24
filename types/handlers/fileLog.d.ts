interface LevelConfig {
    logDirectory: string;
    logName: string;
}
declare class FileLogger {
    private levelConfigs;
    private logDirectories;
    private logNames;
    private currentLogFilePaths;
    private logBuffers;
    private bufferSize;
    private flushInterval;
    private maxFileSize;
    private retentionDays;
    private intervals;
    constructor(levelConfigs: {
        [level: string]: LevelConfig;
    }, bufferSize?: number, flushInterval?: number, maxFileSize?: number, retentionDays?: number);
    private formatMessage;
    private formatDate;
    private flushBuffer;
    private startBufferFlush;
    private getNewLogFilePath;
    private rotateFile;
    private getRotatedFilePath;
    private startFileRotation;
    private deleteOldLogs;
    private startLogCleanup;
    private shutdown;
    private handleProcessExit;
    log(level: string, message: string, ...optionalParams: any[]): void;
}
export default FileLogger;
export { FileLogger };
//# sourceMappingURL=fileLog.d.ts.map