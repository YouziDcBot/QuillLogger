export class LoggerError extends Error {
	static NoLongerSupported(): LoggerError {
		return new LoggerError("This method is no longer supported");
	}
	static ValidLogLevel(level: string): LoggerError {
		return new LoggerError(`${level} is not a valid log level`);
	}
	static InvalidDateFormat(input: string | undefined): LoggerError {
		return new LoggerError(`Invalid date format: ${input || "unknown"}`);
	}
	static InvalidStyle(style: string): LoggerError {
		return new LoggerError(`Invalid style: ${style}`);
	}
	/** @deprecated getInstance() is no longer supported */
	static NoExistingInstance(): LoggerError {
		return new LoggerError("No existing instance of Quill");
	}
	static InvalidThisInstance(): LoggerError {
		return new LoggerError(
			`The log method was called with an incorrect \`this\` context. 
Did you forget to bind the method to the correct class instance? 
E.g. \`this.log = quill.log.bind(quill)\`, where \`quill\` is the return value of \`new QuillLog()\``
		);
	}
	static LogFileError(err: NodeJS.ErrnoException): LoggerError {
		return new LoggerError(
			`Failed at log file: ${err.message} \n${JSON.stringify(err)}`
		);
	}
	static LogShutdown(): LoggerError {
		return new LoggerError("Logger was shut down");
	}

	private constructor(message: string) {
		super(message);
		this.name = "Quill#LoggerError";
	}
}
