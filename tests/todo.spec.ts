import { test, expect } from '#/fixtures/index';

test.describe('Dummy test suite', () => {
    test('should perform a basic assertion', () => {
        const result = 2 + 2;

        expect(result).toBe(4);
    });
});
