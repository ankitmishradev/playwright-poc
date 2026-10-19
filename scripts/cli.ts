import { spawnSync } from 'node:child_process';

export type CliResult = {
    ok: boolean;
    /** Full command line as run, for logs, e.g. "npm run type" */
    command: string;
    status: number | null;
    signal: NodeJS.Signals | null;
    error?: NodeJS.ErrnoException;
    durationMs: number;
    /** Only populated when showOutput is false */
    stdout: string;
    stderr: string;
};

type CliOptions = {
    /** Stream the child's output to the terminal (true) or capture it (false). Default: true */
    showOutput?: boolean;
    cwd?: string;
};

export const cli = (
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
        // npm/npx are .cmd files on Windows and can't be spawned without a shell
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

/** Turns a failed CliResult into a human-readable reason. */
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
