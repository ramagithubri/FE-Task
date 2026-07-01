import { Task, TaskStatus, RawTask, User } from './types';

export function parseStatus(rawStatus: unknown): TaskStatus {
  if (typeof rawStatus !== 'string') return TaskStatus.UNKNOWN;
  // Normalize by making lower case and removing underscores/spaces
  const normalized = rawStatus.toLowerCase().replace(/[^a-z]/g, '');
  switch (normalized) {
    case 'todo': return TaskStatus.TODO;
    case 'inprogress': return TaskStatus.IN_PROGRESS;
    case 'qa': return TaskStatus.QA;
    case 'done': return TaskStatus.DONE;
    case 'blocked': return TaskStatus.BLOCKED;
    default: return TaskStatus.UNKNOWN;
  }
}

export function parseDate(rawDate: unknown): number {
  if (typeof rawDate === 'number') return rawDate;
  if (typeof rawDate === 'string') {
    const parsed = Date.parse(rawDate);
    if (!isNaN(parsed)) return parsed;
  }
  return Date.now(); // Fallback if invalid
}

export function parseAssignee(rawAssignee: unknown): User | null {
  if (
    rawAssignee &&
    typeof rawAssignee === 'object' &&
    'id' in rawAssignee &&
    'name' in rawAssignee
  ) {
    const assignee = rawAssignee as Record<string, unknown>;
    if (typeof assignee.id === 'string' && typeof assignee.name === 'string') {
      return {
        id: assignee.id,
        name: assignee.name,
      };
    }
  }
  return null;
}

export function normalizeTask(raw: RawTask): Task {
  const id = typeof raw.id === 'string' ? raw.id : `unknown-${Math.random().toString(36).substring(7)}`;
  const title = typeof raw.title === 'string' ? raw.title : `Untitled Task (${id})`;
  const status = parseStatus(raw.status);
  const assignee = parseAssignee(raw.assignee);
  
  let annotationCount = 0;
  if (typeof raw.annotationCount === 'number') {
    annotationCount = Math.max(0, Math.floor(raw.annotationCount));
  } else if (typeof raw.annotationCount === 'string') {
    const parsed = parseInt(raw.annotationCount, 10);
    if (!isNaN(parsed)) {
      annotationCount = Math.max(0, parsed);
    }
  }

  const updatedAt = parseDate(raw.updatedAt);
  const meta = typeof raw.meta === 'object' && raw.meta !== null && !Array.isArray(raw.meta)
    ? (raw.meta as Record<string, unknown>)
    : {};

  const baseTask = {
    id,
    title,
    status,
    assignee,
    annotationCount,
    updatedAt,
    meta,
  };

  if (typeof raw.type === 'string') {
    const normalizedType = raw.type.toLowerCase();
    if (normalizedType === 'image') return { ...baseTask, type: 'image' };
    if (normalizedType === 'audio') return { ...baseTask, type: 'audio' };
    if (normalizedType === 'text') return { ...baseTask, type: 'text' };
    
    return { ...baseTask, type: 'unknown', originalType: raw.type };
  }

  return { ...baseTask, type: 'unknown', originalType: String(raw.type) };
}
