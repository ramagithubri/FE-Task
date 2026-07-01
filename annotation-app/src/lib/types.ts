export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  QA = 'QA',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED',
  UNKNOWN = 'UNKNOWN',
}

export interface User {
  id: string;
  name: string;
}

export interface BaseTask {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: User | null;
  annotationCount: number;
  updatedAt: number; // normalized to epoch ms
  meta: Record<string, unknown>;
}

export interface ImageTask extends BaseTask {
  type: 'image';
}

export interface AudioTask extends BaseTask {
  type: 'audio';
}

export interface TextTask extends BaseTask {
  type: 'text';
}

export interface UnknownTask extends BaseTask {
  type: 'unknown';
  originalType: string;
}

export type Task = ImageTask | AudioTask | TextTask | UnknownTask;

// API Response payload structure (messy)
export interface RawTask {
  id?: unknown;
  title?: unknown;
  type?: unknown;
  status?: unknown;
  assignee?: unknown;
  annotationCount?: unknown;
  updatedAt?: unknown;
  meta?: unknown;
}

export interface PaginatedResponse<T> {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
}
