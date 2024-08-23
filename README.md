<p>
    <h1 align="center"> <img src="QuillLog.png" alt="Quill Logger" width="50" height="50" style="border-radius: 50%; vertical-align: middle;">
     Quill Logger</h1>
</p>

Welcome to the Quill Logger project!

## Description

This project aims to provide a logging solution for Discord bot Project. It allows you to easily log important events and messages for debugging and analysis purposes.

## Features

-   Log message events
-   Log error events
-   Customize log format
-   Save logs to file (coming soon)

## Installation

To install the logger module, simply run the following command:

```
npm install https://github.com/YouziDcBot/QuillLogger.git
```

## Usage

To use the logger module in your Discord bot, follow these steps:

```javascript
// Usage example
const q = new QuillLog({
	format: "[{{prefix.gray}}] {{level}} {{date.gray:HH:mm:ss}}: {{msg}}",
	level: {
		Log: {
			color: "white",
			use: "log",
			prefix: "INFO",
			format: "[{{prefix.blue.underline}}] {{date.gray:HH:mm:ss}: {{msg}}",
		},
		Error: {
			color: "red",
			use: "error",
			prefix: "[ERROR]",
			format: "{{prefix.bold}} {{date:HH:mm:ss} {{msg}}",
		},
	},
	// 即將推出(v0.2.0)
	files: {
        logDirectory: "./logs",
        bufferSize: 100,
        flushInterval: 1000,
        maxFileSize: 1000,
        retentionDays: 10
    }
});
q.log("Log", "hello world");

// Now only the defined levels can be used
q.log("Log", "This is an informational message.");
q.log("Error", "This is an error message.");
// q.log('Debug', "This will throw an error because 'Debug' is not defined.");
```

## Contributing

Contributions are welcome! If you have any ideas or suggestions for improving this project, please feel free to submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
