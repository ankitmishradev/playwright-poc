import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
    SUPPORTED_PROJECTS,
    SUPPORTED_ENVS,
    type Project,
    type Environment,
    DEFAULT_ENV
} from '#/config/index';
import { logger } from '#/src/logger/index';

const log = logger.child({ actor: 'launcher' });
const args = process.argv.slice(2);

function getOption(name: string): string | undefined {
    const prefix = `--${name}=`;
    const index = args.findIndex((arg) => arg.startsWith(prefix));

    if (index === -1) return undefined;

    const argument = args[index];
    if (argument === undefined) return undefined;

    const value = argument.slice(prefix.length);
    if (!value) {
        log.error(`Missing value for --${name}`);
        process.exit(1);
    }

    args.splice(index, 1);
    return value;
}

const getEnvAndProject = () => {
    const env = getOption('env') ?? DEFAULT_ENV;
    const project = getOption('project');

    const isCorrectEnvironment = SUPPORTED_ENVS.includes(env as Environment);
    const isCorrectProject = SUPPORTED_PROJECTS.includes(project as Project);

    if (!isCorrectEnvironment) {
        log.error(`Invalid environment: ${env}`);
        process.exit(1);
    }

    if (project && !isCorrectProject) {
        log.error(`Invalid project: ${project}`);
        process.exit(1);
    }

    return { env, project };
};

const runPlaywright = () => {
    const { env, project } = getEnvAndProject();

    const playwrightCli = fileURLToPath(
        import.meta.resolve('@playwright/test/cli')
    );

    log.info('Executing playwright', {
        meta: { env, project: project ?? 'all' }
    });

    const result = spawnSync(
        process.execPath,
        [
            playwrightCli,
            'test',
            ...(project ? [`--project=${project}`] : []),
            ...args
        ],
        {
            stdio: 'inherit',
            env: {
                ...process.env,
                ENV: env
            }
        }
    );

    return result;
};

const run = () => {
    log.info('Starting launcher');

    const result = runPlaywright();

    if (result.error) {
        log.error(result.error.message);
        process.exit(1);
    }

    process.exit(result.status ?? 1);
};

void run();
