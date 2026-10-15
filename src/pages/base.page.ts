import type { Page } from '@playwright/test';

/** Shared navigation behaviour for every page object. */
export abstract class BasePage {
    protected constructor(protected readonly page: Page) {}

    /**
     * Navigates to a path relative to the configured `baseURL`.
     *
     * @param path - Application path to open, defaulting to the site root.
     */
    async goto(path = '/'): Promise<void> {
        await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    }
}
