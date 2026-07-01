import { getTaskSelectors, tasksSlice } from './tasksSlice';
import { TaskStatus, Task } from './types';
import { configureStore } from '@reduxjs/toolkit';

describe('Task Selectors', () => {
  it('selectFilteredAndSortedTasks filters by status and type', () => {
    const tasks: Task[] = [
      { id: '1', title: 'A', type: 'image', status: TaskStatus.TODO, assignee: null, annotationCount: 0, updatedAt: 100, meta: {} },
      { id: '2', title: 'B', type: 'text', status: TaskStatus.IN_PROGRESS, assignee: null, annotationCount: 0, updatedAt: 200, meta: {} },
      { id: '3', title: 'C', type: 'image', status: TaskStatus.IN_PROGRESS, assignee: null, annotationCount: 0, updatedAt: 300, meta: {} },
    ];

    const store = configureStore({
      reducer: { tasks: tasksSlice.reducer },
      preloadedState: {
        tasks: {
          ids: ['1', '2', '3'],
          entities: {
            '1': tasks[0],
            '2': tasks[1],
            '3': tasks[2],
          }
        }
      }
    });

    const { selectFilteredAndSortedTasks } = getTaskSelectors((state: any) => state.tasks);

    // Filter by type: 'image'
    const imageTasks = selectFilteredAndSortedTasks(store.getState(), 'image', null, '', 'updatedAt');
    expect(imageTasks).toHaveLength(2);
    expect(imageTasks[0].id).toBe('3'); // sorted by newest
    expect(imageTasks[1].id).toBe('1');

    // Filter by status: 'IN_PROGRESS'
    const inProgressTasks = selectFilteredAndSortedTasks(store.getState(), null, TaskStatus.IN_PROGRESS, '', 'updatedAt');
    expect(inProgressTasks).toHaveLength(2);
    
    // Filter by both
    const imageInProgress = selectFilteredAndSortedTasks(store.getState(), 'image', TaskStatus.IN_PROGRESS, '', 'updatedAt');
    expect(imageInProgress).toHaveLength(1);
    expect(imageInProgress[0].id).toBe('3');
  });
});
