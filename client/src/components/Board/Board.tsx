import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, Task } from '../../types';
import { Column } from './Column';
import { TaskCard } from '../TaskCard/TaskCard';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { moveTask } from '../../features/tasksSlice';
import axios from 'axios';

interface BoardProps {
  projectId: string;
  columns: ColumnType[];
}

export const Board: React.FC<BoardProps> = ({ projectId, columns }) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(state => state.tasks.tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newColumnId = over.id as string;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.columnId === newColumnId) return;

    const tasksInColumn = tasks.filter(t => t.columnId === newColumnId);
    const newPosition = tasksInColumn.length;

    dispatch(moveTask({ taskId, columnId: newColumnId, position: newPosition }));

    try {
      await axios.patch(`/api/tasks/${taskId}`, {
        columnId: newColumnId,
        position: newPosition,
      });
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-full overflow-x-auto">
        <div className="flex gap-4 p-6 h-full">
          <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
            {columns.map(column => (
              <Column
                key={column.id}
                column={column}
                tasks={tasks.filter(t => t.columnId === column.id)}
              />
            ))}
          </SortableContext>
          
          <button className="flex-shrink-0 w-80 h-fit bg-white rounded-lg p-4 border-2 border-dashed border-gray-300 hover:border-primary-400 text-gray-600 hover:text-primary-600 transition-colors">
            + Add Column
          </button>
        </div>
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
};
