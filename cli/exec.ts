import { spawnSync } from 'node:child_process';

import type { CliOptions, CliResult } from './types.js';

export const exec = (
    command: string,
    args: string[] = [],
    options: CliOptions = {}
): CliResult => {
    const { showOutput = true, cwd } = options;
    const startedAt = Date.now();

    const result = spawnSync(command, args, {
        cwd,
        stdio: showOutput ? 'inherit' : 'pipe',
        encoding: 'utf8',
        shell: process.platform === 'win32'
    });

    return {
        ok: !result.error && result.status === 0,
        command: [command, ...args].join(' '),
        status: result.status,
        signal: result.signal,
        error: result.error,
        durationMs: Date.now() - startedAt,
        stdout: result.stdout?.toString().trim() ?? '',
        stderr: result.stderr?.toString().trim() ?? ''
    };
};
