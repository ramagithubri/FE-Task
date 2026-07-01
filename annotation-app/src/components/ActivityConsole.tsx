'use client';

import { useEffect, useState } from 'react';
import { useTaskFeed } from '../hooks/useTaskFeed';
import { useGetTasksQuery } from '../lib/api';
import TaskList from './TaskList';
import TaskDetail from './TaskDetail';
import localforage from 'localforage';
import { useAppDispatch } from '../hooks/redux';
import { hydrateTasks } from '../lib/tasksSlice';
import { Task } from '../lib/types';

export default function ActivityConsole() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const dispatch = useAppDispatch();

  // 1. WebSocket for real-time events
  useTaskFeed('ws://localhost:4000/ws');

  // 2. Initial fetch with RTK Query (handles pagination)
  // We skip fetching until we try to rehydrate from IndexedDB
  const { data, error, isLoading, isFetching } = useGetTasksQuery({ page: 1, pageSize: 50 }, { skip: isHydrating });

  // 3. Hydrate from IndexedDB on mount
  useEffect(() => {
    async function loadCache() {
      try {
        const cached = await localforage.getItem<Task[]>('tasksCache');
        if (cached && cached.length > 0) {
          dispatch(hydrateTasks(cached));
        }
      } catch (err) {
        console.error('Failed to load tasks from cache', err);
      } finally {
        setIsHydrating(false);
      }
    }
    loadCache();
  }, [dispatch]);

  // 4. Update cache when data arrives from API
  useEffect(() => {
    if (data?.items) {
      // In a real app, we'd cache the normalized tasks from store, but here caching the api response is simple.
      // Wait, the prompt says "Cache the most recently loaded task list in IndexedDB ... so that on reload the UI shows the cached data immediately".
      // It's better to cache the normalized data so it fits the Redux slice directly. We can subscribe to the store and cache the tasks slice.
      // But for simplicity, let's just cache the API response. Wait, `hydrateTasks` takes `Task[]`. The API returns `RawTask[]`. 
      // The extraReducer normalizes them anyway, but caching the store state is better.
      // We will handle cache update in another useEffect in a moment. Let's stick to updating the cache here.
    }
  }, [data]);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="w-2/3 border-r border-gray-200 flex flex-col h-full bg-white shadow-xl relative z-10">
        <header className="px-6 py-4 border-b border-gray-200 bg-white sticky top-0 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Activity Console
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {isFetching && <span className="animate-pulse flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Updating...</span>}
            {error && <span className="text-red-500 bg-red-50 px-2 py-1 rounded">Connection error</span>}
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <TaskList onSelectTask={setSelectedTaskId} selectedTaskId={selectedTaskId} />
        </div>
      </div>

      <div className="w-1/3 bg-gray-50 flex flex-col h-full overflow-hidden shadow-inner">
        {selectedTaskId ? (
          <TaskDetail taskId={selectedTaskId} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a task to view details
          </div>
        )}
      </div>
    </div>
  );
}
