import { ENV, bool, num, oneOf, required } from './env';

import type { BrowserName, ProfileName } from '@typings/env.types';

const BROWSERS = [
    'chromium',
    'firefox',
    'webkit'
] as const satisfies readonly BrowserName[];

const PROFILES = [
    'smoke',
    'regression',
    'all'
] as const satisfies readonly ProfileName[];

const isCI = !!process.env.CI;

export const Config = {
    env: ENV,
    isCI,
    browser: oneOf('BROWSER', BROWSERS, 'chromium'),
    profile: oneOf('PROFILE', PROFILES, 'all'),
    baseUrl: required('BASE_URL'),

    runtime: {
        headless: isCI || bool('HEADLESS', true),
        retries: num('RETRIES', isCI ? 2 : 0),
        workers: process.env.WORKERS ? num('WORKERS', 1) : undefined,
        actionTimeout: num('ACTION_TIMEOUT', 15_000),
        navigationTimeout: num('NAVIGATION_TIMEOUT', 60_000),
        expectTimeout: num('EXPECT_TIMEOUT', 10_000),
        testTimeout: num('TEST_TIMEOUT', 60_000)
    }
} as const;

export type AppConfig = typeof Config;
