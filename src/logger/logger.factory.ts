import { winstonLogger } from './logger.config.js';
import type { ErrorLogArgs, LogArgs, LoggerInstance } from './logger.types.js';

const extractError = (err: unknown): Partial<LogArgs & { stack: string }> => {
    if (err instanceof Error) {
        return {
            meta: { err: err.message },
            stack: err.stack
        };
    }
    if (err !== undefined) {
        return { meta: { err } };
    }
    return {};
};

/**
 * Log an info message.
 */
const info = (message: string, args: LogArgs = {}): void => {
    winstonLogger.info(message, args);
};

/**
 * Log an info message.
 */
const done = (message: string, args: LogArgs = {}): void => {
    winstonLogger.info(message, args);
};

/**
 * Log a warning message.
 */
const warn = (message: string, args: LogArgs = {}): void => {
    winstonLogger.warn(message, args);
};

/**
 * Log an error message. Pass err to include the message and stack trace.
 */
const error = (message: string, args: ErrorLogArgs = {}): void => {
    const { err, meta, ...rest } = args;
    const errFields = extractError(err);

    winstonLogger.error(message, {
        ...rest,
        stack: errFields.stack,
        meta: { ...meta, ...errFields.meta }
    });
};

/**
 * Log a debug message. Only emitted in non-production environments.
 */
const debug = (message: string, args: LogArgs = {}): void => {
    winstonLogger.debug(message, args);
};

/**
 * Creates a logger pre-bound to a context (actor).
 * Every call on the child automatically includes the actor — no need to pass it each time.
 */
const child = (defaults: { actor: string }): LoggerInstance => {
    const withDefaults = (args: LogArgs = {}): LogArgs => ({
        ...args,
        actor: args.actor ?? defaults.actor
    });

    return {
        info: (message, args) => info(message, withDefaults(args)),
        warn: (message, args) => warn(message, withDefaults(args)),
        error: (message, args) =>
            error(message, { ...withDefaults(args), err: args?.err }),
        debug: (message, args) => debug(message, withDefaults(args)),
        done: (message, args) => done(message, withDefaults(args))
    };
};

export const logger: LoggerInstance & { child: typeof child } = {
    info,
    warn,
    error,
    debug,
    child,
    done
};
