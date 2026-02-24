import { Router } from 'express';
import { prisma } from '../index.js';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/columns/:columnId/tasks', async (req: AuthRequest, res) => {
  try {
    const { columnId } = req.params;
    const { title, projectId } = req.body;

    const tasksInColumn = await prisma.task.count({ where: { columnId } });

    const task = await prisma.task.create({
      data: {
        columnId,
        projectId,
        title,
        position: tasksInColumn,
        createdById: req.userId!,
      },
      include: {
        assignees: true,
        labels: true,
        checklists: {
          include: { items: true },
        },
        attachments: true,
      },
    });

    res.json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.patch('/:taskId', async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updates,
      include: {
        assignees: true,
        labels: true,
        checklists: {
          include: { items: true },
        },
        attachments: true,
      },
    });

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:taskId', async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params;

    await prisma.task.delete({ where: { id: taskId } });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

router.get('/:taskId/comments', async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { taskId },
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
    });

    res.json(comments);
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

router.post('/:taskId/comments', async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params;
    const { content, mentions } = req.body;

    const comment = await prisma.comment.create({
      data: {
        taskId,
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

    // Create notifications for mentions
    if (mentions && mentions.length > 0) {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { title: true },
      });

      await prisma.notification.createMany({
        data: mentions.map((userId: string) => ({
          userId,
          type: 'MENTION',
          title: 'You were mentioned',
          message: `You were mentioned in task "${task?.title}"`,
          link: `/tasks/${taskId}`,
        })),
      });
    }

    res.json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

export default router;
