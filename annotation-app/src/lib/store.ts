import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import { tasksSlice, getTaskSelectors } from './tasksSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    tasks: tasksSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const { selectAll: selectAllTasks, selectById: selectTaskById, selectFilteredAndSortedTasks } = getTaskSelectors((state: RootState) => state.tasks);
