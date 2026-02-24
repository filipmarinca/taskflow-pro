import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { redisClient } from '../index.js';

interface AuthSocket extends Socket {
  userId?: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    console.log(`User connected: ${socket.userId}`);

    socket.on('join-project', async (projectId: string) => {
      socket.join(projectId);
      
      // Store presence in Redis
      await redisClient.hSet(`presence:${projectId}`, socket.userId!, JSON.stringify({
        userId: socket.userId,
        projectId,
        online: true,
        lastSeen: new Date().toISOString(),
      }));

      // Broadcast presence update
      const presenceData = await redisClient.hGetAll(`presence:${projectId}`);
      const onlineUsers = Object.values(presenceData).map(data => JSON.parse(data));
      
      io.to(projectId).emit('presence:update', {
        userId: socket.userId,
        projectId,
        online: true,
        lastSeen: new Date().toISOString(),
      });

      console.log(`User ${socket.userId} joined project ${projectId}`);
    });

    socket.on('leave-project', async (projectId: string) => {
      socket.leave(projectId);
      
      await redisClient.hDel(`presence:${projectId}`, socket.userId!);
      io.to(projectId).emit('presence:left', socket.userId);
      
      console.log(`User ${socket.userId} left project ${projectId}`);
    });

    // Task events
    socket.on('task:create', (data) => {
      io.to(data.projectId).emit('task:created', data.task);
    });

    socket.on('task:update', (data) => {
      io.to(data.projectId).emit('task:updated', data.task);
    });

    socket.on('task:delete', (data) => {
      io.to(data.projectId).emit('task:deleted', data.taskId);
    });

    // Comment events
    socket.on('comment:add', (data) => {
      io.to(data.projectId).emit('comment:added', {
        taskId: data.taskId,
        comment: data.comment,
      });
    });

    // Cursor tracking
    socket.on('cursor:move', (data) => {
      socket.to(data.projectId).emit('cursor:move', {
        userId: socket.userId,
        x: data.x,
        y: data.y,
      });
    });

    // Chat events
    socket.on('chat:message', (data) => {
      io.to(data.projectId).emit('chat:message', {
        projectId: data.projectId,
        message: data.message,
      });
    });

    socket.on('chat:typing', (data) => {
      socket.to(data.projectId).emit('chat:typing', {
        projectId: data.projectId,
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    // Activity events
    socket.on('activity:new', (data) => {
      io.to(data.projectId).emit('activity:new', data.activity);
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      // Clean up presence from all projects
      const keys = await redisClient.keys('presence:*');
      for (const key of keys) {
        await redisClient.hDel(key, socket.userId!);
        const projectId = key.split(':')[1];
        io.to(projectId).emit('presence:left', socket.userId);
      }
    });
  });
};
