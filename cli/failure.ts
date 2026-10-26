import type { CliResult } from './types.js';

export const describeFailure = (result: CliResult): string => {
    const { error, signal, status, command } = result;

    if (error?.code === 'ENOENT')
        return `"${command.split(' ')[0]}" was not found (not installed or not on PATH)`;
    if (error?.code === 'EACCES')
        return `permission denied while running "${command}"`;
    if (error) return `could not start "${command}": ${error.message}`;
    if (signal) return `"${command}" was terminated by signal ${signal}`;

    return `"${command}" exited with code ${status}`;
};
