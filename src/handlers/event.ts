// handlers/event.ts
import { EventEmitter } from 'events';

export interface LoggerEvent<T extends string> {
    level: T;
    message: string;
    optionalParams: any[],
    timestamp: number;
    formattedMessage: string;
}
export type LogListener<T extends string> = (
    level: T,
    message: string,
    optionalParams: any[],
    timestamp: string,
    formattedMessage: string
) => void;

const eventLogger = new EventEmitter();
/**
 * Custom event emitter for the Logger class.
 * @template T - The type of event level.
 */
export class LoggerEventEmitter<T extends string> {
    /**
     * Emits a logging event.
     * @param {T} event - The level of the logging event.
     * @param {LoggerEvent<T>} args - The logging event to emit.
     * @returns {boolean} - Whether the event
     */
    emitEvent(event: T, ...args: any): boolean {
        return eventLogger.emit(`Logger_${event}`, ...args);
    }

    /**
     * Registers a listener for a specific logging event level.
     * @param {T} event - The level of the logging event.
     * @param {LogListener<T>} listener - The listener function to call when the event is emitted.
     * @returns {listener}
     */
    onEvent(event: T, listener: LogListener<T>): LogListener<T> {
        eventLogger.on(`Logger_${event}`, listener);
        return listener;
    }

    /**
     * Registers a one-time listener for a specific logging event level.
     * @param {T} event - The level of the logging event.
     * @param {LogListener<T>} listener - The listener function to call when the event is emitted.
     * @returns {LogListener<T>}
     */
    onceEvent(event: T, listener: LogListener<T>): LogListener<T> {
        eventLogger.once(`Logger_${event}`, listener);
        return listener;
    }

    /**
     * Removes a listener for a specific logging event level.
     * @param {T} event - The level of the logging event.
     * @param {LogListener<T>} listener - The listener function to remove.
     * @returns {EventEmitter}
     */
    offEvent(event: T, listener: LogListener<T>): EventEmitter {
        return eventLogger.off(`Logger_${event}`, listener);
    }

}