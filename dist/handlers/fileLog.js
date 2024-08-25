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
exports.FileLogger = void 0;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const moment_1 = __importDefault(require("moment"));
const errors_1 = require("./errors");
class FileLogger {
    constructor(levelConfigs, bufferSize = 100, flushInterval = 5000, maxFileSize = 5 * 1024 * 1024, retentionDays = 7) {
        this.levelConfigs = levelConfigs;
        this.logDirectories = new Map();
        this.logNames = new Map();
        this.currentLogFilePaths = new Map();
        this.logBuffers = new Map();
        this.intervals = {};
        this.bufferSize = bufferSize;
        this.flushInterval = flushInterval;
        this.maxFileSize = maxFileSize;
        this.retentionDays = retentionDays;
        Object.keys(this.levelConfigs).forEach(level => {
            const config = this.levelConfigs[level];
            const logDirectory = path.join(config.logDirectory);
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
    formatMessage(formatMsg) {
        // remove ANSI 控制碼（包括顏色、粗體、下劃線等）
        const ansiRegex = /\u001b\[[0-9;]*m/g;
        return formatMsg.replace(ansiRegex, "");
    }
    formatDate(message) {
        const searchValue = /{{(date):?(.*?)}}/g;
        message = message.replace(searchValue, (_, key, dateFormat) => {
            let value = "";
            switch (key) {
                case "date":
                    value = (0, moment_1.default)().format(dateFormat);
                    if (!value)
                        throw errors_1.LoggerError.InvalidDateFormat(value);
                    break;
                default:
                    break;
            }
            return value;
        });
        return message;
    }
    flushBuffer(level) {
        const buffer = this.logBuffers.get(level) || [];
        const logFilePath = this.currentLogFilePaths.get(level);
        if (!logFilePath)
            return;
        if (buffer.length === 0)
            return;
        const logContent = buffer.join("\n") + "\n";
        buffer.length = 0; // Clear the buffer
        fs.appendFile(logFilePath, logContent, (err) => {
            if (err) {
                errors_1.LoggerError.LogFileError(err);
            }
        });
    }
    startBufferFlush(level) {
        this.intervals[level] = setInterval(() => {
            this.flushBuffer(level);
        }, this.flushInterval);
    }
    getNewLogFilePath(level) {
        const logName = this.formatDate(this.logNames.get(level) || "{{date:YYYY-MM-DD}}.log");
        const logDirectory = this.logDirectories.get(level);
        return path.join(logDirectory || '', logName);
    }
    rotateFile(level) {
        const logFilePath = this.currentLogFilePaths.get(level);
        if (!logFilePath)
            return;
        fs.stat(logFilePath, (err, stats) => {
            if (err) {
                errors_1.LoggerError.LogFileError(err);
                if (!fs.existsSync(logFilePath)) {
                    fs.appendFile(logFilePath, "", (err) => {
                        if (err) {
                            errors_1.LoggerError.LogFileError(err);
                        }
                    });
                }
                return;
            }
            if (stats.size >= this.maxFileSize) {
                const rotatedFilePath = this.getRotatedFilePath(logFilePath);
                fs.rename(logFilePath, rotatedFilePath, (err) => {
                    if (err) {
                        errors_1.LoggerError.LogFileError(err);
                    }
                });
                this.currentLogFilePaths.set(level, this.getNewLogFilePath(level));
            }
        });
    }
    getRotatedFilePath(filePath) {
        let index = 1;
        let newFilePath = filePath.replace(/(\.log)$/, `_${index}$1`);
        while (fs.existsSync(newFilePath)) {
            index++;
            newFilePath = filePath.replace(/(\.log)$/, `_${index}$1`);
        }
        return newFilePath;
    }
    startFileRotation(level) {
        this.intervals[level] = setInterval(() => {
            this.rotateFile(level);
        }, this.flushInterval);
    }
    deleteOldLogs() {
        const now = Date.now();
        Object.values(this.logDirectories).forEach(directory => {
            const files = fs.readdirSync(directory);
            files.forEach((file) => {
                const filePath = path.join(directory, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        errors_1.LoggerError.LogFileError(err);
                        return;
                    }
                    const fileAge = now - stats.mtimeMs;
                    const retentionTime = this.retentionDays * 24 * 60 * 60 * 1000;
                    if (fileAge > retentionTime) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                errors_1.LoggerError.LogFileError(err);
                            }
                        });
                    }
                });
            });
        });
    }
    startLogCleanup() {
        setInterval(() => {
            this.deleteOldLogs();
        }, 24 * 60 * 60 * 1000); // 每天執行一次清理
    }
    shutdown() {
        // 停止接受
        this.log = () => {
            throw errors_1.LoggerError.LogShutdown();
        };
        // 清空緩衝區並清除計時
        Object.keys(this.levelConfigs).forEach(level => {
            this.flushBuffer(level);
            clearInterval(this.intervals[level]);
        });
        Object.keys(this.intervals).forEach(key => {
            const timerId = this.intervals[key];
            if (timerId)
                clearInterval(timerId);
        });
    }
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
    log(level, message, ...optionalParams) {
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
exports.FileLogger = FileLogger;
exports.default = FileLogger;
//# sourceMappingURL=fileLog.js.map