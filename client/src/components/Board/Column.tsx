import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column as ColumnType, Task } from '../../types';
import { TaskCard } from '../TaskCard/TaskCard';
import { useAppDispatch } from '../../hooks/useRedux';
import { createTask } from '../../features/tasksSlice';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
}

export const Column: React.FC<ColumnProps> = ({ column, tasks }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const dispatch = useAppDispatch();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await dispatch(createTask({
      columnId: column.id,
      title: newTaskTitle,
      projectId: column.projectId,
    }));

    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4 flex flex-col max-h-full"
    >
      <div className="flex items-center justify-between mb-4" {...attributes} {...listeners}>
        <h3 className="font-semibold text-gray-900">
          {column.name} <span className="text-gray-500 text-sm">({tasks.length})</span>
        </h3>
        <button className="text-gray-500 hover:text-gray-700">⋮</button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
        {sortedTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {isAddingTask ? (
        <form onSubmit={handleAddTask} className="mt-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Enter task title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
            onBlur={() => {
              if (!newTaskTitle.trim()) {
                setIsAddingTask(false);
              }
            }}
          />
        </form>
      ) : (
        <button
          onClick={() => setIsAddingTask(true)}
          className="mt-2 w-full py-2 text-left text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md px-3 transition-colors"
        >
          + Add Task
        </button>
      )}
    </div>
  );
};
