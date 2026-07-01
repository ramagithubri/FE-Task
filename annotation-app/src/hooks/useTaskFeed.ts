import { useEffect, useRef } from 'react';
import { useAppDispatch } from './redux';
import { taskUpdated, taskAssigned, annotationCreated } from '../lib/tasksSlice';
import { api } from '../lib/api';
import { store } from '../lib/store';

export function useTaskFeed(url: string) {
  const dispatch = useAppDispatch();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;
    let isMounted = true;

    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          const taskId = data.payload?.id || data.payload?.taskId;
          
          if (taskId) {
             const state = store.getState();
             const existingTask = state.tasks.entities[taskId];
             if (!existingTask) {
                // Fetch the missing task before dispatching the update
                try {
                  await dispatch(api.endpoints.getTaskById.initiate(taskId)).unwrap();
                } catch (e) {
                  console.warn(`Failed to fetch missing task ${taskId}`, e);
                }
             }
          }

          if (data.kind === 'task.updated') {
            dispatch(taskUpdated(data.payload));
          } else if (data.kind === 'task.assigned') {
            dispatch(taskAssigned(data.payload));
          } else if (data.kind === 'annotation.created') {
            dispatch(annotationCreated(data.payload));
          }
        } catch (err) {
          console.error('WS parse/handle error', err);
        }
      };

      ws.onclose = () => {
        if (!isMounted) return;
        reconnectTimer = setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url, dispatch]);
}
