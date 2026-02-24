export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  projectId: string;
  name: string;
  position: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  columnId: string;
  projectId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  position: number;
  dueDate?: string;
  assigneeIds: string[];
  labelIds: string[];
  attachments: Attachment[];
  checklists: Checklist[];
  timeEstimate?: number;
  timeSpent?: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  projectId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  mentions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  taskId: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedById: string;
  createdAt: string;
}

export interface Checklist {
  id: string;
  taskId: string;
  title: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  completed: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  projectId: string;
  taskId?: string;
  userId: string;
  action: string;
  details: Record<string, any>;
  createdAt: string;
}

export interface Presence {
  userId: string;
  projectId: string;
  cursor?: { x: number; y: number };
  viewing?: string;
  online: boolean;
  lastSeen: string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  mentions: string[];
  replyTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'assignment' | 'comment' | 'due_date' | 'status_change';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
