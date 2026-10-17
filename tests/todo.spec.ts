import { test, expect } from '@playwright/test';

test.describe('Dummy test suite', () => {
    test('should open the Playwright website', async ({ page }) => {
        await page.goto('https://playwright.dev/');

        await expect(page).toHaveTitle(/Playwright/);
        await expect(
            page.getByRole('link', { name: 'Get started' })
        ).toBeVisible();
    });

    test('should perform a basic assertion', () => {
        const result = 2 + 2;

        expect(result).toBe(4);
    });
});
