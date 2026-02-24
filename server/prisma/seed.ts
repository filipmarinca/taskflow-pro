import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@taskflow.dev',
      password: hashedPassword,
      name: 'Demo User',
      role: 'OWNER',
    },
  });

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Demo Workspace',
      description: 'A sample workspace to showcase TaskFlow Pro',
      ownerId: user.id,
    },
  });

  // Create project
  const project = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: 'Product Launch',
      description: 'Launch our new product with marketing campaign and feature rollout',
      color: '#3B82F6',
    },
  });

  // Create columns
  const todoColumn = await prisma.column.create({
    data: {
      projectId: project.id,
      name: 'To Do',
      position: 0,
    },
  });

  const inProgressColumn = await prisma.column.create({
    data: {
      projectId: project.id,
      name: 'In Progress',
      position: 1,
    },
  });

  const reviewColumn = await prisma.column.create({
    data: {
      projectId: project.id,
      name: 'Review',
      position: 2,
    },
  });

  const doneColumn = await prisma.column.create({
    data: {
      projectId: project.id,
      name: 'Done',
      position: 3,
    },
  });

  // Create labels
  const bugLabel = await prisma.label.create({
    data: {
      projectId: project.id,
      name: 'Bug',
      color: '#EF4444',
    },
  });

  const featureLabel = await prisma.label.create({
    data: {
      projectId: project.id,
      name: 'Feature',
      color: '#10B981',
    },
  });

  const designLabel = await prisma.label.create({
    data: {
      projectId: project.id,
      name: 'Design',
      color: '#8B5CF6',
    },
  });

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      columnId: todoColumn.id,
      projectId: project.id,
      title: 'Design landing page mockups',
      description: 'Create high-fidelity mockups for the product landing page with mobile and desktop views',
      priority: 'HIGH',
      position: 0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdById: user.id,
      assignees: { connect: [{ id: user.id }] },
      labels: { connect: [{ id: designLabel.id }] },
    },
  });

  const task2 = await prisma.task.create({
    data: {
      columnId: inProgressColumn.id,
      projectId: project.id,
      title: 'Implement authentication flow',
      description: 'Set up JWT authentication with login, register, and password reset',
      priority: 'URGENT',
      position: 0,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdById: user.id,
      assignees: { connect: [{ id: user.id }] },
      labels: { connect: [{ id: featureLabel.id }] },
    },
  });

  const task3 = await prisma.task.create({
    data: {
      columnId: reviewColumn.id,
      projectId: project.id,
      title: 'Fix mobile navigation bug',
      description: 'Navigation menu not closing properly on mobile devices',
      priority: 'HIGH',
      position: 0,
      createdById: user.id,
      assignees: { connect: [{ id: user.id }] },
      labels: { connect: [{ id: bugLabel.id }] },
    },
  });

  const task4 = await prisma.task.create({
    data: {
      columnId: doneColumn.id,
      projectId: project.id,
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment',
      priority: 'MEDIUM',
      position: 0,
      createdById: user.id,
      assignees: { connect: [{ id: user.id }] },
      labels: { connect: [{ id: featureLabel.id }] },
    },
  });

  // Create checklist
  await prisma.checklist.create({
    data: {
      taskId: task1.id,
      title: 'Design checklist',
      items: {
        create: [
          { title: 'Research competitor designs', completed: true, position: 0 },
          { title: 'Create wireframes', completed: true, position: 1 },
          { title: 'Design hero section', completed: false, position: 2 },
          { title: 'Design features section', completed: false, position: 3 },
        ],
      },
    },
  });

  // Create comments
  await prisma.comment.create({
    data: {
      taskId: task2.id,
      userId: user.id,
      content: 'Started working on the login page. JWT implementation is straightforward.',
      mentions: [],
    },
  });

  await prisma.comment.create({
    data: {
      taskId: task2.id,
      userId: user.id,
      content: 'Added password reset functionality. Ready for review.',
      mentions: [],
    },
  });

  // Create activity
  await prisma.activity.create({
    data: {
      projectId: project.id,
      taskId: task2.id,
      userId: user.id,
      action: 'task_created',
      details: {
        taskTitle: task2.title,
      },
    },
  });

  console.log('Seeding completed!');
  console.log('Demo credentials:');
  console.log('Email: demo@taskflow.dev');
  console.log('Password: demo123');
  console.log(`Project ID: ${project.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
