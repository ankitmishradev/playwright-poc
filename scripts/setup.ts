import { mkdirSync } from 'node:fs';

import { logger } from '#/src/logger/index';

import { cli, describeFailure, type CliResult } from './cli.js';

const log = logger.child({ actor: 'setup' });

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
                  exitCode: result.status,
                  signal: result.signal,
                  stderr: result.stderr || undefined
              }
          };

const formatDuration = (ms: number) =>
    ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;

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
                        directories: OUTPUT_DIRECTORIES,
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

type StepReport = { title: string; reason: string; hint: string };

const main = () => {
    const startedAt = Date.now();
    const failures: StepReport[] = [];

    log.info(
        `Starting project setup (${steps.length} steps) in ${process.cwd()}`
    );

    steps.forEach((step, index) => {
        // After a fatal failure the remaining steps are skipped
        if (failures.some((f) => steps.find((s) => s.title === f.title)?.fatal))
            return;

        const label = `[${index + 1}/${steps.length}] ${step.title}`;
        const stepStartedAt = Date.now();

        log.info(`${label}...`);
        const outcome = step.run();
        const took = formatDuration(Date.now() - stepStartedAt);

        if (outcome.ok) {
            log.info(`${label}: ${outcome.detail ?? 'done'} (${took})`);
            return;
        }

        log.error(
            `${label}: FAILED after ${took}: ${outcome.reason}`,
            outcome.meta
        );
        log.error(`  How to fix: ${outcome.hint}`);
        failures.push({
            title: step.title,
            reason: outcome.reason,
            hint: outcome.hint
        });
    });

    const total = formatDuration(Date.now() - startedAt);

    if (failures.length === 0) {
        log.info(`Project setup completed successfully in ${total}`);
        return;
    }

    const skipped =
        steps.length -
        steps.findIndex((s) => s.title === failures[0]?.title) -
        1;
    const aborted = steps.find((s) => s.title === failures[0]?.title)?.fatal;

    log.error(
        `Project setup finished with ${failures.length} failed step(s) in ${total}` +
            (aborted
                ? ` and was aborted early (${skipped} step(s) skipped)`
                : '')
    );
    failures.forEach((f, i) =>
        log.error(`  ${i + 1}. ${f.title}: ${f.reason}\n     Fix: ${f.hint}`)
    );

    process.exitCode = 1;
};

try {
    main();
} catch (err) {
    log.error(
        `Project setup crashed unexpectedly: ${err instanceof Error ? err.message : String(err)}. ` +
            'This is likely a bug in the setup script itself',
        { err }
    );
    process.exitCode = 1;
}
