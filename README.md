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
            use: 'log',
            format: "[{{prefix.blue.underline.bold}}] {{date.gray.underline.bold:MM/DD HH:mm:ss}} {{msg.white}}",
            prefix: "LOG-INFO",
        },
        Info: {
            color: "white",
            use: 'info',
            format: "[{{prefix.blue.underline.bold}}] {{date.gray.underline.bold:MM/DD HH:mm:ss}} {{msg.white}}",
            prefix: "INFO",
            files: { // optional
                name: "info {{date:YYYY-MM-DD}}.log",
                logDirectory: "./logs/info"
            }
        },
        Error: {
            color: 'red',
            use: 'error',
            prefix: '[ERROR]',
            format: "{{prefix.bold}} {{date:HH:mm:ss}} {{msg}}"
        },
        Debug: {
            color: 'cyan',
            use: 'debug',
            prefix: '[DEBUG]',
            format: "{{prefix.bold}} {{date:HH:mm:ss}} {{msg}}"
        },
        Process:{
            // 使用 Process 物件來處理日誌輸出，也可以使用 function 來處理要輸出的方式
            // Use the Process object to handle log output, or use a function to handle the output method
            color: 'cyan',
            use: (msg)=>{ process.send(msg); },
            prefix: '[DEBUG]',
            format: "{{prefix.bold}} {{date:HH:mm:ss}} {{msg}}"
        }
    },
    files: { // optional
        logDirectory: "./logs",
        logName: "{{date:YYYY-MM-DD}}.log",
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
