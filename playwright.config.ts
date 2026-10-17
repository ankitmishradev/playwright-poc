import { defineConfig, devices } from '@playwright/test';

import { settings } from '#/config/index';

export default defineConfig({
    testDir: 'tests',
    outputDir: 'output/results',

    fullyParallel: true,
    forbidOnly: settings.ci,
    retries: settings.ci ? settings.runtime.retries : 0,
    workers: settings.ci ? 1 : settings.runtime.workers,

    globalTimeout: settings.ci ? settings.timeouts.global : 0,
    timeout: settings.timeouts.test,
    expect: { timeout: settings.timeouts.expect },

    reporter: [
        [settings.ci ? 'dot' : 'line'],
        ['html', { open: 'never', outputFolder: 'output/reports/html' }],
        ['json', { outputFile: 'output/reports/json/index.json' }]
    ],

    use: {
        baseURL: settings.applications.dsf.baseURL,
        headless: settings.ci,

        actionTimeout: settings.timeouts.action,
        navigationTimeout: settings.timeouts.navigation,

        ignoreHTTPSErrors: true,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },

    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                browserName: 'chromium'
            }
        },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                browserName: 'firefox'
            }
        },
        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
                browserName: 'webkit'
            }
        }
    ]
});
