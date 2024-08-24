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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLogger = void 0;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const zlib = __importStar(require("node:zlib"));
const errors_1 = require("./errors");
class FileLogger {
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
    constructor(logDirectory = "logs", bufferSize = 100, flushInterval = 5000, maxFileSize = 5 * 1024 * 1024, retentionDays = 7) {
        this.buffer = [];
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
    formatMessage(formatMsg) {
        // remove ANSI 控制碼（包括顏色、粗體、下劃線等）
        const ansiRegex = /\u001b\[[0-9;]*m/g;
        return formatMsg.replace(ansiRegex, "");
    }
    flushBuffer() {
        if (this.buffer.length > 0) {
            const logContent = this.buffer.join("\n") + "\n";
            this.buffer = [];
            fs.appendFile(this.currentLogFilePath, logContent, (err) => {
                if (err) {
                    errors_1.LoggerError.LogFileError(err);
                }
            });
        }
    }
    startBufferFlush() {
        setInterval(() => {
            this.flushBuffer();
        }, this.flushInterval);
    }
    getNewLogFilePath() {
        const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        return path.join(this.logDirectory, `${timestamp}.log`);
    }
    rotateFile() {
        fs.stat(this.currentLogFilePath, (err, stats) => {
            if (err) {
                errors_1.LoggerError.LogFileError(err);
                if (!fs.existsSync(this.currentLogFilePath)) {
                    fs.appendFile(this.currentLogFilePath, "", (err) => {
                        if (err) {
                            errors_1.LoggerError.LogFileError(err);
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
                    .on("finish", (err) => {
                    if (err) {
                        errors_1.LoggerError.LogFileError(err);
                        return;
                    }
                    fs.unlink(this.currentLogFilePath, (err) => {
                        if (err) {
                            errors_1.LoggerError.LogFileError(err);
                        }
                    });
                });
                this.currentLogFilePath = this.getNewLogFilePath();
            }
        });
    }
    startFileRotation() {
        setInterval(() => {
            this.rotateFile();
        }, this.flushInterval);
    }
    deleteOldLogs() {
        const files = fs.readdirSync(this.logDirectory);
        const now = Date.now();
        files.forEach((file) => {
            const filePath = path.join(this.logDirectory, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    errors_1.LoggerError.LogFileError(err);
                    return;
                }
                const fileAge = now - stats.mtimeMs;
                const retentionTime = this.retentionDays * 24 * 60 * 60 * 1000; // days to milliseconds
                if (fileAge > retentionTime) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            errors_1.LoggerError.LogFileError(err);
                        }
                    });
                }
            });
        });
    }
    startLogCleanup() {
        setInterval(() => {
            this.deleteOldLogs();
        }, 24 * 60 * 60 * 1000); // 每天執行一次清理
    }
    log(message, ...optionalParams) {
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
exports.FileLogger = FileLogger;
exports.default = FileLogger;
//# sourceMappingURL=fileLog.js.map