import { Color } from 'colors';
interface LoggerOptions<T extends string = string> {
    format?: string;
    level?: Level<T>;
}
type Level<T extends string = string> = {
    [K in T]: {
        color: keyof Color;
        use: keyof Console;
        prefix: string;
        format?: string;
    };
};
/**
 * Logger class
 */
export default class Logger<T extends string> {
    private format;
    private level;
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
     *             format: "{{prefix.blue}} {{date:HH:mm:ss}} {{msg}}",
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
     */
    log(level: T, message: string): void;
    private formatMessage;
}
export {};
//# sourceMappingURL=index.d.ts.map