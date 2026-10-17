import { ci, env, envVars } from './env.factory.js';

export const settings = Object.freeze({
    env,
    ci,

    applications: Object.freeze({
        dsf: Object.freeze({
            baseURL: envVars.DSF_URL
        }),

        bpa: Object.freeze({
            baseURL: envVars.BPA_URL
        })
    }),

    runtime: Object.freeze({
        workers: envVars.WORKERS,
        retries: envVars.RETRIES
    }),

    timeouts: Object.freeze({
        global: envVars.GLOBAL_TIMEOUT,
        action: envVars.ACTION_TIMEOUT,
        assertion: envVars.ASSERTION_TIMEOUT,
        navigation: envVars.NAVIGATION_TIMEOUT,
        test: envVars.TEST_TIMEOUT,
        expect: envVars.EXPECT_TIMEOUT
    }),

    credentials: Object.freeze({
        dsf: Object.freeze({
            operationUser: envVars.DSF_OPERATION_USER,
            itAdminUser: envVars.DSF_ITADMIN_USER,
            businessUser: envVars.DSF_BUSINESS_USER,
            password: envVars.DSF_USER_PASSWORD
        }),

        bpa: Object.freeze({
            integrationUser: envVars.BPA_INTEGRATION_USER,
            password: envVars.BPA_USER_PASSWORD
        })
    })
});
