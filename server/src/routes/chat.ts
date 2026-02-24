import { Router } from 'express';
import { prisma } from '../index.js';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/projects/:projectId/chat', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;

    const messages = await prisma.chatMessage.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    res.json(messages);
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/projects/:projectId/chat', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const { content, mentions } = req.body;

    const message = await prisma.chatMessage.create({
      data: {
        projectId,
        userId: req.userId!,
        content,
        mentions,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
