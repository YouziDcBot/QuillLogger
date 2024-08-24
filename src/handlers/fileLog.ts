import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";

import { LoggerError } from "./errors";

class FileLogger {
	private logDirectory: string;
	private currentLogFilePath: string;
	private buffer: string[] = [];
	private bufferSize: number;
	private flushInterval: number;
	private maxFileSize: number;
	private retentionDays: number;

	/**
	 *
	 * @param logDirectory The directory where log files will be stored.
	 * @param bufferSize The number of log messages to buffer before flushing to the log file.
	 * @param flushInterval The interval (in milliseconds) at which the log buffer will be flushed to the log file.
	 * @param maxFileSize The maximum size (in bytes) of a log file before it is rotated and compressed.
	 * @param retentionDays The number of days to retain log files before deleting them.
	 * @version v0.2.0 - 即將推出
	 * @summary 這是一個簡單的文件記錄器，用於將日誌消息寫入文件。它支持日誌文件的旋轉和壓縮，以及舊日誌文件的刪除。
	 * @example
	 * // nothing here :/
	 *
	 */
	constructor(
		logDirectory: string = "logs",
		bufferSize: number = 100,
		flushInterval: number = 5000,
		maxFileSize: number = 5 * 1024 * 1024,
		retentionDays: number = 7
	) {
		this.logDirectory = path.join(__dirname, "../..", logDirectory);
		if (!fs.existsSync(this.logDirectory)) {
			fs.mkdirSync(this.logDirectory);
		}
		this.currentLogFilePath = this.getNewLogFilePath();
		this.bufferSize = bufferSize;
		this.flushInterval = flushInterval;
		this.maxFileSize = maxFileSize;
		this.retentionDays = retentionDays;
		this.startBufferFlush();
		this.startFileRotation();
		this.startLogCleanup();
	}

	private formatMessage(formatMsg: string): string {
		// remove ANSI 控制碼（包括顏色、粗體、下劃線等）
		const ansiRegex = /\u001b\[[0-9;]*m/g;
		return formatMsg.replace(ansiRegex, "");
	}

	private flushBuffer() {
		if (this.buffer.length > 0) {
			const logContent = this.buffer.join("\n") + "\n";
			this.buffer = [];
			fs.appendFile(this.currentLogFilePath, logContent, (err) => {
				if (err) {
					LoggerError.LogFileError(err)
				}
			});
		}
	}

	private startBufferFlush() {
		setInterval(() => {
			this.flushBuffer();
		}, this.flushInterval);
	}

	private getNewLogFilePath(): string {
		const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
		return path.join(this.logDirectory, `${timestamp}.log`);
	}

	private rotateFile() {
		fs.stat(this.currentLogFilePath, (err, stats) => {
			if (err) {
				LoggerError.LogFileError(err)
				if (!fs.existsSync(this.currentLogFilePath)) {
					fs.appendFile(this.currentLogFilePath, "", (err) => {
						if (err) {
							LoggerError.LogFileError(err)
						}
					});
				}
				return;
			}

			if (stats.size >= this.maxFileSize) {
				const gzippedFilePath = `${this.currentLogFilePath}.gz`;
				const readStream = fs.createReadStream(this.currentLogFilePath);
				const writeStream = fs.createWriteStream(gzippedFilePath);
				const gzip = zlib.createGzip();

				readStream
					.pipe(gzip)
					.pipe(writeStream)
					.on("finish", (err: any) => {
						if (err) {
							LoggerError.LogFileError(err)
							return;
						}
						fs.unlink(this.currentLogFilePath, (err) => {
							if (err) {
								LoggerError.LogFileError(err)
							}
						});
					});

				this.currentLogFilePath = this.getNewLogFilePath();
			}
		});
	}

	private startFileRotation() {
		setInterval(() => {
			this.rotateFile();
		}, this.flushInterval);
	}

	private deleteOldLogs() {
		const files = fs.readdirSync(this.logDirectory);
		const now = Date.now();

		files.forEach((file) => {
			const filePath = path.join(this.logDirectory, file);
			fs.stat(filePath, (err, stats) => {
				if (err) {
					LoggerError.LogFileError(err)
					return;
				}

				const fileAge = now - stats.mtimeMs;
				const retentionTime = this.retentionDays * 24 * 60 * 60 * 1000; // days to milliseconds

				if (fileAge > retentionTime) {
					fs.unlink(filePath, (err) => {
						if (err) {
							LoggerError.LogFileError(err)
						}
					});
				}
			});
		});
	}

	private startLogCleanup() {
		setInterval(() => {
			this.deleteOldLogs();
		}, 24 * 60 * 60 * 1000); // 每天執行一次清理
	}

	log(message: string, ...optionalParams: any[]): void {
		let formattedMessage = this.formatMessage(message);
		if (optionalParams.length) {
			formattedMessage +=
				" " +
				optionalParams.map((param) => JSON.stringify(param)).join("\n");
		}
		this.buffer.push(formattedMessage);

		if (this.buffer.length >= this.bufferSize) {
			this.flushBuffer();
		}
	}
}

export default FileLogger;
export { FileLogger };
