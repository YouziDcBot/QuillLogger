import moment from 'moment';
import * as color from 'colors';
import { EventEmitter } from 'events';

color.enable();
// moment.locale('en_us');

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

interface LoggerEvent<T extends string> {
    level: T;
    message: string;
    timestamp: number;
    formattedMessage: string;
}

/**
 * Log listener type
 * @template T
 * @callback LogListener
 * @param {T} level - The level of the log message, indicating its severity or category.
 * @param {string} message - The content of the log message.
 * @param {string} timestamp - The timestamp when the log message was created, formatted as a string.
 * @param {string} formattedMessage - The message formatted according to the logger's configuration.
 */
type LogListener<T extends string> = (
    level: T,
    message: string,
    timestamp: string,
    formattedMessage: string
) => void;

/**
 * Logger class
 */
export default class Logger<T extends string> {
    private format: string;
    private level: Level<T>;
    private emitter: EventEmitter;
    private debug: boolean;

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
    constructor(options: LoggerOptions<T>) {
        // super();
        this.emitter = new EventEmitter();

        this.debug = options.debug || false;
        this.format = options.format || "[{{prefix}}] {{date:HH:mm:ss}} {{msg}}";
        this.level = options.level || {
            log: {
                color: 'white',
                use: 'log',
            }
        } as Level<T>;
    }

    /**
     * log
     * @param level The level of the log message
     * @param message The log message
     * @example
     * logger.log('Log', 'hello world');
     */
    log(level: T, message: string): void {
        const levelConfig = this.level[level];
        if (!levelConfig) throw new Error(`${level} is not a valid log level`);

        // const date = moment().format(this.extractDateFormat());
        const formattedMessage = this.formatMessage(level, message);
        const timestamp = Date.now();
        const outputFn = console[levelConfig.use] as (...args: any[]) => void;
        outputFn(formattedMessage[levelConfig.color]);

        // Emit the log event
        this.emitter.emit(level, {
            level,
            message,
            timestamp,
            formattedMessage,
        } as LoggerEvent<T>);
    }
    /**
     * Add an event listener for the event
     * @param {T} event - The name of the event to listen to, which corresponds to the log level.
     * @param {LogListener<T>} listener - The callback function that will be called when the event is emitted.
     */
    on(event: T, listener: LogListener<T>): void {
        this.emitter.on(event, listener);
    }

    /**
     * Add a one-time event listener for the event
     * @param {T} event - The name of the event to listen to, which corresponds to the log level.
     * @param {LogListener<T>} listener - The callback function that will be called when the event is emitted.
     */
    once(event: T, listener: LogListener<T>): void {
        this.emitter.once(event, listener);
    }

    /**
     * Remove an event listener for the event
     * @param {T} event - The name of the event to listen to, which corresponds to the log level.
     * @param {LogListener<T>} listener - The callback function that will be called when the event is emitted.
     */
    off(event: T, listener: LogListener<T>): void {
        this.emitter.off(event, listener);
    }

    private formatMessage(level: T, message: string): string {
        let formatted = this.level[level].format || this.format;

        const searchValue = /{{(prefix|level|msg|date)(?:\.([\w.]+))?:?(.*?)}}/g;

        formatted = formatted.replace(
            searchValue,
            (_, key: string, style: string, dateFormat: string) => {
                let value = '';

                if (this.debug) console.debug("Replacer: ", _, key, style, dateFormat);
                switch (key) {
                    case 'prefix':
                        value = this.level[level].prefix;
                        break;
                    case 'level':
                        value = level;
                        break;
                    case 'msg':
                        value = message;
                        break;
                    case 'date':
                        value = moment().format(dateFormat);
                        break;
                    default:
                        break;
                }

                if (style) {
                    const styles = style.split('.');
                    for (const s of styles) {
                        if (!(value as any)[s]) throw new Error(`Invalid style: ${s}`);
                        value = (value as any)[s];
                    }
                }
                return value;
            });

        return formatted;
    }
}

// Usage example
// const log = new Logger({
//     format: "[{{level}}] {{date:HH:mm:ss}} {{msg}}",
//     level: {
//         Log: {
//             color: 'white',
//             use: 'log'
//         },
//         Error: {
//             color: 'red',
//             use: 'error'
//         }
//     }
// });

// // Now only the defined levels can be used
// log.log('Log', "This is an informational message.");
// log.log('Error', "This is an error message.");
// log.log('Debug', "This will throw an error because 'Debug' is not defined.");
