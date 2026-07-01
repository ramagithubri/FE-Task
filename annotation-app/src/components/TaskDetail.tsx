import { useAppSelector } from '../hooks/redux';
import { selectTaskById } from '../lib/store';
import TaskSummary from './TaskSummary';

export default function TaskDetail({ taskId }: { taskId: string }) {
  const task = useAppSelector(state => selectTaskById(state, taskId));

  if (!task) {
    return (
      <div className="p-6 text-gray-500 flex items-center justify-center h-full">
        Task not found in local state.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {task.id}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm mb-2">
          <div>
            <span className="text-gray-500 block mb-1">Status</span>
            <span className="font-medium text-gray-900">{task.status.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Type</span>
            <span className="font-medium text-gray-900 capitalize">{task.type}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Assignee</span>
            <span className="font-medium text-gray-900">{task.assignee ? task.assignee.name : 'Unassigned'}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Annotations</span>
            <span className="font-medium text-gray-900">{task.annotationCount}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">AI Summary</h3>
        <TaskSummary taskId={taskId} />
      </div>
    </div>
  );
}
