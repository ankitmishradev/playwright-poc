import path from 'node:path';

import { config as loadEnvFile } from 'dotenv';

import type { EnvName } from '@typings/env.types';

export const ROOT_DIR = path.resolve(__dirname, '..');

const ENV_NAMES = ['dev', 'qa', 'prod'] as const satisfies readonly EnvName[];

/**
 * Resolves the target environment from the `ENV` variable.
 *
 * @returns The validated environment name, defaulting to `dev`.
 * @throws If `ENV` is set to a value outside {@link ENV_NAMES}.
 */
function resolveEnv(): EnvName {
    const raw = (process.env.ENV ?? 'dev').toLowerCase() as EnvName;
    if (!ENV_NAMES.includes(raw)) {
        throw new Error(
            `Unknown ENV "${raw}". Expected one of: ${ENV_NAMES.join(', ')}`
        );
    }
    return raw;
}

export const ENV = resolveEnv();

// dotenv never overwrites an existing variable, so load order defines
// precedence: shell/CI > .env.local > .env.<ENV> > .env
for (const file of ['.env.local', `.env.${ENV}`, '.env']) {
    loadEnvFile({ path: path.join(ROOT_DIR, file), quiet: true });
}

/**
 * Reads a raw variable, treating blank values as absent.
 *
 * @param key - Environment variable name.
 * @returns The trimmed value, or `undefined` when unset or empty.
 */
function read(key: string): string | undefined {
    return process.env[key]?.trim() || undefined;
}

/**
 * Reads a variable that the suite cannot run without.
 *
 * @param key - Environment variable name.
 * @returns The trimmed value.
 * @throws If the variable is unset or empty, naming the file to fix.
 */
export function required(key: string): string {
    const value = read(key);
    if (!value) {
        throw new Error(
            `Missing required environment variable "${key}" for ENV="${ENV}". ` +
                `Add it to .env.${ENV} or provide it as a CI secret.`
        );
    }
    return value;
}

/**
 * Reads a numeric variable.
 *
 * @param key - Environment variable name.
 * @param fallback - Value used when the variable is unset.
 * @returns The parsed number.
 * @throws If the variable is set to something non-numeric.
 */
export function num(key: string, fallback: number): number {
    const raw = read(key);
    if (!raw) return fallback;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
        throw new Error(`"${key}" must be a number, got "${raw}"`);
    }
    return parsed;
}

/**
 * Reads a boolean variable, accepting only `true` or `false`.
 *
 * @param key - Environment variable name.
 * @param fallback - Value used when the variable is unset.
 * @returns The parsed boolean.
 * @throws If the variable is set to any other value.
 */
export function bool(key: string, fallback: boolean): boolean {
    const raw = read(key)?.toLowerCase();
    if (!raw) return fallback;
    if (raw !== 'true' && raw !== 'false') {
        throw new Error(`"${key}" must be true or false, got "${raw}"`);
    }
    return raw === 'true';
}

/**
 * Reads a variable constrained to a fixed set of values.
 *
 * @param key - Environment variable name.
 * @param allowed - Permitted values; also narrows the return type.
 * @param fallback - Value used when the variable is unset.
 * @returns One of `allowed`.
 * @throws If the variable is set to a value outside `allowed`.
 */
export function oneOf<T extends string>(
    key: string,
    allowed: readonly T[],
    fallback: T
): T {
    const raw = read(key)?.toLowerCase() as T | undefined;
    if (!raw) return fallback;
    if (!allowed.includes(raw)) {
        throw new Error(
            `"${key}" must be one of: ${allowed.join(', ')}, got "${raw}"`
        );
    }
    return raw;
}
