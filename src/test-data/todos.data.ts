import type { TodoData } from '@typings/test-data.types';
import { loadTestData } from '@utils/test-data';

export const todoData = loadTestData<TodoData>('todos');
