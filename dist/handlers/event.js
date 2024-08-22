"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerEventEmitter = void 0;
// handlers/event.ts
const events_1 = require("events");
/**
 * Custom event emitter for the Logger class.
 * @template T - The type of event level.
 */
class LoggerEventEmitter extends events_1.EventEmitter {
    /**
     * Emits a logging event.
     * @param {T} event - The level of the logging event.
     * @param {LoggerEvent<T>} args - The logging event to emit.
     * @returns {void}
     */
    emitEvent(event, ...args) {
        if (!event.startsWith('Logger_'))
            this.emit(`Logger_${event}`, ...args);
    }
    /**
     * Registers a listener for a specific logging event level.
     * @param {T} event - The level of the logging event.
     * @param {LogListener<T>} listener - The listener function to call when the event is emitted.
     * @returns {void}
     */
    onEvent(event, listener) {
        this.on(`Logger_${event}`, listener);
    }
    /**
     * Registers a one-time listener for a specific logging event level.
     * @param {T} event - The level of the logging event.
     * @param {LogListener<T>} listener - The listener function to call when the event is emitted.
     * @returns {void}
     */
    onceEvent(event, listener) {
        this.once(`Logger_${event}`, listener);
    }
    /**
     * Removes a listener for a specific logging event level.
     * @param {T} event - The level of the logging event.
     * @param {LogListener<T>} listener - The listener function to remove.
     * @returns {void}
     */
    offEvent(event, listener) {
        this.off(`Logger_${event}`, listener);
    }
}
exports.LoggerEventEmitter = LoggerEventEmitter;
//# sourceMappingURL=event.js.map