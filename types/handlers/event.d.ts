export interface LoggerEvent<T extends string> {
    level: T;
    message: string;
    optionalParams: any[];
    timestamp: number;
    formattedMessage: string;
}
export type LogListener<T extends string> = (level: T, message: string, optionalParams: any[], timestamp: string, formattedMessage: string) => void;
/**
 * Custom event emitter for the Logger class.
 * @template T - The type of event level.
 */
export declare class LoggerEventEmitter<T extends string> {
    /**
     * Emits a logging event.
     * @param {T} event - The level of the logging event.
     * @param {LoggerEvent<T>} args - The logging event to emit.
     * @returns {void}
     */
    emitEvent(event: T, ...args: any): void;
    /**
     * Registers a listener for a specific logging event level.
     * @param {T} event - The level of the logging event.
     * @param {LogListener<T>} listener - The listener function to call when the event is emitted.
     * @returns {void}
     */
    onEvent(event: T, listener: LogListener<T>): void;
    /**
     * Registers a one-time listener for a specific logging event level.
     * @param {T} event - The level of the logging event.
     * @param {LogListener<T>} listener - The listener function to call when the event is emitted.
     * @returns {void}
     */
    onceEvent(event: T, listener: LogListener<T>): void;
    /**
     * Removes a listener for a specific logging event level.
     * @param {T} event - The level of the logging event.
     * @param {LogListener<T>} listener - The listener function to remove.
     * @returns {void}
     */
    offEvent(event: T, listener: LogListener<T>): void;
}
//# sourceMappingURL=event.d.ts.map