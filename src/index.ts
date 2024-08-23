import moment from "moment";
import * as color from "colors";
import util from "util";

import { LoggerEventEmitter, LogListener } from "./handlers/event";
import { LoggerError } from "./handlers/error";
import { FileLogger } from "./handlers/fileLog";

color.enable();
// moment.locale('en_us');

interface LoggerOptions<T extends string = string> {
	format?: string;
	debug?: boolean;
	level?: Level<T>;
	files?: {
		logDirectory: string;
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
	};
};

/**
 * Quill logger class
 */
class QuillLog<T extends string> {
	private Logger_format: string;
	private Logger_level: Level<T>;
	private emitter: LoggerEventEmitter<T>;
	private Logger_debugMode: boolean;
	// private static instance: Quill<any>;
	public QuillLog: QuillLog<any>;

	public on: (event: T, listener: LogListener<T>) => void;
	public once: (event: T, listener: LogListener<T>) => void;
	public off: (event: T, listener: LogListener<T>) => void;
	private emit: (level: T, ...args: any) => void;
	public filelogger?: FileLogger;

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
	constructor(options: LoggerOptions<T>) {
		// super();
		this.emitter = new LoggerEventEmitter();
		this.Logger_debugMode = options.debug || false;
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
			this.filelogger = new FileLogger(
				options.files.logDirectory,
				options.files.bufferSize,
				options.files.flushInterval,
				options.files.maxFileSize,
				options.files.retentionDays
			);
			Object.keys(this.Logger_level).forEach((l) => {
				this.on(l as T, (_level, _message, _optionalParams, _timestamp, formattedMessage) => {
					this.filelogger?.log(formattedMessage);
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
	public log(level: T, message?: any, ...optionalParams: any[]): void {
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

	private formatMessage(level: T, message: string): string {
		let formatted = this.Logger_level[level].format || this.Logger_format;

		const searchValue =
			/{{(prefix|level|msg|date)(?:\.([\w.]+))?:?(.*?)}}/g;

		formatted = formatted.replace(
			searchValue,
			(_, key: string, style: string, dateFormat: string) => {
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
						value = moment().format(dateFormat);
						if (!value) throw LoggerError.InvalidDateFormat(value);
						break;
					default:
						break;
				}

				if (style) {
					const styles = style.split(".");
					for (const s of styles) {
						if (!(value as any)[s])
							throw LoggerError.InvalidStyle(s);
						value = (value as any)[s];
					}
				}
				return value;
			}
		);

		return formatted;
	}

	/**
	 * getInstance - get instance of Quill Log
	 * @returns {QuillLog} The instance of Quill Log
	 * @version v0.0.1
	 * @deprecated v0.0.1 no longer supported
	 */
	public static getInstance(): QuillLog<any> {
		throw LoggerError.NoLongerSupported();
		// if (!QuillLog.instance) throw LoggerError.NoExistingInstance();
		// return QuillLog.instance;
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
