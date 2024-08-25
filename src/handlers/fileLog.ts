import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";
import moment from "moment";
import { LoggerError } from "./errors";

interface LevelConfig {
    logDirectory: string;
    logName: string;
}

class FileLogger {
    private logDirectories: Map<string, string> = new Map();
    private logNames: Map<string, string> = new Map();
	private currentLogFilePaths: Map<string, string> = new Map();
	private logBuffers: Map<string, string[]> = new Map();
    private bufferSize: number;
    private flushInterval: number;
    private maxFileSize: number;
    private retentionDays: number;
    private intervals: { [key: string]: NodeJS.Timeout | undefined } = {};

    constructor(
        private levelConfigs: { [level: string]: LevelConfig },
        bufferSize: number = 100,
        flushInterval: number = 5000,
        maxFileSize: number = 5 * 1024 * 1024,
        retentionDays: number = 7
    ) {
        this.bufferSize = bufferSize;
        this.flushInterval = flushInterval;
        this.maxFileSize = maxFileSize;
		this.retentionDays = retentionDays;
        Object.keys(this.levelConfigs).forEach(level => {
            const config = this.levelConfigs[level];
            const logDirectory = path.join(  process.cwd(),config.logDirectory);
            if (!fs.existsSync(logDirectory)) {
                fs.mkdirSync(logDirectory);
            }
            this.logDirectories.set(level, logDirectory);
            this.logNames.set(level, config.logName);
			this.currentLogFilePaths.set(level, this.getNewLogFilePath(level));
			this.logBuffers.set(level, []);
            this.startBufferFlush(level);
            this.startFileRotation(level);
        });

        this.startLogCleanup();
        this.handleProcessExit();
    }

    private formatMessage(formatMsg: string): string {
        // remove ANSI 控制碼（包括顏色、粗體、下劃線等）
        const ansiRegex = /\u001b\[[0-9;]*m/g;
        return formatMsg.replace(ansiRegex, "");
    }

    private formatDate(message: string): string {
        const searchValue = /{{(date):?(.*?)}}/g;
        message = message.replace(
            searchValue,
            (_, key: string, dateFormat: string) => {
                let value = "";
                switch (key) {
                    case "date":
                        value = moment().format(dateFormat);
                        if (!value) throw LoggerError.InvalidDateFormat(value);
                        break;
                    default:
                        break;
                }
                return value;
            }
        );
        return message;
    }

    private flushBuffer(level: string) {
        const buffer = this.logBuffers.get(level) || [];
        const logFilePath = this.currentLogFilePaths.get(level);
		if (!logFilePath) return;
		if (buffer.length === 0) return;

        const logContent = buffer.join("\n") + "\n";
        buffer.length = 0; // Clear the buffer

        fs.appendFile(logFilePath, logContent, (err) => {
            if (err) {
                LoggerError.LogFileError(err);
            }
        });
    }

    private startBufferFlush(level: string) {
        this.intervals[level] = setInterval(() => {
            this.flushBuffer(level);
        }, this.flushInterval);
    }

    private getNewLogFilePath(level: string): string {
        const logName = this.formatDate(this.logNames.get(level) || "{{date:YYYY-MM-DD}}.log");
        const logDirectory = this.logDirectories.get(level);
        return path.join(logDirectory || '', logName);
    }

    private rotateFile(level: string) {
        const logFilePath = this.currentLogFilePaths.get(level);
        if (!logFilePath) return;

        fs.stat(logFilePath, (err, stats) => {
            if (err) {
                LoggerError.LogFileError(err);
                if (!fs.existsSync(logFilePath)) {
                    fs.appendFile(logFilePath, "", (err) => {
                        if (err) {
                            LoggerError.LogFileError(err);
                        }
                    });
                }
                return;
            }

            if (stats.size >= this.maxFileSize) {
                const rotatedFilePath = this.getRotatedFilePath(logFilePath);
                fs.rename(logFilePath, rotatedFilePath, (err) => {
                    if (err) {
                        LoggerError.LogFileError(err);
                    }
                });

                this.currentLogFilePaths.set(level, this.getNewLogFilePath(level));
            }
        });
    }

    private getRotatedFilePath(filePath: string): string {
        let index = 1;
        let newFilePath = filePath.replace(/(\.log)$/, `_${index}$1`);

        while (fs.existsSync(newFilePath)) {
            index++;
            newFilePath = filePath.replace(/(\.log)$/, `_${index}$1`);
        }

        return newFilePath;
    }

    private startFileRotation(level: string) {
        this.intervals[level] = setInterval(() => {
            this.rotateFile(level);
        }, this.flushInterval);
    }

    private deleteOldLogs() {
        const now = Date.now();

        Object.values(this.logDirectories).forEach(directory => {
            const files = fs.readdirSync(directory);

            files.forEach((file) => {
                const filePath = path.join(directory, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        LoggerError.LogFileError(err);
                        return;
                    }

                    const fileAge = now - stats.mtimeMs;
                    const retentionTime = this.retentionDays * 24 * 60 * 60 * 1000;

                    if (fileAge > retentionTime) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                LoggerError.LogFileError(err);
                            }
                        });
                    }
                });
            });
        });
    }

    private startLogCleanup() {
        setInterval(() => {
            this.deleteOldLogs();
        }, 24 * 60 * 60 * 1000); // 每天執行一次清理
    }

    private shutdown() {
		// 停止接受
		this.log = () => {
			throw LoggerError.LogShutdown();
        };
        // 清空緩衝區並清除計時
        Object.keys(this.levelConfigs).forEach(level => {
            this.flushBuffer(level);
            clearInterval(this.intervals[level]);
        });

        Object.keys(this.intervals).forEach(key => {
            const timerId = this.intervals[key];
            if (timerId) clearInterval(timerId);
        });
    }

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

    log(level: string, message: string, ...optionalParams: any[]): void {
        let formattedMessage = this.formatMessage(message);
        if (optionalParams.length) {
            formattedMessage +=
                " " +
                optionalParams.map(param => JSON.stringify(param)).join("\n");
        }

        const buffer = this.logBuffers.get(level);
        if (buffer) {
            buffer.push(formattedMessage);

            if (buffer.length >= this.bufferSize) {
                this.flushBuffer(level);
            }
        }
    }
}

export default FileLogger;
export { FileLogger };
