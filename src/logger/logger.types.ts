export interface LogArgs {
    actor?: string;
    meta?: LogMeta;
    durationMs?: number;
}

export interface ErrorLogArgs extends LogArgs {
    err?: unknown;
}

export interface LoggerInstance {
    info: (message: string, args?: LogArgs) => void;
    warn: (message: string, args?: LogArgs) => void;
    error: (message: string, args?: ErrorLogArgs) => void;
    debug: (message: string, args?: LogArgs) => void;
    done: (message: string, args?: LogArgs) => void;
}

export interface LogMeta {
    [key: string]: unknown;
}

export interface LogInfo {
    timestamp?: string;
    level: string;
    message: string;
    actor?: string;
    meta?: LogMeta;
    durationMs?: number;
    stack?: string;
}
