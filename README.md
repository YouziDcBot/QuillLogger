# README

Welcome to the logger project!

## Description

This project aims to provide a logging solution for your Discord bot. It allows you to easily log important events and messages for debugging and analysis purposes.

## Features

- Log message events
- Log error events
- Customize log format
- Save logs to file

## Installation

To install the logger module, simply run the following command:

```
npm install https://github.com/YouziDcBot/LoggerLight.git
```

## Usage

To use the logger module in your Discord bot, follow these steps:

```javascript
// Usage example
const log = new Logger({
    format: "[{{level}}] {{date:HH:mm:ss}} {{msg}}",
    level: {
        Log: {
            color: 'white',
            use: 'log'
        },
        Error: {
            color: 'red',
            use: 'error'
        }
    }
});

// Now only the defined levels can be used
log.log('Log', "This is an informational message.");
log.log('Error', "This is an error message.");
// log.log('Debug', "This will throw an error because 'Debug' is not defined.");
```

## Contributing

Contributions are welcome! If you have any ideas or suggestions for improving this project, please feel free to submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
