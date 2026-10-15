import { defineConfig, devices } from '@playwright/test';

import { Config } from './config/env.config';

const { runtime } = Config;

const PROFILE_GREP = {
    smoke: /@smoke/,
    regression: /@regression/,
    all: /.*/
}[Config.profile];

const DEVICE = {
    chromium: devices['Desktop Chrome'],
    firefox: devices['Desktop Firefox'],
    webkit: devices['Desktop Safari']
}[Config.browser];

export default defineConfig({
    testDir: './tests',
    outputDir: './test-results',
    snapshotPathTemplate:
        './tests/__screenshots__/{testFilePath}/{arg}{-projectName}{ext}',

    fullyParallel: true,
    forbidOnly: Config.isCI,
    retries: runtime.retries,
    workers: runtime.workers,
    timeout: runtime.testTimeout,

    expect: { timeout: runtime.expectTimeout },

    reporter: [
        ['list'],
        ['html', { outputFolder: './playwright-report', open: 'never' }],
        ['junit', { outputFile: './test-results/junit.xml' }]
    ],

    use: {
        baseURL: Config.baseUrl,
        headless: runtime.headless,
        actionTimeout: runtime.actionTimeout,
        navigationTimeout: runtime.navigationTimeout,
        locale: 'en-GB',
        timezoneId: 'Europe/Berlin',
        ignoreHTTPSErrors: true,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },

    projects: [
        {
            name: `${Config.env}-${Config.browser}-${Config.profile}`,
            grep: PROFILE_GREP,
            use: { ...DEVICE }
        }
    ]
});
