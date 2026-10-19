import winston from 'winston';

import { type LogInfo } from './logger.types.js';
import { LogColor, LogLevel } from './logger.constants.js';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const levels: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 4
};

const colors: Record<LogLevel, LogColor> = {
    error: LogColor.RED,
    warn: LogColor.YELLOW,
    info: LogColor.BLUE,
    debug: LogColor.GREY
};

winston.addColors(colors);

const colorTextInConsole = (text: string, color: LogColor): string => {
    const codes: Record<LogColor, number> = {
        red: 31,
        yellow: 33,
        blue: 34,
        magenta: 35,
        cyan: 36,
        green: 32,
        grey: 90
    };
    return `\x1b[${codes[color]}m${text}\x1b[0m`;
};

const consolePrinter = printf((raw) => {
    const info = raw as unknown as LogInfo;

    const ts = info.timestamp ?? '';
    const level = info.level.padEnd(5);

    const actor = info.actor
        ? `${colorTextInConsole(`[${info.actor}]`, LogColor.CYAN)} `
        : '';

    let log = `[${ts}] ${level}  ${actor}${info.message}`;

    if (info.meta && Object.keys(info.meta).length > 0) {
        const parts = Object.entries(info.meta)
            .map(([k, v]) => {
                const val =
                    typeof v === 'object' && v !== null
                        ? JSON.stringify(v)
                        : String(v);
                return `\n\t| ${colorTextInConsole(k, LogColor.GREY)}: ${val}`;
            })
            .join('');

        log = `${log} ${parts}`;
    }

    if (info.durationMs !== undefined) {
        log = `${log} ${colorTextInConsole(`(${info.durationMs} ms)`, LogColor.GREY)}`;
    }

    if (info.stack) {
        log = `${log}\n${colorTextInConsole(info.stack, LogColor.GREY)}`;
    }

    return log;
});

const baseFormat = () =>
    combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true })
    );

export const winstonLogger = winston.createLogger({
    level: 'debug',
    levels,
    transports: [
        new winston.transports.Console({
            format: combine(
                baseFormat(),
                colorize({ level: true }),
                consolePrinter
            )
        }),
        new winston.transports.File({
            filename: 'output/logs/error.log',
            level: 'error',
            format: combine(baseFormat(), json())
        }),
        new winston.transports.File({
            filename: 'output/logs/global.log',
            level: 'http',
            format: combine(baseFormat(), json())
        })
    ]
});
