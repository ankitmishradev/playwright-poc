import z from 'zod';

const positiveInteger = z.coerce.number().int().positive();
const nonNegativeInteger = z.coerce.number().int().nonnegative();

export const EnvSchema = z.object({
    WORKERS: positiveInteger,
    RETRIES: nonNegativeInteger,

    GLOBAL_TIMEOUT: nonNegativeInteger,
    ACTION_TIMEOUT: positiveInteger,
    ASSERTION_TIMEOUT: positiveInteger,
    NAVIGATION_TIMEOUT: positiveInteger,
    TEST_TIMEOUT: positiveInteger,
    EXPECT_TIMEOUT: positiveInteger,

    DSF_URL: z.url(),
    BPA_URL: z.url(),

    DSF_OPERATION_USER: z.string().min(1),
    DSF_ITADMIN_USER: z.string().min(1),
    DSF_BUSINESS_USER: z.string().min(1),
    DSF_USER_PASSWORD: z.string().min(1),

    BPA_INTEGRATION_USER: z.string().min(1),
    BPA_USER_PASSWORD: z.string().min(1),

    CI: z.boolean().default(false)
});
