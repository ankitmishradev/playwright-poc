import { expect, test } from '@fixtures/test.fixture';
import { todoData } from '@test-data/todos.data';

test.describe('Todo filters', { tag: '@regression' }, () => {
    test.beforeEach(async ({ todoPage }) => {
        await todoPage.open();
        await todoPage.addAll(todoData.titles);
        await todoPage.toggle(0);
    });

    test('shows only active todos', async ({ todoPage }) => {
        await todoPage.filterBy('Active');

        await expect(todoPage.titles).toHaveText(todoData.titles.slice(1));
    });

    test('shows only completed todos', async ({ todoPage }) => {
        await todoPage.filterBy('Completed');

        await expect(todoPage.titles).toHaveText(todoData.titles.slice(0, 1));
    });

    test('removes completed todos from the list', async ({ todoPage }) => {
        await todoPage.clearCompleted.click();

        await expect(todoPage.titles).toHaveText(todoData.titles.slice(1));
    });
});
