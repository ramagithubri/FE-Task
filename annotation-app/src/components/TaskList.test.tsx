import React from 'react';
import '@testing-library/jest-dom';
// Mock fetch to suppress the fetchBaseQuery warning in jsdom
global.fetch = jest.fn() as any;
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TaskList from './TaskList';
import { tasksSlice } from '../lib/tasksSlice';
import { TaskStatus } from '../lib/types';
import { api } from '../lib/api';

jest.mock('../lib/api', () => ({
  ...jest.requireActual('../lib/api'),
  useGetTasksQuery: jest.fn(() => ({ isFetching: false }))
}));

const mockTasks = [
  { id: '1', title: 'Task Alpha', type: 'image', status: TaskStatus.TODO, assignee: null, annotationCount: 0, updatedAt: 100, meta: {} },
  { id: '2', title: 'Task Beta', type: 'text', status: TaskStatus.IN_PROGRESS, assignee: null, annotationCount: 0, updatedAt: 200, meta: {} },
];

const renderWithProvider = (ui: React.ReactElement) => {
  const store = configureStore({
    reducer: {
      tasks: tasksSlice.reducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefault) => getDefault().concat(api.middleware) as any
  });
  store.dispatch(tasksSlice.actions.hydrateTasks(mockTasks as any));
  return render(<Provider store={store}>{ui}</Provider>);
};

describe('TaskList Component', () => {
  it('renders tasks and filters by type correctly', () => {
    renderWithProvider(<TaskList onSelectTask={() => {}} selectedTaskId={null} />);
    
    // Both tasks visible initially
    expect(screen.getByText('Task Alpha')).toBeInTheDocument();
    expect(screen.getByText('Task Beta')).toBeInTheDocument();

    // Find the type select
    const selects = screen.getAllByRole('combobox');
    const typeDropdown = selects[0]; // Assuming it's the first select after search input. Wait, search is textbox.
    // Let's fire change event on it
    fireEvent.change(typeDropdown, { target: { value: 'text' } });

    // Task Beta should be visible, Task Alpha should be hidden
    expect(screen.getByText('Task Beta')).toBeInTheDocument();
    expect(screen.queryByText('Task Alpha')).not.toBeInTheDocument();
  });
});
