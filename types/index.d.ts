import * as color from "colors";
import { LogListener } from "./handlers/event";
import { FileLogger } from "./handlers/fileLog";
/**
 * Logger options interface
 * 日誌選項介面
 * @typedef {Object} LoggerOptions
 * @property {string} [format] The format of the log message 日誌消息的格式
 * @property {boolean} [debug] Enable debug mode 啟用調試模式
 * @property {Level<T>} [level] The levels of the log message 日誌消息的級別
 * @property {Object} [files] File logging options 文件日誌選項
 * @property {string} files.logDirectory The directory to store log files 存儲日誌文件的目錄
 * @property {string} [files.logName] The name of the log file 日誌文件的名稱
 * @property {number} files.bufferSize The buffer size for log files 日誌文件的緩衝區大小
 * @property {number} files.flushInterval The interval to flush log files 刷新日誌文件的間隔
 * @property {number} files.maxFileSize The maximum size of log files 日誌文件的最大大小
 * @property {number} files.retentionDays The number of days to retain log files 保留日誌文件的天數
 */
interface LoggerOptions<T extends string = string> {
    format?: string;
    debug?: boolean;
    level?: Level<T>;
    files?: {
        logDirectory: string;
        logName?: string;
        bufferSize: number;
        flushInterval: number;
        maxFileSize: number;
        retentionDays: number;
    };
}
/**
 * Level configuration interface
 * 級別配置介面
 * @typedef {Object} Level
 * @property {string} color The color of the log message 日誌消息的顏色
 * @property {string} use The console method to use 使用的控制台方法
 * @property {string} prefix The prefix of the log message 日誌消息的前綴
 * @property {string} [format] The format of the log message 日誌消息的格式
 * @property {Object} [files] File logging options 文件日誌選項
 * @property {string} files.name The name of the log file 日誌文件的名稱
 * @property {string} files.logDirectory The directory to store log files 存儲日誌文件的目錄
 */
type Level<T extends string = string> = {
    [K in T]: {
        color: keyof color.Color;
        use: keyof Console;
        prefix: string;
        format?: string;
        files?: {
            name: string;
            logDirectory: string;
        };
    };
};
/**
 * Quill logger class
 * Quill 日誌類
 * @template T
 */
declare class QuillLog<T extends string> {
    private Logger_format;
    private Logger_level;
    private emitter;
    private Logger_debugMode;
    private Logger_events;
    QuillLog: QuillLog<any>;
    on: (event: T, listener: LogListener<T>) => LogListener<T>;
    once: (event: T, listener: LogListener<T>) => LogListener<T>;
    off: (event: T, listener: LogListener<T>) => import("events");
    emit: (event: T, ...args: any) => boolean;
    filelogger?: FileLogger;
    /**
     * (>_β) Quill logger
     * (>_β) Quill 日誌
     * @param {LoggerOptions<T>} options The format and levels of the log message. 日誌消息的格式和級別。
     * @example
     * const quill = new QuillLog({
     *     format: "[{{level.gray}}] {{date.gray:HH:mm:ss}} {{msg}}",
     *     level: {
     *         Log: {
     *             color: 'white',
     *             use: 'log',
     *             prefix: '[INFO]',
     *             format: "{{prefix.blue.bold}} {{date.gray:HH:mm:ss}}: {{msg}}",
     * 			   files: {
     * 			        name: "info {{date:YYYY-MM-DD}}.log",
     * 			        logDirectory: "./logs/info"
     * 			   }
     *         },
     *         Error: {
     *             color: 'red',
     *             use: 'error',
     *             prefix: '[ERROR]',
     *             format: "{{prefix.bold}} {{date:HH:mm:ss}}: {{msg}}"
     *         }
     *     },
     * 	   files: {
     * 	       logDirectory: "./logs",
     * 		   logName: "{{date:YYYY-MM-DD}}.log",
     * 	       bufferSize: 100,
     * 	       flushInterval: 1000,
     * 	       maxFileSize: 1000,
     * 	       retentionDays: 10
     * 	   }
     * });
     *
     * // this will print
     * quill.log('Log', "hello %s!", "world"); // -> "[INFO] 00:00:00: hello world!"
     * quill.log('Error', "error message"); // -> "[ERROR] 00:00:00: error message"
     * // this will throw an error
     * quill.log('Debug', "debugging"); // -> Error: "Debug is not a valid log level"
     */
    constructor(options: LoggerOptions<T>);
    /**
     * Quill log
     * Quill 日誌
     * @param {T} level The level of the log message 日誌消息的級別
     * @param {string} message The log message 日誌消息
     * @param {any[]} [optionalParams] Options parameters 可選參數
     * @example
     * quill.log('Log', 'hello %s!', 'world'); // -> 'hello world!'
     */
    log(level: T, message?: any, ...optionalParams: any[]): void;
    /**
     * Format the log message
     * 格式化日誌消息
     * @param {T} level The level of the log message 日誌消息的級別
     * @param {string} message The log message 日誌消息
     * @returns {string} The formatted log message 格式化的日誌消息
     */
    private formatMessage;
    /**
     * getInstance - get instance of Quill Log
     * 獲取 Quill 日誌的實例
     * @returns {QuillLog} The instance of Quill Log Quill 日誌的實例
     * @version v0.0.1
     * @deprecated v0.0.1 no longer supported 不再支持
     */
    static getInstance(): QuillLog<any>;
    /**
     * Shutdown the logger
     * 關閉日誌記錄器
     */
    private shutdown;
    /**
     * Handle process exit events
     * 處理進程退出事件
     */
    private handleProcessExit;
}
export default QuillLog;
export { QuillLog };
//# sourceMappingURL=index.d.ts.map