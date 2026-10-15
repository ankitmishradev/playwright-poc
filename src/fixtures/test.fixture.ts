import { test as base } from '@playwright/test';

import { TodoPage } from '@pages/todo.page';

interface Pages {
    todoPage: TodoPage;
}

/**
 * Project-wide `test` object.
 *
 * Specs import `test` and `expect` from here rather than from
 * `@playwright/test`, so every page object is available by destructuring.
 */
export const test = base.extend<Pages>({
    todoPage: async ({ page }, use) => {
        await use(new TodoPage(page));
    }
});

export { expect } from '@playwright/test';
