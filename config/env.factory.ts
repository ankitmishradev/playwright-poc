import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import dotenv from 'dotenv';
import { z } from 'zod';

import { EnvSchema } from './env.schema.js';
import { DEFAULT_ENV, SUPPORTED_ENVS } from './env.constants.js';

const getCI = () => {
    const ciResult = z.boolean().safeParse(process.env.CI ?? false);

    if (!ciResult.success)
        throw new Error(`Invalid CI value "${process.env.CI}".`);

    return ciResult.data;
};

const getEnv = () => {
    const envResult = z
        .enum(SUPPORTED_ENVS)
        .safeParse(process.env.ENV ?? DEFAULT_ENV);

    if (!envResult.success)
        throw new Error(`Invalid environment "${process.env.ENV}". `);

    return envResult.data;
};

const getEnvFiles = (env: string) => {
    const envDir = resolve(process.cwd(), 'environments');

    const sharedEnvFile = resolve(envDir, '.env');
    const envFile = resolve(envDir, `.env.${env}`);

    if (!existsSync(sharedEnvFile) || !existsSync(envFile))
        throw new Error(`Base or "${env}" environment files are missing.`);

    return [envFile, sharedEnvFile];
};

const loadEnvVars = (envFiles: string[]) => {
    const dotenvResult = dotenv.config({
        path: envFiles,
        override: false
    });

    if (dotenvResult.error) throw new Error('Failed to load environment files');
};

const getEnvVars = (env: string) => {
    const envFiles = getEnvFiles(env);
    loadEnvVars(envFiles);

    const envVarsResult = EnvSchema.safeParse(process.env);

    if (!envVarsResult.success) {
        throw new Error(
            `Invalid environment variables:\n${z.prettifyError(
                envVarsResult.error
            )}`
        );
    }

    return Object.freeze(envVarsResult.data);
};

export const ci = getCI();
export const env = getEnv();
export const envVars = getEnvVars(env);
