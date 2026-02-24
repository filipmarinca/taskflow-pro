import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Task, Comment, Activity } from '../types';

interface TasksState {
  tasks: Task[];
  comments: Record<string, Comment[]>;
  activities: Activity[];
  loading: boolean;
  error: string | null;
  selectedTask: Task | null;
}

const initialState: TasksState = {
  tasks: [],
  comments: {},
  activities: [],
  loading: false,
  error: null,
  selectedTask: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (projectId: string) => {
    const response = await axios.get(`/api/projects/${projectId}/tasks`);
    return response.data;
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ columnId, title, projectId }: { columnId: string; title: string; projectId: string }) => {
    const response = await axios.post(`/api/columns/${columnId}/tasks`, {
      title,
      projectId,
    });
    return response.data;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
    const response = await axios.patch(`/api/tasks/${taskId}`, updates);
    return response.data;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string) => {
    await axios.delete(`/api/tasks/${taskId}`);
    return taskId;
  }
);

export const fetchComments = createAsyncThunk(
  'tasks/fetchComments',
  async (taskId: string) => {
    const response = await axios.get(`/api/tasks/${taskId}/comments`);
    return { taskId, comments: response.data };
  }
);

export const addComment = createAsyncThunk(
  'tasks/addComment',
  async ({ taskId, content, mentions }: { taskId: string; content: string; mentions: string[] }) => {
    const response = await axios.post(`/api/tasks/${taskId}/comments`, {
      content,
      mentions,
    });
    return { taskId, comment: response.data };
  }
);

export const fetchActivities = createAsyncThunk(
  'tasks/fetchActivities',
  async (projectId: string) => {
    const response = await axios.get(`/api/projects/${projectId}/activities`);
    return response.data;
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTaskLocally: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },
    moveTask: (state, action: PayloadAction<{ taskId: string; columnId: string; position: number }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.columnId = action.payload.columnId;
        task.position = action.payload.position;
      }
    },
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    addCommentLocally: (state, action: PayloadAction<{ taskId: string; comment: Comment }>) => {
      if (!state.comments[action.payload.taskId]) {
        state.comments[action.payload.taskId] = [];
      }
      state.comments[action.payload.taskId].push(action.payload.comment);
    },
    addActivity: (state, action: PayloadAction<Activity>) => {
      state.activities.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments[action.payload.taskId] = action.payload.comments;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        if (!state.comments[action.payload.taskId]) {
          state.comments[action.payload.taskId] = [];
        }
        state.comments[action.payload.taskId].push(action.payload.comment);
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.activities = action.payload;
      });
  },
});

export const {
  addTask,
  updateTaskLocally,
  removeTask,
  moveTask,
  setSelectedTask,
  addCommentLocally,
  addActivity,
} = tasksSlice.actions;

export default tasksSlice.reducer;
