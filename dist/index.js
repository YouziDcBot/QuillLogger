"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const color = __importStar(require("colors"));
const events_1 = require("events");
color.enable();
/**
 * Logger class
 */
class Logger {
    /**
     * Logger constructor
     * @param {LoggerOptions<T>} options The format and levels of the log message.
     * @example
     * const logger = new Logger({
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
     * logger.log('Log', "hello world");
     */
    constructor(options) {
        // super();
        this.emitter = new events_1.EventEmitter();
        this.Logger_debugMode = options.debug || false;
        this.Logger_format = options.format || "[{{prefix}}] {{date:HH:mm:ss}} {{msg}}";
        this.Logger_level = options.level || {
            Info: {
                color: 'white',
                use: 'info',
            }
        };
        // return new Proxy(this, {
        //     get: (target, prop: string) => {
        //         if (prop in target) {
        //             return (message: string) => this.log(prop as T, message);
        //         }
        //         return undefined;
        //     }
        // });
    }
    /**
     * log
     * @param {T} level The level of the log message
     * @param {string} message The log message
     * @example
     * logger.log('Log', 'hello world');
     */
    log(level, message) {
        const levelConfig = this.Logger_level[level];
        if (!levelConfig)
            throw new Error(`${level} is not a valid log level`);
        // const date = moment().format(this.extractDateFormat());
        const formattedMessage = this.formatMessage(level, message);
        const timestamp = Date.now();
        const outputFn = console[levelConfig.use];
        outputFn(formattedMessage[levelConfig.color]);
        // Emit the log event
        this.emitter.emit(`Logger_${level}`, {
            level,
            message,
            timestamp,
            formattedMessage,
        });
    }
    /**
     * Add an event listener for the event
     * @param {T} event - The name of the event to listen to, which corresponds to the log level.
     * @param {LogListener<T>} listener - The callback function that will be called when the event is emitted.
     */
    on(event, listener) {
        this.emitter.on(`Logger_${event}`, listener);
    }
    /**
     * Add a one-time event listener for the event
     * @param {T} event - The name of the event to listen to, which corresponds to the log level.
     * @param {LogListener<T>} listener - The callback function that will be called when the event is emitted.
     */
    once(event, listener) {
        this.emitter.once(`Logger_${event}`, listener);
    }
    /**
     * Remove an event listener for the event
     * @param {T} event - The name of the event to listen to, which corresponds to the log level.
     * @param {LogListener<T>} listener - The callback function that will be called when the event is emitted.
     */
    off(event, listener) {
        this.emitter.off(`Logger_${event}`, listener);
    }
    /**
     * Call an event listener for the event
     * @param {T} event  - The name of the event to listen to, which corresponds to the log level.
     */
    emit(event, ...args) {
        this.emitter.emit(`Logger_${event}`, ...args);
    }
    formatMessage(level, message) {
        let formatted = this.Logger_level[level].format || this.Logger_format;
        const searchValue = /{{(prefix|level|msg|date)(?:\.([\w.]+))?:?(.*?)}}/g;
        formatted = formatted.replace(searchValue, (_, key, style, dateFormat) => {
            let value = '';
            if (this.Logger_debugMode)
                console.debug("Replacer: ", _, key, style, dateFormat);
            switch (key) {
                case 'prefix':
                    value = this.Logger_level[level].prefix;
                    break;
                case 'level':
                    value = level;
                    break;
                case 'msg':
                    value = message;
                    break;
                case 'date':
                    value = (0, moment_1.default)().format(dateFormat);
                    break;
                default:
                    break;
            }
            if (style) {
                const styles = style.split('.');
                for (const s of styles) {
                    if (!value[s])
                        throw new Error(`Invalid style: ${s}`);
                    value = value[s];
                }
            }
            return value;
        });
        return formatted;
    }
}
exports.default = Logger;
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
//# sourceMappingURL=index.js.map