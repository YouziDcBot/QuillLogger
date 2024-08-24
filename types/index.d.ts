import * as color from "colors";
import { LogListener } from "./handlers/event";
import { FileLogger } from "./handlers/fileLog";
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
 */
declare class QuillLog<T extends string> {
    private Logger_format;
    private Logger_level;
    private emitter;
    private Logger_debugMode;
    QuillLog: QuillLog<any>;
    on: (event: T, listener: LogListener<T>) => void;
    once: (event: T, listener: LogListener<T>) => void;
    off: (event: T, listener: LogListener<T>) => void;
    private emit;
    filelogger?: FileLogger;
    /**
     * (>_β) Quill logger
     * @param {LoggerOptions<T>} options The format and levels of the log message.
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
     * 			        logDirectory: "logs/info"
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
     * @param {T} level The level of the log message
     * @param {string} message The log message
     * @param {any[]} [optionalParams] Options parameters
     * @example
     * quill.log('Log', 'hello %s!', 'world'); // -> 'hello world!'
     */
    log(level: T, message?: any, ...optionalParams: any[]): void;
    private formatMessage;
    /**
     * getInstance - get instance of Quill Log
     * @returns {QuillLog} The instance of Quill Log
     * @version v0.0.1
     * @deprecated v0.0.1 no longer supported
     */
    static getInstance(): QuillLog<any>;
}
export default QuillLog;
export { QuillLog };
//# sourceMappingURL=index.d.ts.map