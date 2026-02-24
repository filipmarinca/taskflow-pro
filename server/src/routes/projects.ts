import { Router } from 'express';
import { prisma } from '../index.js';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/:projectId', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    res.json(project);
  } catch (error) {
    console.error('Fetch project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.get('/:projectId/columns', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;

    const columns = await prisma.column.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
    });

    res.json(columns);
  } catch (error) {
    console.error('Fetch columns error:', error);
    res.status(500).json({ error: 'Failed to fetch columns' });
  }
});

router.post('/:projectId/columns', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const { name, position } = req.body;

    const column = await prisma.column.create({
      data: {
        projectId,
        name,
        position,
      },
    });

    res.json(column);
  } catch (error) {
    console.error('Create column error:', error);
    res.status(500).json({ error: 'Failed to create column' });
  }
});

router.get('/:projectId/labels', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;

    const labels = await prisma.label.findMany({
      where: { projectId },
    });

    res.json(labels);
  } catch (error) {
    console.error('Fetch labels error:', error);
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});

router.get('/:projectId/tasks', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignees: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        labels: true,
        checklists: {
          include: {
            items: true,
          },
        },
        attachments: true,
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { position: 'asc' },
    });

    const formattedTasks = tasks.map(task => ({
      ...task,
      assigneeIds: task.assignees.map(a => a.id),
      labelIds: task.labels.map(l => l.id),
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.get('/:projectId/activities', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;

    const activities = await prisma.activity.findMany({
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
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(activities);
  } catch (error) {
    console.error('Fetch activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;
