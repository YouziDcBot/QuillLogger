"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerEventEmitter = void 0;
// handlers/event.ts
const events_1 = require("events");
const eventLogger = new events_1.EventEmitter();
/**
 * Custom event emitter for the Logger class.
 * @template T - The type of event level.
 */
class LoggerEventEmitter {
    /**
     * Emits a logging event.
     * @param {T} event - The level of the logging event.
     * @param {LoggerEvent<T>} args - The logging event to emit.
     * @returns {boolean} - Whether the event
     */
    emitEvent(event, ...args) {
        return eventLogger.emit(`Logger_${event}`, ...args);
    }
    /**
     * Registers a listener for a specific logging event level.
     * @param {T} event - The level of the logging event.
     * @param {LogListener<T>} listener - The listener function to call when the event is emitted.
     * @returns {listener}
     */
    onEvent(event, listener) {
        eventLogger.on(`Logger_${event}`, listener);
        return listener;
    }
    /**
     * Registers a one-time listener for a specific logging event level.
     * @param {T} event - The level of the logging event.
     * @param {LogListener<T>} listener - The listener function to call when the event is emitted.
     * @returns {LogListener<T>}
     */
    onceEvent(event, listener) {
        eventLogger.once(`Logger_${event}`, listener);
        return listener;
    }
    /**
     * Removes a listener for a specific logging event level.
     * @param {T} event - The level of the logging event.
     * @param {LogListener<T>} listener - The listener function to remove.
     * @returns {EventEmitter}
     */
    offEvent(event, listener) {
        return eventLogger.off(`Logger_${event}`, listener);
    }
}
exports.LoggerEventEmitter = LoggerEventEmitter;
//# sourceMappingURL=event.js.map