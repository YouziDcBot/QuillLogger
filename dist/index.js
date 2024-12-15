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
const errors_1 = require("./handlers/errors");
const fileLog_1 = require("./handlers/fileLog");
color.enable();
/**
 * Quill logger class
 * Quill 日誌類
 * @template T
 */
class QuillLog {
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
    constructor(options) {
        this.Logger_events = {};
        // super();
        this.emitter = new event_1.LoggerEventEmitter();
        this.Logger_debugMode = options.debug || false;
        if (this.Logger_debugMode) {
            console.debug("QuillLog: Debug mode enabled");
        }
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
            // 提取 LevelConfig 配置
            const levelConfigs = {};
            Object.keys(this.Logger_level).forEach((level) => {
                var _a, _b, _c, _d;
                const levelConfig = this.Logger_level[level];
                levelConfigs[level] = {
                    logDirectory: ((_a = levelConfig.files) === null || _a === void 0 ? void 0 : _a.logDirectory) ||
                        ((_b = options.files) === null || _b === void 0 ? void 0 : _b.logDirectory) ||
                        "log",
                    logName: ((_c = levelConfig.files) === null || _c === void 0 ? void 0 : _c.name) ||
                        ((_d = options.files) === null || _d === void 0 ? void 0 : _d.logName) ||
                        "{{date:YYYY-MM-DD}}.log",
                };
            });
            this.filelogger = new fileLog_1.FileLogger(levelConfigs);
            // 註冊檔案日誌事件
            Object.keys(this.Logger_level).forEach((level) => {
                const e = this.on(level, (level, _message, _optionalParams, _timestamp, formatMessage) => {
                    var _a;
                    (_a = this.filelogger) === null || _a === void 0 ? void 0 : _a.log(level, formatMessage);
                });
                this.Logger_events[level] = e;
            });
        }
        this.handleProcessExit();
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
     * Quill 日誌
     * @param {T} level The level of the log message 日誌消息的級別
     * @param {string} message The log message 日誌消息
     * @param {any[]} [optionalParams] Options parameters 可選參數
     * @example
     * quill.log('Log', 'hello %s!', 'world'); // -> 'hello world!'
     */
    log(level, message, ...optionalParams) {
        if (!(this instanceof QuillLog)) {
            throw errors_1.LoggerError.InvalidThisInstance();
        }
        const levelConfig = this.Logger_level[level];
        if (!levelConfig)
            throw errors_1.LoggerError.ValidLogLevel(level);
        // const date = moment().format(this.extractDateFormat());
        const formattedMessage = util_1.default.format(this.formatMessage(level, message), ...optionalParams);
        const timestamp = Date.now();
        const outputFn = typeof levelConfig.use == "string"
            ? console[levelConfig.use]
            : levelConfig.use;
        outputFn(formattedMessage[levelConfig.color]);
        // Emit the log event
        this.emit(level, level, message, optionalParams, timestamp, formattedMessage);
    }
    /**
     * Format the log message
     * 格式化日誌消息
     * @param {T} level The level of the log message 日誌消息的級別
     * @param {string} message The log message 日誌消息
     * @returns {string} The formatted log message 格式化的日誌消息
     */
    formatMessage(level = "", message) {
        var _a;
        let formatted = ((_a = this.Logger_level[level]) === null || _a === void 0 ? void 0 : _a.format) || this.Logger_format;
        const searchValue = /{{[^\{\}\n]*}}/g;
        formatted = formatted.replace(searchValue, (match) => {
            let content = match.slice(2, -2).trim();
            let [key, ...styles] = content.split(".");
            let dateFormat = "";
            if (key === "date") {
                const dateStyle = styles.pop();
                if (dateStyle && dateStyle.includes(":")) {
                    const parts = dateStyle.split(":");
                    styles.push(parts[0]);
                    dateFormat = parts.slice(1).join(":");
                }
            }
            let value = "";
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
                        throw errors_1.LoggerError.InvalidDateFormat(value);
                    break;
                default:
                    break;
            }
            for (const style of styles) {
                if (!value[style])
                    throw errors_1.LoggerError.InvalidStyle(style);
                value = value[style];
            }
            return value;
        });
        return formatted;
    }
    /**
     * getInstance - get instance of Quill Log
     * 獲取 Quill 日誌的實例
     * @returns {QuillLog} The instance of Quill Log Quill 日誌的實例
     * @version v0.0.1
     * @deprecated v0.0.1 no longer supported 不再支持
     */
    static getInstance() {
        throw errors_1.LoggerError.NoLongerSupported();
        // if (!QuillLog.instance) throw LoggerError.NoExistingInstance();
        // return QuillLog.instance;
    }
    /**
     * Shutdown the logger
     * 關閉日誌記錄器
     */
    shutdown() {
        Object.keys(this.Logger_level).forEach((level) => {
            if (this.Logger_events[level] !== undefined)
                this.off(level, this.Logger_events[level]);
        });
    }
    /**
     * Handle process exit events
     * 處理進程退出事件
     */
    handleProcessExit() {
        process.on("exit", () => {
            this.shutdown();
        });
        process.on("SIGINT", () => {
            this.shutdown();
        });
        process.on("SIGTERM", () => {
            this.shutdown();
        });
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