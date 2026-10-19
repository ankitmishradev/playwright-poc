import { test } from '@playwright/test';

import { logger } from '#/src/logger/index';

test.afterEach(({}, testInfo) => {
    const testLogger = logger.child({ actor: 'after' });

    testLogger.info('Finished test execution', {
        meta: {
            title: testInfo.title,
            status: testInfo.status
        }
    });
});
