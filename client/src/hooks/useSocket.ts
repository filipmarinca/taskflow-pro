import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from './useRedux';
import { addTask, updateTaskLocally, removeTask, addCommentLocally, addActivity } from '../features/tasksSlice';
import { setPresence, removePresence, updateCursor } from '../features/presenceSlice';
import { addMessage, setTyping } from '../features/chatSlice';
import { addNotification } from '../features/notificationsSlice';

export const useSocket = (projectId?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const token = useAppSelector(state => state.auth.token);

  useEffect(() => {
    if (!token || !user) return;

    const socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      if (projectId) {
        socket.emit('join-project', projectId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Task events
    socket.on('task:created', (task) => {
      dispatch(addTask(task));
    });

    socket.on('task:updated', (task) => {
      dispatch(updateTaskLocally(task));
    });

    socket.on('task:deleted', (taskId) => {
      dispatch(removeTask(taskId));
    });

    // Comment events
    socket.on('comment:added', ({ taskId, comment }) => {
      dispatch(addCommentLocally({ taskId, comment }));
    });

    // Activity events
    socket.on('activity:new', (activity) => {
      dispatch(addActivity(activity));
    });

    // Presence events
    socket.on('presence:update', (presence) => {
      dispatch(setPresence(presence));
    });

    socket.on('presence:left', (userId) => {
      dispatch(removePresence(userId));
    });

    socket.on('cursor:move', ({ userId, x, y }) => {
      dispatch(updateCursor({ userId, x, y }));
    });

    // Chat events
    socket.on('chat:message', ({ projectId, message }) => {
      dispatch(addMessage({ projectId, message }));
    });

    socket.on('chat:typing', ({ projectId, userId, isTyping }) => {
      dispatch(setTyping({ projectId, userId, isTyping }));
    });

    // Notification events
    socket.on('notification:new', (notification) => {
      dispatch(addNotification(notification));
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user, projectId, dispatch]);

  const emitCursorMove = (x: number, y: number) => {
    if (socketRef.current && projectId) {
      socketRef.current.emit('cursor:move', { projectId, x, y });
    }
  };

  const emitTyping = (isTyping: boolean) => {
    if (socketRef.current && projectId) {
      socketRef.current.emit('chat:typing', { projectId, isTyping });
    }
  };

  return {
    socket: socketRef.current,
    emitCursorMove,
    emitTyping,
  };
};
