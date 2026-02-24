import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { setSelectedTask, updateTask, fetchComments } from '../../features/tasksSlice';

export const TaskModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedTask = useAppSelector(state => state.tasks.selectedTask);
  const comments = useAppSelector(state => 
    selectedTask ? state.tasks.comments[selectedTask.id] || [] : []
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title);
      setDescription(selectedTask.description || '');
      dispatch(fetchComments(selectedTask.id));
    }
  }, [selectedTask, dispatch]);

  if (!selectedTask) return null;

  const handleClose = () => {
    dispatch(setSelectedTask(null));
  };

  const handleSave = async () => {
    await dispatch(updateTask({
      taskId: selectedTask.id,
      updates: { title, description },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            className="text-2xl font-bold text-gray-900 flex-1 outline-none"
          />
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSave}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Add a description..."
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Comments</h3>
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                        {comment.userId.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{comment.userId}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Write a comment..."
                />
                <button className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                  Add Comment
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={selectedTask.priority}
                onChange={(e) => dispatch(updateTask({
                  taskId: selectedTask.id,
                  updates: { priority: e.target.value as any },
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : ''}
                onChange={(e) => dispatch(updateTask({
                  taskId: selectedTask.id,
                  updates: { dueDate: e.target.value },
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignees
              </label>
              <button className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-primary-400 hover:text-primary-600">
                + Add Assignee
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Labels
              </label>
              <button className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-primary-400 hover:text-primary-600">
                + Add Label
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
