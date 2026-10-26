export type CliResult = {
    ok: boolean;
    command: string;
    status: number | null;
    signal: NodeJS.Signals | null;
    error?: NodeJS.ErrnoException;
    durationMs: number;
    stdout: string;
    stderr: string;
};

export type CliOptions = {
    showOutput?: boolean;
    cwd?: string;
};
