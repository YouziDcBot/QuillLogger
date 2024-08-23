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
exports.QuillLog = void 0;
const moment_1 = __importDefault(require("moment"));
const color = __importStar(require("colors"));
const util_1 = __importDefault(require("util"));
const event_1 = require("./handlers/event");
const error_1 = require("./handlers/error");
const fileLog_1 = require("./handlers/fileLog");
color.enable();
/**
 * Quill logger class
 */
class QuillLog {
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
     *             format: "{{prefix.blue.bold}} {{date.gray:HH:mm:ss}}: {{msg}}"
     *         },
     *         Error: {
     *             color: 'red',
     *             use: 'error',
     *             prefix: '[ERROR]',
     *             format: "{{prefix.bold}} {{date:HH:mm:ss}}: {{msg}}"
     *         }
     *     },
     * // 即將推出(v0.2.0)
     * 	   files: {
     * 	       logDirectory: "./logs",
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
    constructor(options) {
        // super();
        this.emitter = new event_1.LoggerEventEmitter();
        this.Logger_debugMode = options.debug || false;
        this.Logger_format =
            options.format || "[{{prefix}}] {{date:HH:mm:ss}} {{msg}}";
        this.Logger_level =
            options.level ||
                {
                    Info: {
                        color: "white",
                        use: "info",
                    },
                };
        // events
        this.on = this.emitter.onEvent;
        this.once = this.emitter.onceEvent;
        this.off = this.emitter.offEvent;
        this.emit = this.emitter.emitEvent;
        // file log
        if (options.files) {
            this.filelogger = new fileLog_1.FileLogger(options.files.logDirectory, options.files.bufferSize, options.files.flushInterval, options.files.maxFileSize, options.files.retentionDays);
            Object.keys(this.Logger_level).forEach((l) => {
                this.on(l, (_level, _message, _optionalParams, _timestamp, formattedMessage) => {
                    var _a;
                    (_a = this.filelogger) === null || _a === void 0 ? void 0 : _a.log(formattedMessage);
                });
            });
        }
        // this
        this.QuillLog = this;
        // QuillLog.instance = this;
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
     * Quill log
     * @param {T} level The level of the log message
     * @param {string} message The log message
     * @param {any[]} [optionalParams] Options parameters
     * @example
     * quill.log('Log', 'hello %s!', 'world'); // -> 'hello world!'
     */
    log(level, message, ...optionalParams) {
        const levelConfig = this.Logger_level[level];
        if (!levelConfig)
            throw error_1.LoggerError.ValidLogLevel(level);
        // const date = moment().format(this.extractDateFormat());
        const formattedMessage = util_1.default.format(this.formatMessage(level, message), ...optionalParams);
        const timestamp = Date.now();
        const outputFn = console[levelConfig.use];
        outputFn(formattedMessage[levelConfig.color]);
        // Emit the log event
        this.emit(level, level, message, optionalParams, timestamp, formattedMessage);
    }
    formatMessage(level, message) {
        let formatted = this.Logger_level[level].format || this.Logger_format;
        const searchValue = /{{(prefix|level|msg|date)(?:\.([\w.]+))?:?(.*?)}}/g;
        formatted = formatted.replace(searchValue, (_, key, style, dateFormat) => {
            let value = "";
            if (this.Logger_debugMode)
                console.debug("Replacer: ", _, key, style, dateFormat);
            switch (key) {
                case "prefix":
                    value = this.Logger_level[level].prefix;
                    break;
                case "level":
                    value = level;
                    break;
                case "msg":
                    value = message;
                    break;
                case "date":
                    value = (0, moment_1.default)().format(dateFormat);
                    if (!value)
                        throw error_1.LoggerError.InvalidDateFormat(value);
                    break;
                default:
                    break;
            }
            if (style) {
                const styles = style.split(".");
                for (const s of styles) {
                    if (!value[s])
                        throw error_1.LoggerError.InvalidStyle(s);
                    value = value[s];
                }
            }
            return value;
        });
        return formatted;
    }
    /**
     * getInstance - get instance of Quill Log
     * @returns {QuillLog} The instance of Quill Log
     * @version v0.0.1
     * @deprecated v0.0.1 no longer supported
     */
    static getInstance() {
        throw error_1.LoggerError.NoLongerSupported();
        // if (!QuillLog.instance) throw LoggerError.NoExistingInstance();
        // return QuillLog.instance;
    }
}
exports.QuillLog = QuillLog;
Object.defineProperty(QuillLog, "default", {
    get() {
        return {
            __esModule: true,
            default: QuillLog,
            QuillLog: this,
        };
    },
});
exports.default = QuillLog;
//# sourceMappingURL=index.js.map