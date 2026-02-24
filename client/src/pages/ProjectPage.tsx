import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchProjectDetails } from '../../features/projectsSlice';
import { fetchTasks } from '../../features/tasksSlice';
import { useSocket } from '../../hooks/useSocket';
import { Board } from '../../components/Board/Board';
import { TaskModal } from '../../components/TaskCard/TaskModal';
import { Chat } from '../../components/Chat/Chat';
import { PresenceIndicator } from '../../components/Layout/PresenceIndicator';

export const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const { currentProject, columns } = useAppSelector(state => state.projects);
  const [showChat, setShowChat] = useState(false);
  
  useSocket(projectId);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectDetails(projectId));
      dispatch(fetchTasks(projectId));
    }
  }, [projectId, dispatch]);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentProject.name}</h1>
          {currentProject.description && (
            <p className="text-sm text-gray-600 mt-1">{currentProject.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <PresenceIndicator projectId={projectId!} />
          <button
            onClick={() => setShowChat(!showChat)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            {showChat ? 'Hide Chat' : 'Show Chat'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 overflow-hidden ${showChat ? 'mr-80' : ''}`}>
          <Board projectId={projectId!} columns={columns} />
        </div>
        
        {showChat && (
          <div className="w-80 border-l border-gray-200 bg-white">
            <Chat projectId={projectId!} />
          </div>
        )}
      </div>

      <TaskModal />
    </div>
  );
};
