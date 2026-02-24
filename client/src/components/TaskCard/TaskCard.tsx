import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types';
import { useAppDispatch } from '../../hooks/useRedux';
import { setSelectedTask } from '../../features/tasksSlice';
import { formatDistanceToNow } from 'date-fns';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging }) => {
  const dispatch = useAppDispatch();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    low: 'bg-gray-200 text-gray-700',
    medium: 'bg-blue-200 text-blue-700',
    high: 'bg-orange-200 text-orange-700',
    urgent: 'bg-red-200 text-red-700',
  };

  const handleClick = () => {
    dispatch(setSelectedTask(task));
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 flex-1 text-sm">{task.title}</h4>
        <span className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {task.assigneeIds.length > 0 && (
            <div className="flex -space-x-1">
              {task.assigneeIds.slice(0, 3).map((id, idx) => (
                <div
                  key={id}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs"
                >
                  {id.substring(0, 1).toUpperCase()}
                </div>
              ))}
            </div>
          )}
          
          {task.checklists.length > 0 && (
            <span>
              ✓ {task.checklists.reduce((acc, cl) => acc + cl.items.filter(i => i.completed).length, 0)}/
              {task.checklists.reduce((acc, cl) => acc + cl.items.length, 0)}
            </span>
          )}
          
          {task.attachments.length > 0 && <span>📎 {task.attachments.length}</span>}
        </div>

        {task.dueDate && (
          <span className={new Date(task.dueDate) < new Date() ? 'text-red-600' : ''}>
            {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
          </span>
        )}
      </div>

      {task.labelIds.length > 0 && (
        <div className="flex gap-1 mt-2">
          {task.labelIds.slice(0, 3).map((labelId) => (
            <div key={labelId} className="w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
          ))}
        </div>
      )}
    </div>
  );
};
