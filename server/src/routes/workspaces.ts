import { Router } from 'express';
import { prisma } from '../index.js';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/:workspaceId/projects', async (req: AuthRequest, res) => {
  try {
    const { workspaceId } = req.params;

    const projects = await prisma.project.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    res.json(projects);
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/:workspaceId/projects', async (req: AuthRequest, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description, color } = req.body;

    const project = await prisma.project.create({
      data: {
        workspaceId,
        name,
        description,
        color,
      },
    });

    // Create default columns
    await prisma.column.createMany({
      data: [
        { projectId: project.id, name: 'To Do', position: 0 },
        { projectId: project.id, name: 'In Progress', position: 1 },
        { projectId: project.id, name: 'Review', position: 2 },
        { projectId: project.id, name: 'Done', position: 3 },
      ],
    });

    res.json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

export default router;
