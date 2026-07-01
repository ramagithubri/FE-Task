import { createSlice, createEntityAdapter, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Task, TaskStatus } from './types';
import { api } from './api';
import { normalizeTask, parseStatus, parseDate, parseAssignee } from './normalize';

const tasksAdapter = createEntityAdapter<Task>({
  sortComparer: (a, b) => b.updatedAt - a.updatedAt,
});

const initialState = tasksAdapter.getInitialState();

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    hydrateTasks: (state, action: PayloadAction<Task[]>) => {
      tasksAdapter.upsertMany(state, action.payload);
    },
    taskUpdated: (state, action: PayloadAction<{ id: string; status?: unknown; updatedAt?: unknown }>) => {
      const { id, status, updatedAt } = action.payload;
      const updates: Partial<Task> = {};
      if (status !== undefined) updates.status = parseStatus(status);
      if (updatedAt !== undefined) updates.updatedAt = parseDate(updatedAt);
      
      tasksAdapter.updateOne(state, { id, changes: updates });
    },
    taskAssigned: (state, action: PayloadAction<{ id: string; assignee?: unknown }>) => {
      const { id, assignee } = action.payload;
      tasksAdapter.updateOne(state, { id, changes: { assignee: parseAssignee(assignee) } });
    },
    annotationCreated: (state, action: PayloadAction<{ taskId: string; by: string; at: number }>) => {
      const { taskId } = action.payload;
      const existing = state.entities[taskId];
      if (existing) {
        tasksAdapter.updateOne(state, {
          id: taskId,
          changes: { annotationCount: existing.annotationCount + 1 }
        });
      }
    },
    taskFetched: (state, action: PayloadAction<Task>) => {
      tasksAdapter.upsertOne(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      api.endpoints.getTasks.matchFulfilled,
      (state, { payload }) => {
        const normalizedTasks = payload.items.map(normalizeTask);
        tasksAdapter.upsertMany(state, normalizedTasks);
      }
    );
    builder.addMatcher(
      api.endpoints.getTaskById.matchFulfilled,
      (state, { payload }) => {
        tasksAdapter.upsertOne(state, normalizeTask(payload));
      }
    );
  },
});

export const { hydrateTasks, taskUpdated, taskAssigned, annotationCreated, taskFetched } = tasksSlice.actions;

// We export the basic selectors for the root state later
export const adapterSelectors = tasksAdapter.getSelectors();

// Memoized derived selectors will be placed in store.ts or here, but we need RootState.
// Let's create a factory function that takes the RootState selector to avoid circular dependencies.
export const getTaskSelectors = (selectState: (state: any) => ReturnType<typeof tasksSlice.reducer>) => {
  const { selectAll, selectById } = tasksAdapter.getSelectors(selectState);

  const selectFilteredAndSortedTasks = createSelector(
    [
      selectAll,
      (state: any, filterType: string | null) => filterType,
      (state: any, filterType: string | null, filterStatus: TaskStatus | null) => filterStatus,
      (state: any, filterType: string | null, filterStatus: TaskStatus | null, searchQuery: string) => searchQuery,
      (state: any, filterType: string | null, filterStatus: TaskStatus | null, searchQuery: string, sortBy: 'updatedAt' | 'title') => sortBy
    ],
    (tasks, filterType, filterStatus, searchQuery, sortBy) => {
      let result = tasks;

      if (filterType) {
        result = result.filter(t => t.type === filterType);
      }
      if (filterStatus) {
        result = result.filter(t => t.status === filterStatus);
      }
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        result = result.filter(t => t.title.toLowerCase().includes(lowerQuery) || t.id.toLowerCase().includes(lowerQuery));
      }

      if (sortBy === 'title') {
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
      } else {
        result = [...result].sort((a, b) => b.updatedAt - a.updatedAt);
      }

      return result;
    }
  );

  return { selectAll, selectById, selectFilteredAndSortedTasks };
};
