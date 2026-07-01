import { normalizeTask } from './normalize';
import { TaskStatus } from './types';

describe('normalizeTask', () => {
  it('handles a perfectly valid task', () => {
    const raw = {
      id: 't1',
      title: 'Valid Task',
      type: 'image',
      status: 'in_progress',
      assignee: { id: 'u1', name: 'Asha' },
      annotationCount: 5,
      updatedAt: 1719600000000,
      meta: { priority: 'high' }
    };
    
    const task = normalizeTask(raw);
    expect(task.id).toBe('t1');
    expect(task.title).toBe('Valid Task');
    expect(task.type).toBe('image');
    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    expect(task.annotationCount).toBe(5);
    expect(task.assignee?.name).toBe('Asha');
    expect(task.meta).toEqual({ priority: 'high' });
  });

  it('handles missing fields and garbage values', () => {
    const raw = {
      id: null,
      title: undefined,
      type: 'video', // unknown
      status: 'In_Progress_xyz', // malformed
      assignee: 'Just a string', // invalid assignee
      annotationCount: '3', // string instead of number
      updatedAt: '2024-06-28T16:00:00.000Z', // ISO string
      meta: ['array', 'instead', 'of', 'object'] // invalid meta
    };

    const task = normalizeTask(raw);
    expect(typeof task.id).toBe('string'); // auto-generated
    expect(task.title.startsWith('Untitled Task')).toBe(true);
    expect(task.type).toBe('unknown');
    expect((task as any).originalType).toBe('video');
    expect(task.status).toBe(TaskStatus.UNKNOWN);
    expect(task.assignee).toBeNull();
    expect(task.annotationCount).toBe(3);
    expect(task.updatedAt).toBe(Date.parse('2024-06-28T16:00:00.000Z'));
    expect(task.meta).toEqual({}); // fallback
  });
});
