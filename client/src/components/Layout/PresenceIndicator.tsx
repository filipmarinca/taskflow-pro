import React from 'react';
import { useAppSelector } from '../../hooks/useRedux';

interface PresenceIndicatorProps {
  projectId: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ projectId }) => {
  const presence = useAppSelector(state => state.presence.users);
  const currentUserId = useAppSelector(state => state.auth.user?.id);
  
  const activeUsers = Object.values(presence).filter(
    p => p.projectId === projectId && p.online && p.userId !== currentUserId
  );

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {activeUsers.slice(0, 5).map((user) => (
          <div
            key={user.userId}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
            title={user.userId}
          >
            {user.userId.substring(0, 2).toUpperCase()}
          </div>
        ))}
      </div>
      {activeUsers.length > 5 && (
        <span className="text-sm text-gray-600">+{activeUsers.length - 5}</span>
      )}
      <span className="text-sm text-gray-600">
        {activeUsers.length} {activeUsers.length === 1 ? 'person' : 'people'} online
      </span>
    </div>
  );
};
