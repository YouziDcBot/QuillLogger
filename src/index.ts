import moment from 'moment';
import { Color } from 'colors';
import { Console } from "console";
import * as color from 'colors';

color.enable();
// moment.locale('en_us');

interface LoggerOptions<T extends string = string> {
    format?: string;
    level?: Level<T>;
}

type Level<T extends string = string> = {
    [K in T]: {
        color: keyof Color;
        use: keyof Console;
    };
};

/**
 * Logger class
 */
export default class Logger<T extends string> {
    private format: string;
    private level: Level<T>;

    /**
     * Logger constructor
     * @param options The format and levels of the log message.
     * @example 
     * const log = new Logger({
     *     format: "[{{level}}] {{date:HH:mm:ss}} {{msg}}",
     *     level: {
     *         Log: {
     *             color: 'white',
     *             use: 'log'
     *         }
     *     }
     * });
     * log.log('Log', "hello world");
     */
    constructor(options: LoggerOptions<T>) {
        this.format = options.format || "[{{level}}] {{date:HH:mm:ss}} {{msg}}";
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
     */
    log(level: T, message: string): void {
        const levelConfig = this.level[level];
        if (!levelConfig) throw new Error(`${level} is not a valid log level`);

        const date = moment().format(this.extractDateFormat());
        const formattedMessage = this.formatMessage(level, message, date);

        const outputFn = console[levelConfig.use] as (...args: any[]) => void;
        outputFn(formattedMessage[levelConfig.color]);
    }

    private formatMessage(level: string, message: string, date: string): string {
        let formatted = this.format;
        formatted = formatted.replace('{{level}}', level);
        formatted = formatted.replace('{{msg}}', message);
        formatted = formatted.replace(/{{date:(.*?)}}/, date);
        return formatted;
    }

    private extractDateFormat(): string {
        const dateFormatMatch = this.format.match(/{{date:(.*?)}}/);
        return dateFormatMatch ? dateFormatMatch[1] : 'YYYY/MM/DD HH:mm:ss';
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
