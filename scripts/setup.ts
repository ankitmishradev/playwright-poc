import { mkdirSync } from 'node:fs';

import { cli, describeFailure, type CliResult } from './cli.js';

// ---------------------------------------------------------------------------
// Console output (zero dependencies, so it works before `npm install`)
// ---------------------------------------------------------------------------

// Colors only when attached to a terminal; honors NO_COLOR / FORCE_COLOR
const useColor = process.env.NO_COLOR
    ? false
    : Boolean(process.env.FORCE_COLOR) || Boolean(process.stdout.isTTY);

const paint = (code: number) => (text: string) =>
    useColor ? `\x1b[${code}m${text}\x1b[0m` : text;

const c = {
    bold: paint(1),
    dim: paint(2),
    red: paint(31),
    green: paint(32),
    yellow: paint(33),
    cyan: paint(36)
};

const log = {
    info: (msg: string) => console.log(`${c.cyan('ℹ')} ${msg}`),
    step: (msg: string) => console.log(`${c.cyan('›')} ${c.bold(msg)}`),
    done: (msg: string) => console.log(`${c.green('✔')} ${msg}`),
    warn: (msg: string) => console.warn(`${c.yellow('⚠')} ${msg}`),
    error: (msg: string) => console.error(`${c.red('✖')} ${c.red(msg)}`),
    /** Indented, dimmed detail line under the previous message */
    detail: (label: string, value: unknown) => {
        const lines = String(value).split('\n');
        console.error(`    ${c.dim(`${label}:`)} ${lines[0]}`);
        for (const line of lines.slice(1))
            console.error(`    ${' '.repeat(label.length + 2)}${line}`);
    },
    hint: (msg: string) =>
        console.error(`    ${c.yellow('→ How to fix:')} ${msg}`)
};

const formatDuration = (ms: number) =>
    ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

const OUTPUT_DIRECTORIES = [
    'output/reports/html',
    'output/reports/json',
    'output/results'
] as const;

type Outcome =
    | { ok: true; detail?: string }
    | {
          ok: false;
          reason: string;
          hint: string;
          meta?: Record<string, unknown>;
      };

type Step = {
    title: string;
    /** A failed fatal step aborts the setup immediately */
    fatal?: boolean;
    run: () => Outcome;
};

const fromCli = (result: CliResult, hint: string, detail?: string): Outcome =>
    result.ok
        ? { ok: true, detail }
        : {
              ok: false,
              reason: describeFailure(result),
              hint,
              meta: {
                  command: result.command,
                  'exit code': result.status,
                  signal: result.signal,
                  stderr: result.stderr || undefined
              }
          };

const steps: Step[] = [
    {
        title: 'Check Node.js',
        fatal: true,
        run: () => {
            const result = cli('node', ['--version'], { showOutput: false });
            return fromCli(
                result,
                'Install Node.js (LTS recommended) from https://nodejs.org, reopen your terminal, and run the setup again',
                `Node.js ${result.stdout} is available`
            );
        }
    },
    {
        title: 'Check npm',
        fatal: true,
        run: () => {
            const result = cli('npm', ['--version'], { showOutput: false });
            return fromCli(
                result,
                'npm ships with Node.js. Reinstall Node.js, or make sure its bin folder is on your PATH',
                `npm ${result.stdout} is available`
            );
        }
    },
    {
        title: 'Create output directories',
        run: () => {
            try {
                for (const dir of OUTPUT_DIRECTORIES)
                    mkdirSync(dir, { recursive: true });
                return {
                    ok: true,
                    detail: `Created ${OUTPUT_DIRECTORIES.join(', ')}`
                };
            } catch (err) {
                const e = err as NodeJS.ErrnoException;
                return {
                    ok: false,
                    reason: `${e.code ?? 'unknown error'}: ${e.message}`,
                    hint: 'Check write permissions for the project folder, or create the directories manually',
                    meta: {
                        directories: OUTPUT_DIRECTORIES.join(', '),
                        cwd: process.cwd()
                    }
                };
            }
        }
    },
    {
        title: 'Install project dependencies',
        run: () =>
            fromCli(
                cli('npm', ['install']),
                'Check your network/registry access and read the npm error above. If it persists, delete node_modules and retry. Full npm logs are in ~/.npm/_logs',
                'Dependencies installed'
            )
    },
    {
        title: 'Install Playwright browsers (chromium, firefox, webkit)',
        run: () =>
            fromCli(
                cli('npx', [
                    'playwright',
                    'install',
                    'chromium',
                    'firefox',
                    'webkit'
                ]),
                'Check your network/proxy settings. On Linux, also try: npx playwright install --with-deps',
                'Playwright browsers installed'
            )
    },
    {
        title: 'Run TypeScript type check',
        run: () =>
            fromCli(
                cli('npm', ['run', 'type']),
                'Fix the TypeScript errors printed above, then re-run: npm run type',
                'No type errors found'
            )
    }
];

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

type Failure = { title: string; reason: string; hint: string };

const main = () => {
    const startedAt = Date.now();
    const failures: Failure[] = [];
    let skipped = 0;
    let aborted = false;

    log.info(
        `Starting project setup ${c.dim(`(${steps.length} steps, cwd: ${process.cwd()})`)}`
    );
    console.log();

    steps.forEach((step, index) => {
        if (aborted) {
            skipped++;
            return;
        }

        const label = `[${index + 1}/${steps.length}] ${step.title}`;
        const stepStartedAt = Date.now();

        log.step(`${label}...`);
        const outcome = step.run();
        const took = c.dim(`(${formatDuration(Date.now() - stepStartedAt)})`);

        if (outcome.ok) {
            log.done(`${outcome.detail ?? 'Done'} ${took}`);
            console.log();
            return;
        }

        log.error(`${step.title} failed ${took}`);
        log.detail('reason', outcome.reason);
        for (const [key, value] of Object.entries(outcome.meta ?? {})) {
            if (value !== undefined && value !== null && value !== '')
                log.detail(key, value);
        }
        log.hint(outcome.hint);
        console.log();

        failures.push({
            title: step.title,
            reason: outcome.reason,
            hint: outcome.hint
        });
        if (step.fatal) aborted = true;
    });

    const total = formatDuration(Date.now() - startedAt);

    if (failures.length === 0) {
        log.done(
            c.green(c.bold(`Project setup completed successfully in ${total}`))
        );
        return;
    }

    log.error(
        `Project setup finished with ${failures.length} failed step(s) in ${total}` +
            (aborted
                ? ` and was aborted early (${skipped} step(s) skipped)`
                : '')
    );
    failures.forEach((f, i) => {
        console.error(`  ${i + 1}. ${c.bold(f.title)}: ${f.reason}`);
        console.error(`     ${c.yellow('→')} ${f.hint}`);
    });

    process.exitCode = 1;
};

try {
    main();
} catch (err) {
    log.error(
        `Project setup crashed unexpectedly: ${err instanceof Error ? err.message : String(err)}`
    );
    log.detail('note', 'This is likely a bug in the setup script itself');
    if (err instanceof Error && err.stack) log.detail('stack', err.stack);
    process.exitCode = 1;
}
