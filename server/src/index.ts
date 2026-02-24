import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import authRoutes from './routes/auth.js';
import workspaceRoutes from './routes/workspaces.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notifications.js';
import { setupSocketHandlers } from './socket/index.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

export const prisma = new PrismaClient();
export const redisClient = createClient({ url: process.env.REDIS_URL });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', authenticateToken, workspaceRoutes);
app.use('/api/projects', authenticateToken, projectRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);
app.use('/api', authenticateToken, chatRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);

// Socket.IO setup
setupSocketHandlers(io);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to Redis
redisClient.connect().catch(console.error);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server ready`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  await redisClient.quit();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
