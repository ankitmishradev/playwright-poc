import type { Locator, Page } from '@playwright/test';

import { BasePage } from './base.page';

const TODO_PATH = '/todomvc/';

/** TodoMVC application screen. */
export class TodoPage extends BasePage {
    readonly newTodo: Locator;
    readonly items: Locator;
    readonly titles: Locator;
    readonly counter: Locator;
    readonly toggleAll: Locator;
    readonly clearCompleted: Locator;

    constructor(page: Page) {
        super(page);
        this.newTodo = page.getByPlaceholder('What needs to be done?');
        this.items = page.getByTestId('todo-item');
        this.titles = page.getByTestId('todo-title');
        this.counter = page.getByTestId('todo-count');
        this.toggleAll = page.getByLabel('Mark all as complete');
        this.clearCompleted = page.getByRole('button', {
            name: 'Clear completed'
        });
    }

    /** Opens the application root. */
    async open(): Promise<void> {
        await this.goto(TODO_PATH);
    }

    /**
     * Adds a single todo.
     *
     * @param title - Text of the todo to create.
     */
    async add(title: string): Promise<void> {
        await this.newTodo.fill(title);
        await this.newTodo.press('Enter');
    }

    /**
     * Adds several todos in order.
     *
     * @param titles - Texts of the todos to create.
     */
    async addAll(titles: readonly string[]): Promise<void> {
        for (const title of titles) {
            await this.add(title);
        }
    }

    /**
     * Marks a todo complete or active by its position.
     *
     * @param index - Zero-based index of the todo to toggle.
     */
    async toggle(index: number): Promise<void> {
        await this.items.nth(index).getByRole('checkbox').check();
    }

    /**
     * Switches the visible list via the footer filters.
     *
     * @param filter - Filter link to activate.
     */
    async filterBy(filter: 'All' | 'Active' | 'Completed'): Promise<void> {
        await this.page.getByRole('link', { name: filter }).click();
    }
}
