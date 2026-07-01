import { useState } from 'react';
import { useAppSelector } from '../hooks/redux';
import { selectFilteredAndSortedTasks } from '../lib/store';
import { TaskStatus } from '../lib/types';
import { useGetTasksQuery } from '../lib/api';
import { Pagination } from './Pagination';

export default function TaskList({ onSelectTask, selectedTaskId }: { onSelectTask: (id: string) => void, selectedTaskId: string | null }) {
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'title'>('updatedAt');
  
  const [page, setPage] = useState(1);
  const { data, isFetching } = useGetTasksQuery({ page, pageSize: 20 });
  
  const tasks = useAppSelector(state => selectFilteredAndSortedTasks(state, filterType, filterStatus, searchQuery, sortBy));
  const pageSize = 20;
  const paginatedTasks = tasks.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-gray-50/50">
        <input 
          type="text" 
          placeholder="Search tasks..." 
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-48 focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <select 
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white outline-none"
          value={filterType || ''}
          onChange={(e) => setFilterType(e.target.value || null)}
        >
          <option value="">All Types</option>
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="audio">Audio</option>
          <option value="unknown">Unknown</option>
        </select>

        <select 
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white outline-none"
          value={filterStatus || ''}
          onChange={(e) => setFilterStatus(e.target.value as TaskStatus || null)}
        >
          <option value="">All Statuses</option>
          <option value={TaskStatus.TODO}>Todo</option>
          <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
          <option value={TaskStatus.QA}>QA</option>
          <option value={TaskStatus.DONE}>Done</option>
          <option value={TaskStatus.BLOCKED}>Blocked</option>
        </select>

        <select 
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white outline-none"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'updatedAt' | 'title')}
        >
          <option value="updatedAt">Sort by Newest</option>
          <option value="title">Sort by Title</option>
        </select>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-100 text-gray-600 sticky top-0 shadow-sm z-10">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Assignee</th>
              <th className="px-4 py-3 font-medium text-right">Annotations</th>
              <th className="px-4 py-3 font-medium text-right">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  No tasks found matching your filters.
                </td>
              </tr>
            ) : (
              paginatedTasks.map(task => (
                <tr 
                  key={task.id} 
                  onClick={() => onSelectTask(task.id)}
                  className={`cursor-pointer transition-colors ${selectedTaskId === task.id ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{task.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${task.type === 'image' ? 'bg-purple-100 text-purple-800' : task.type === 'text' ? 'bg-green-100 text-green-800' : task.type === 'audio' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                      {task.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-700">{task.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {task.assignee ? task.assignee.name : <span className="text-gray-300 italic">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 tabular-nums">{task.annotationCount}</td>
                  <td className="px-4 py-3 text-right text-gray-500 tabular-nums">
                    {new Date(task.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {tasks.length > 0 && (
        <div className="p-4 border-t border-gray-100 flex justify-center bg-white">
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
          />
        </div>
      )}
    </div>
  );
}
