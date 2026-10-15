import { expect, test } from '@fixtures/test.fixture';
import { todoData } from '@test-data/todos.data';

test.describe('Todo list', { tag: '@smoke' }, () => {
    test.beforeEach(async ({ todoPage }) => {
        await todoPage.open();
    });

    test('adds a todo to the list', async ({ todoPage }) => {
        await todoPage.add(todoData.single);

        await expect(todoPage.titles).toHaveText([todoData.single]);
        await expect(todoPage.counter).toHaveText('1 item left');
    });

    test('adds several todos in order', async ({ todoPage }) => {
        await todoPage.addAll(todoData.titles);

        await expect(todoPage.titles).toHaveText([...todoData.titles]);
        await expect(todoPage.counter).toContainText(
            `${todoData.titles.length} items left`
        );
    });

    test('clears the input after each entry', async ({ todoPage }) => {
        await todoPage.add(todoData.longTitle);

        await expect(todoPage.newTodo).toBeEmpty();
        await expect(todoPage.titles).toHaveText([todoData.longTitle]);
    });
});
