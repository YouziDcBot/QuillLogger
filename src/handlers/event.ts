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

/**
 * Custom event emitter for the Logger class.
 * @template T - The type of event level.
 */
export class LoggerEventEmitter<T extends string> extends EventEmitter {
    /**
     * Emits a logging event.
     * @param {T} event - The level of the logging event.
     * @param {LoggerEvent<T>} args - The logging event to emit.
     * @returns {void}
     */
    emitEvent(event: T, ...args: any): void {
        if (!event.startsWith('Logger_'))
            this.emit(`Logger_${event}`, ...args);
    }

    /**
     * Registers a listener for a specific logging event level.
     * @param {T} event - The level of the logging event.
     * @param {LogListener<T>} listener - The listener function to call when the event is emitted.
     * @returns {void}
     */
    onEvent(event: T, listener: LogListener<T>): void {
        this.on(`Logger_${event}`, listener);
    }

    /**
     * Registers a one-time listener for a specific logging event level.
     * @param {T} event - The level of the logging event.
     * @param {LogListener<T>} listener - The listener function to call when the event is emitted.
     * @returns {void}
     */
    onceEvent(event: T, listener: LogListener<T>): void {
        this.once(`Logger_${event}`, listener);
    }

    /**
     * Removes a listener for a specific logging event level.
     * @param {T} event - The level of the logging event.
     * @param {LogListener<T>} listener - The listener function to remove.
     * @returns {void}
     */
    offEvent(event: T, listener: LogListener<T>): void {
        this.off(`Logger_${event}`, listener);
    }

}