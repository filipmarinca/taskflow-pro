# TaskFlow Pro

A modern, real-time collaborative project management platform built with React, TypeScript, Node.js, and WebSocket technology.

## Features

### Core Functionality
- **Kanban Boards**: Drag-and-drop task cards across customizable columns
- **Multiple Projects**: Organize work into separate project workspaces
- **Rich Task Cards**: Titles, descriptions, priorities, due dates, assignees, labels, checklists, attachments, and comments
- **Multiple Views**: Kanban board, list view, calendar, and timeline/Gantt chart (expandable)
- **Advanced Filtering**: Search and filter tasks by assignee, label, priority, or status

### Real-Time Collaboration
- **Live Presence**: See who's online and viewing the project
- **Real-Time Updates**: See changes as other team members make them
- **Cursor Tracking**: Watch collaborators' cursors move across the board
- **In-App Chat**: Project-specific chat with @mentions
- **Typing Indicators**: Know when someone is typing in chat
- **Instant Notifications**: Get notified of mentions, assignments, and updates
- **Conflict Resolution**: Optimistic UI updates with automatic sync

### Team Features
- **Workspaces**: Separate spaces for different teams or clients
- **Role-Based Permissions**: Owner, Admin, Member, Guest roles
- **Activity Feed**: Track all project changes and updates
- **Time Tracking**: Log time spent on tasks
- **Task Templates**: Reuse common task structures
- **Sprint Planning**: Organize work into sprints
- **Analytics**: Track team productivity and project progress

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for complex state management
- **Socket.io Client** for real-time communication
- **DnD Kit** for drag-and-drop functionality
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Date-fns** for date manipulation
- **Axios** for HTTP requests

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Socket.io** for WebSocket communication
- **PostgreSQL** with Prisma ORM
- **Redis** for presence tracking
- **JWT** for authentication
- **Bcrypt** for password hashing

### DevOps
- **Docker Compose** for local development
- **PostgreSQL 15** containerized database
- **Redis 7** containerized cache

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/filipmarinca/taskflow-pro.git
cd taskflow-pro
\`\`\`

2. **Install dependencies**
\`\`\`bash
pnpm install
\`\`\`

3. **Start Docker services**
\`\`\`bash
docker-compose up -d
\`\`\`

This starts PostgreSQL and Redis containers.

4. **Set up the database**
\`\`\`bash
cd server
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
\`\`\`

5. **Start the development servers**

In the root directory:
\`\`\`bash
pnpm dev
\`\`\`

Or start them separately:
\`\`\`bash
# Terminal 1 - Backend
cd server
pnpm dev

# Terminal 2 - Frontend
cd client
pnpm dev
\`\`\`

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Socket.io: ws://localhost:5000

### Demo Credentials
After seeding, use these credentials:
- **Email**: demo@taskflow.dev
- **Password**: demo123

## Project Structure

\`\`\`
taskflow-pro/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Board/       # Kanban board components
│   │   │   ├── TaskCard/    # Task card and modal
│   │   │   ├── Calendar/    # Calendar view
│   │   │   ├── Chat/        # Real-time chat
│   │   │   └── Layout/      # Layout components
│   │   ├── features/        # Redux slices
│   │   │   ├── authSlice.ts
│   │   │   ├── projectsSlice.ts
│   │   │   ├── tasksSlice.ts
│   │   │   ├── presenceSlice.ts
│   │   │   ├── chatSlice.ts
│   │   │   └── notificationsSlice.ts
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useSocket.ts # WebSocket hook
│   │   │   └── useRedux.ts  # Typed Redux hooks
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # Global styles
│   │   ├── store.ts         # Redux store
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── server/                   # Node.js backend
│   ├── src/
│   │   ├── routes/          # Express routes
│   │   │   ├── auth.ts
│   │   │   ├── workspaces.ts
│   │   │   ├── projects.ts
│   │   │   ├── tasks.ts
│   │   │   ├── chat.ts
│   │   │   └── notifications.ts
│   │   ├── socket/          # Socket.io handlers
│   │   │   └── index.ts
│   │   ├── middleware/      # Express middleware
│   │   │   └── auth.ts
│   │   └── index.ts         # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed data
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml        # Docker services
├── package.json              # Root package.json
└── README.md
\`\`\`

## API Documentation

### Authentication
- \`POST /api/auth/register\` - Register a new user
- \`POST /api/auth/login\` - Login
- \`GET /api/auth/me\` - Get current user

### Workspaces
- \`GET /api/workspaces/:workspaceId/projects\` - List projects
- \`POST /api/workspaces/:workspaceId/projects\` - Create project

### Projects
- \`GET /api/projects/:projectId\` - Get project details
- \`GET /api/projects/:projectId/columns\` - Get columns
- \`POST /api/projects/:projectId/columns\` - Create column
- \`GET /api/projects/:projectId/labels\` - Get labels
- \`GET /api/projects/:projectId/tasks\` - Get all tasks
- \`GET /api/projects/:projectId/activities\` - Get activity feed
- \`GET /api/projects/:projectId/chat\` - Get chat messages
- \`POST /api/projects/:projectId/chat\` - Send chat message

### Tasks
- \`POST /api/columns/:columnId/tasks\` - Create task
- \`PATCH /api/tasks/:taskId\` - Update task
- \`DELETE /api/tasks/:taskId\` - Delete task
- \`GET /api/tasks/:taskId/comments\` - Get comments
- \`POST /api/tasks/:taskId/comments\` - Add comment

### Notifications
- \`GET /api/notifications\` - Get notifications
- \`PATCH /api/notifications/:id/read\` - Mark as read
- \`PATCH /api/notifications/read-all\` - Mark all as read

## WebSocket Events

### Client → Server
- \`join-project\` - Join project room
- \`leave-project\` - Leave project room
- \`task:create\` - Broadcast task creation
- \`task:update\` - Broadcast task update
- \`task:delete\` - Broadcast task deletion
- \`comment:add\` - Broadcast new comment
- \`cursor:move\` - Share cursor position
- \`chat:message\` - Send chat message
- \`chat:typing\` - Typing indicator
- \`activity:new\` - Broadcast activity

### Server → Client
- \`presence:update\` - User joined/online status
- \`presence:left\` - User left
- \`task:created\` - Task was created
- \`task:updated\` - Task was updated
- \`task:deleted\` - Task was deleted
- \`comment:added\` - Comment was added
- \`cursor:move\` - Other user's cursor moved
- \`chat:message\` - New chat message
- \`chat:typing\` - Someone is typing
- \`activity:new\` - New activity
- \`notification:new\` - New notification

## Database Schema

The Prisma schema includes:
- **User**: Authentication and profile
- **Workspace**: Top-level organization
- **Project**: Project container
- **Column**: Board columns
- **Task**: Work items
- **Label**: Task categorization
- **Comment**: Task discussions
- **Attachment**: File uploads
- **Checklist**: Task checklists
- **ChecklistItem**: Individual checklist items
- **Activity**: Audit log
- **ChatMessage**: Team communication
- **Notification**: User notifications

## Environment Variables

### Server (.env)
\`\`\`env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://taskflow:taskflow_dev_password@localhost:5432/taskflow?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
\`\`\`

## Development

### Running Tests
\`\`\`bash
# Frontend tests
cd client
pnpm test

# Backend tests
cd server
pnpm test
\`\`\`

### Database Migrations
\`\`\`bash
cd server
pnpm prisma:migrate
\`\`\`

### Reset Database
\`\`\`bash
cd server
pnpm prisma migrate reset
pnpm prisma:seed
\`\`\`

## Deployment

### Production Build
\`\`\`bash
pnpm build
\`\`\`

### Environment Setup
1. Set up PostgreSQL and Redis instances
2. Configure environment variables
3. Run database migrations
4. Build and deploy frontend to CDN
5. Deploy backend to cloud platform

### Recommended Platforms
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Backend**: Railway, Render, Fly.io
- **Database**: Supabase, Neon, Railway
- **Redis**: Upstash, Redis Cloud

## Features Roadmap

- [ ] Calendar view implementation
- [ ] Timeline/Gantt chart view
- [ ] File upload to S3/cloud storage
- [ ] Email notifications
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Time tracking UI
- [ ] Sprint planning module
- [ ] Analytics dashboard
- [ ] Mobile responsive improvements
- [ ] Dark mode
- [ ] Export to PDF/JSON
- [ ] Keyboard shortcuts
- [ ] Bulk task operations

## Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit changes (\`git commit -m 'feat: add amazing feature'\`)
4. Push to branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with modern web technologies
- Inspired by Trello, Asana, and Linear
- WebSocket implementation for real-time collaboration
- Optimistic UI patterns for seamless UX

## Support

For issues and questions:
- GitHub Issues: https://github.com/filipmarinca/taskflow-pro/issues
- Email: demo@taskflow.dev

---

**TaskFlow Pro** - Real-time collaborative project management for modern teams.
