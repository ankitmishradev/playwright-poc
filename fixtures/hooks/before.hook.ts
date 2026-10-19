import { test } from '@playwright/test';

import { logger } from '#/src/logger/index';

test.beforeEach(({}, testInfo) => {
    const testLogger = logger.child({ actor: 'before' });

    testLogger.info('Starting test execution', {
        meta: { title: testInfo.title }
    });
});
