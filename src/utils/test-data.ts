import fs from 'node:fs';
import path from 'node:path';

import { ROOT_DIR } from '@config/env';
import { Config } from '@config/env.config';

const DATA_DIR = path.join(ROOT_DIR, 'src', 'test-data');

/**
 * Parses a JSON file from the test-data directory.
 *
 * @param file - File name relative to `src/test-data`.
 * @returns The parsed object, or `{}` when the file does not exist.
 */
function readJson(file: string): Record<string, unknown> {
    const fullPath = path.join(DATA_DIR, file);
    return fs.existsSync(fullPath)
        ? JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
        : {};
}

/**
 * Loads a dataset, layering an optional per-environment file over the base file.
 *
 * @typeParam T - Shape the dataset is expected to have.
 * @param name - Dataset name, e.g. `login` for `login.json`.
 * @returns `<name>.json` with any key overridden by `<name>.<env>.json`.
 */
export function loadTestData<T>(name: string): T {
    return {
        ...readJson(`${name}.json`),
        ...readJson(`${name}.${Config.env}.json`)
    } as T;
}
