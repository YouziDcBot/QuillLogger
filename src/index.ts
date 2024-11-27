import moment from "moment";
import * as color from "colors";
import util from "util";

import { LoggerEventEmitter, LogListener } from "./handlers/event";
import { LoggerError } from "./handlers/errors";
import { FileLogger } from "./handlers/fileLog";

color.enable();
// moment.locale('en_us');

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

interface LevelConfig {
	logDirectory: string;
	logName: string;
}

/**
 * Quill logger class
 * Quill 日誌類
 * @template T
 */
class QuillLog<T extends string> {
	private Logger_format: string;
	private Logger_level: Level<T>;
	private emitter: LoggerEventEmitter<T>;
	private Logger_debugMode: boolean;
	private Logger_events: { [key: string]: LogListener<T> } = {};
	// private static instance: Quill<any>;
	public QuillLog: QuillLog<any>;

	on: (event: T, listener: LogListener<T>) => LogListener<T>;
	once: (event: T, listener: LogListener<T>) => LogListener<T>;
	off: (event: T, listener: LogListener<T>) => import("events");
	emit: (event: T, ...args: any) => boolean;

	public filelogger?: FileLogger;

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
	constructor(options: LoggerOptions<T>) {
		// super();
		this.emitter = new LoggerEventEmitter();
		this.Logger_debugMode = options.debug || false;
		if (this.Logger_debugMode) {
			console.debug("QuillLog: Debug mode enabled");
		}
		this.Logger_format =
			options.format || "[{{prefix}}] {{date:HH:mm:ss}} {{msg}}";
		this.Logger_level =
			options.level ||
			({
				Info: {
					color: "white",
					use: "info",
				},
			} as Level<T>);

		// events
		this.on = this.emitter.onEvent;
		this.once = this.emitter.onceEvent;
		this.off = this.emitter.offEvent;
		this.emit = this.emitter.emitEvent;
		// file log
		if (options.files) {
			// 提取 LevelConfig 配置
			const levelConfigs: { [level: string]: LevelConfig } = {};
			Object.keys(this.Logger_level).forEach((level) => {
				const levelConfig = this.Logger_level[level as T];
				levelConfigs[level] = {
					logDirectory:
						levelConfig.files?.logDirectory ||
						options.files?.logDirectory ||
						"log",
					logName:
						levelConfig.files?.name ||
						options.files?.logName ||
						"{{date:YYYY-MM-DD}}.log",
				};
			});
			this.filelogger = new FileLogger(levelConfigs);
			// 註冊檔案日誌事件
			Object.keys(this.Logger_level).forEach((level) => {
				const e = this.on(
					level as T,
					(
						level,
						_message,
						_optionalParams,
						_timestamp,
						formatMessage
					) => {
						this.filelogger?.log(level, formatMessage);
					}
				);
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
	public log(level: T, message?: any, ...optionalParams: any[]): void {
		if (!(this instanceof QuillLog)) {
			throw LoggerError.InvalidThisInstance();
		}
		const levelConfig = this.Logger_level[level];
		if (!levelConfig) throw LoggerError.ValidLogLevel(level);

		// const date = moment().format(this.extractDateFormat());
		const formattedMessage = util.format(
			this.formatMessage(level, message),
			...optionalParams
		);
		const timestamp = Date.now();
		const outputFn = console[levelConfig.use] as (...args: any[]) => void;
		outputFn(formattedMessage[levelConfig.color]);

		// Emit the log event
		this.emit(
			level,
			level,
			message,
			optionalParams,
			timestamp,
			formattedMessage
		);
	}

	/**
	 * Format the log message
	 * 格式化日誌消息
	 * @param {T} level The level of the log message 日誌消息的級別
	 * @param {string} message The log message 日誌消息
	 * @returns {string} The formatted log message 格式化的日誌消息
	 */
	private formatMessage(level: T = "" as T, message: string): string {
		let formatted = this.Logger_level[level]?.format || this.Logger_format;

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
					value = moment().format(dateFormat);
					if (!value) throw LoggerError.InvalidDateFormat(value);
					break;
				default:
					break;
			}

			for (const style of styles) {
				if (!(value as any)[style])
					throw LoggerError.InvalidStyle(style);
				value = (value as any)[style];
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
	public static getInstance(): QuillLog<any> {
		throw LoggerError.NoLongerSupported();
		// if (!QuillLog.instance) throw LoggerError.NoExistingInstance();
		// return QuillLog.instance;
	}

	/**
	 * Shutdown the logger
	 * 關閉日誌記錄器
	 */
	private shutdown(): void {
		Object.keys(this.Logger_level).forEach((level) => {
			if (this.Logger_events[level as T] !== undefined)
				this.off(
					level as T,
					this.Logger_events[level as T] as LogListener<T>
				);
		});
	}

	/**
	 * Handle process exit events
	 * 處理進程退出事件
	 */
	private handleProcessExit() {
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

Object.defineProperty(QuillLog, "default", {
	get() {
		return {
			__esModule: true,
			default: QuillLog,
			QuillLog: this,
		};
	},
});

export default QuillLog;
export { QuillLog };
