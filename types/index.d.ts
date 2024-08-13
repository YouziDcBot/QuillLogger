import * as color from 'colors';
interface LoggerOptions<T extends string = string> {
    format?: string;
    debug?: boolean;
    level?: Level<T>;
}
type Level<T extends string = string> = {
    [K in T]: {
        color: keyof color.Color;
        use: keyof Console;
        prefix: string;
        format?: string;
    };
};
/**
 * Log listener type
 * @template T
 * @callback LogListener
 * @param {T} level - The level of the log message, indicating its severity or category.
 * @param {string} message - The content of the log message.
 * @param {string} timestamp - The timestamp when the log message was created, formatted as a string.
 * @param {string} formattedMessage - The message formatted according to the logger's configuration.
 */
type LogListener<T extends string> = (level: T, message: string, timestamp: string, formattedMessage: string) => void;
/**
 * Logger class
 */
export default class Logger<T extends string> {
    private format;
    private level;
    private emitter;
    private debug;
    /**
     * Logger constructor
     * @param options The format and levels of the log message.
     * @example
     * const log = new Logger({
     *     format: "[{{level.gray}}] {{date.gray:HH:mm:ss}} {{msg}}",
     *     level: {
     *         Log: {
     *             color: 'white',
     *             use: 'log'
     *             prefix: '[INFO]'
     *             format: "{{prefix.blue.bold}} {{date.gray:HH:mm:ss}}: {{msg}}",
     *         },
     *         Error: {
     *             color: 'red',
     *             use: 'error'
     *             prefix: '[ERROR]'
     *             format: "{{prefix.bold}} {{date:HH:mm:ss}}: {{msg}}",
     *         }
     *     }
     * });
     * log.log('Log', "hello world");
     */
    constructor(options: LoggerOptions<T>);
    /**
     * log
     * @param level The level of the log message
     * @param message The log message
     * @example
     * logger.log('Log', 'hello world');
     */
    log(level: T, message: string): void;
    /**
     * Add an event listener for the event
     * @param {T} event - The name of the event to listen to, which corresponds to the log level.
     * @param {LogListener<T>} listener - The callback function that will be called when the event is emitted.
     */
    on(event: T, listener: LogListener<T>): void;
    /**
     * Add a one-time event listener for the event
     * @param {T} event - The name of the event to listen to, which corresponds to the log level.
     * @param {LogListener<T>} listener - The callback function that will be called when the event is emitted.
     */
    once(event: T, listener: LogListener<T>): void;
    /**
     * Remove an event listener for the event
     * @param {T} event - The name of the event to listen to, which corresponds to the log level.
     * @param {LogListener<T>} listener - The callback function that will be called when the event is emitted.
     */
    off(event: T, listener: LogListener<T>): void;
    private formatMessage;
}
export {};
//# sourceMappingURL=index.d.ts.map