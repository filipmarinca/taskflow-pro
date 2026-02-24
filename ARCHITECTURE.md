# TaskFlow Pro - Architecture Documentation

## System Overview

TaskFlow Pro is a real-time collaborative project management platform built on a modern tech stack with WebSocket-based real-time communication, Redux state management, and PostgreSQL persistence.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React 18 + TypeScript                   │   │
│  │  ┌───────────┐  ┌──────────┐  ┌──────────────┐    │   │
│  │  │  Pages    │  │Components│  │  Redux Store │    │   │
│  │  └───────────┘  └──────────┘  └──────────────┘    │   │
│  │                                                      │   │
│  │  ┌──────────────────────┐   ┌──────────────────┐  │   │
│  │  │  Socket.io Client    │   │   Axios (HTTP)   │  │   │
│  │  └──────────────────────┘   └──────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │                │
                   WebSocket│                │HTTP
                            │                │
┌─────────────────────────────────────────────────────────────┐
│                      Server (Node.js)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Express + TypeScript Server                │   │
│  │  ┌──────────────────┐      ┌─────────────────────┐ │   │
│  │  │  Socket.io       │      │   REST API Routes   │ │   │
│  │  │  Event Handlers  │      │   /api/*            │ │   │
│  │  └──────────────────┘      └─────────────────────┘ │   │
│  │                                                      │   │
│  │  ┌──────────────────┐      ┌─────────────────────┐ │   │
│  │  │  Authentication  │      │   Business Logic    │ │   │
│  │  │  Middleware      │      │   Controllers       │ │   │
│  │  └──────────────────┘      └─────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                    │                      │
                    │                      │
        ┌───────────┴────────┐   ┌────────┴──────────┐
        │                    │   │                    │
┌───────▼────────┐  ┌────────▼───▼──┐  ┌─────────────▼────┐
│     Redis      │  │  PostgreSQL    │  │   File Storage   │
│  (Presence)    │  │  (Persistence) │  │  (Future: S3)    │
└────────────────┘  └────────────────┘  └──────────────────┘
```

## Technology Stack

### Frontend
- **React 18**: UI framework with hooks and concurrent features
- **TypeScript**: Type safety and better developer experience
- **Redux Toolkit**: Predictable state management with slices
- **Socket.io Client**: Real-time WebSocket communication
- **DnD Kit**: Modern drag-and-drop for Kanban boards
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client with interceptors
- **Date-fns**: Date manipulation and formatting

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web application framework
- **TypeScript**: Type-safe server code
- **Socket.io**: WebSocket server for real-time events
- **Prisma**: Type-safe ORM for PostgreSQL
- **PostgreSQL**: Relational database
- **Redis**: In-memory store for presence tracking
- **JWT**: Token-based authentication
- **Bcrypt**: Password hashing

## Data Flow

### 1. Authentication Flow
```
User → Login Form → POST /api/auth/login → Validate credentials
                                          → Generate JWT
                                          → Return user + token
                                          → Store in localStorage
                                          → Redirect to dashboard
```

### 2. Real-Time Collaboration Flow
```
User Action (e.g., move task)
    ↓
Optimistic Update (Redux)
    ↓
HTTP PATCH /api/tasks/:id (persist)
    ↓
Socket emit 'task:update' (broadcast)
    ↓
Socket.io Server receives event
    ↓
Broadcast to all clients in project room
    ↓
Other clients receive 'task:updated' event
    ↓
Redux state updated on all clients
    ↓
UI re-renders with new state
```

### 3. Presence Tracking Flow
```
User joins project
    ↓
Socket emit 'join-project' with projectId
    ↓
Server stores presence in Redis: presence:projectId → {userId: data}
    ↓
Server broadcasts 'presence:update' to project room
    ↓
All clients update presence state
    ↓
UI shows online indicators
```

## State Management

### Redux Store Structure
```typescript
{
  auth: {
    user: User | null,
    token: string | null,
    loading: boolean,
    error: string | null
  },
  projects: {
    projects: Project[],
    currentProject: Project | null,
    columns: Column[],
    labels: Label[],
    loading: boolean,
    error: string | null
  },
  tasks: {
    tasks: Task[],
    comments: Record<taskId, Comment[]>,
    activities: Activity[],
    selectedTask: Task | null,
    loading: boolean,
    error: string | null
  },
  presence: {
    users: Record<userId, Presence>
  },
  chat: {
    messages: Record<projectId, ChatMessage[]>,
    typingUsers: Record<projectId, userId[]>,
    loading: boolean
  },
  notifications: {
    notifications: Notification[],
    unreadCount: number,
    loading: boolean
  }
}
```

## Database Schema

### Core Entities
- **User**: Authentication and profile information
- **Workspace**: Top-level organization container
- **Project**: Project container with settings
- **Column**: Board columns (To Do, In Progress, etc.)
- **Task**: Work items with rich metadata
- **Label**: Categorization tags
- **Comment**: Task discussions
- **Attachment**: File references
- **Checklist**: Task sub-items
- **Activity**: Audit log of changes
- **ChatMessage**: Team communication
- **Notification**: User notifications

### Relationships
```
User 1─→N Task (created)
User N─→N Task (assigned)
Project 1─→N Column
Column 1─→N Task
Task 1─→N Comment
Task 1─→N Attachment
Task 1─→N Checklist
Checklist 1─→N ChecklistItem
Project 1─→N Activity
Project 1─→N ChatMessage
```

## WebSocket Events

### Client → Server
- `join-project`: Join project room for updates
- `leave-project`: Leave project room
- `task:create`: Broadcast task creation
- `task:update`: Broadcast task update
- `task:delete`: Broadcast task deletion
- `comment:add`: Broadcast new comment
- `cursor:move`: Share cursor position
- `chat:message`: Send chat message
- `chat:typing`: Typing indicator

### Server → Client
- `presence:update`: User joined/status changed
- `presence:left`: User left project
- `task:created`: Task was created
- `task:updated`: Task was updated
- `task:deleted`: Task was deleted
- `comment:added`: Comment was added
- `cursor:move`: Other user's cursor moved
- `chat:message`: New chat message received
- `chat:typing`: Someone is typing
- `activity:new`: New activity logged
- `notification:new`: New notification

## Security

### Authentication
- JWT tokens with expiration
- Bcrypt password hashing (10 rounds)
- Token validation middleware
- Secure HTTP-only cookies (optional enhancement)

### Authorization
- Role-based access control (Owner, Admin, Member, Guest)
- Project membership validation
- Resource ownership checks

### Data Protection
- SQL injection prevention via Prisma
- XSS prevention via React's built-in escaping
- CORS configuration for allowed origins
- Rate limiting (future enhancement)

## Performance Optimizations

### Frontend
- Code splitting with React.lazy
- Memoization with useMemo and useCallback
- Virtual scrolling for large lists (future)
- Optimistic UI updates
- Debounced search and filters

### Backend
- Database indexing on foreign keys
- Redis for fast presence lookups
- Connection pooling for PostgreSQL
- Efficient query patterns with Prisma

### Real-Time
- Socket.io rooms for targeted broadcasting
- Reconnection logic with exponential backoff
- Event throttling for high-frequency updates

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers (JWT in header)
- Redis for shared session state
- Socket.io Redis adapter for multi-server setup
- Load balancer for distributing requests

### Database Scaling
- Read replicas for query distribution
- Connection pooling
- Indexed queries
- Pagination for large datasets

### Caching Strategy
- Redis for presence data (TTL-based)
- Client-side caching with Redux
- HTTP caching headers (future)

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Load Balancer                      │
│                   (Nginx/Cloudflare)                 │
└─────────────────────────────────────────────────────┘
              │                         │
    ┌─────────┴──────┐        ┌────────┴─────────┐
    │                │        │                   │
┌───▼────┐      ┌───▼────┐  ┌▼──────────┐  ┌────▼────┐
│ Web    │      │ Web    │  │ API       │  │ API     │
│ Server │      │ Server │  │ Server 1  │  │ Server 2│
│ (CDN)  │      │ (CDN)  │  │           │  │         │
└────────┘      └────────┘  └───────────┘  └─────────┘
                                   │              │
                            ┌──────┴──────────────┘
                            │
                 ┌──────────▼───────────┐
                 │  PostgreSQL Primary  │
                 │  (+ Read Replicas)   │
                 └──────────────────────┘
                            │
                 ┌──────────▼───────────┐
                 │   Redis Cluster      │
                 │   (Presence/Cache)   │
                 └──────────────────────┘
```

## Future Enhancements

### Features
- Calendar view implementation
- Timeline/Gantt chart
- File upload to S3/R2
- Email notifications
- Mobile apps (React Native)
- Advanced analytics dashboard
- AI-powered task suggestions

### Technical
- GraphQL API option
- Elasticsearch for full-text search
- Kubernetes deployment
- Prometheus monitoring
- Sentry error tracking
- End-to-end tests (Playwright)
- CI/CD pipeline (GitHub Actions)

## Development Guidelines

### Code Organization
- Feature-based folder structure
- Colocate related code
- Single responsibility principle
- Type safety everywhere

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- WebSocket event testing

### Git Workflow
- Feature branches from main
- Conventional commits
- Pull request reviews
- CI checks before merge

## Monitoring and Observability

### Logging
- Structured logging with Winston (future)
- Request/response logging
- Error stack traces
- Performance metrics

### Metrics
- API response times
- WebSocket connection count
- Database query performance
- Redis hit rates

### Alerts
- Server health checks
- Database connection failures
- High error rates
- Memory/CPU thresholds

---

Last updated: February 2026
