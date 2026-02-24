import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Project, Column, Label } from '../types';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  columns: Column[];
  labels: Label[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  columns: [],
  labels: [],
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (workspaceId: string) => {
    const response = await axios.get(`/api/workspaces/${workspaceId}/projects`);
    return response.data;
  }
);

export const fetchProjectDetails = createAsyncThunk(
  'projects/fetchProjectDetails',
  async (projectId: string) => {
    const [project, columns, labels] = await Promise.all([
      axios.get(`/api/projects/${projectId}`),
      axios.get(`/api/projects/${projectId}/columns`),
      axios.get(`/api/projects/${projectId}/labels`),
    ]);
    return {
      project: project.data,
      columns: columns.data,
      labels: labels.data,
    };
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async ({ workspaceId, name, description, color }: { workspaceId: string; name: string; description?: string; color: string }) => {
    const response = await axios.post(`/api/workspaces/${workspaceId}/projects`, {
      name,
      description,
      color,
    });
    return response.data;
  }
);

export const createColumn = createAsyncThunk(
  'projects/createColumn',
  async ({ projectId, name, position }: { projectId: string; name: string; position: number }) => {
    const response = await axios.post(`/api/projects/${projectId}/columns`, {
      name,
      position,
    });
    return response.data;
  }
);

export const updateColumn = createAsyncThunk(
  'projects/updateColumn',
  async ({ columnId, updates }: { columnId: string; updates: Partial<Column> }) => {
    const response = await axios.patch(`/api/columns/${columnId}`, updates);
    return response.data;
  }
);

export const deleteColumn = createAsyncThunk(
  'projects/deleteColumn',
  async (columnId: string) => {
    await axios.delete(`/api/columns/${columnId}`);
    return columnId;
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    addColumn: (state, action: PayloadAction<Column>) => {
      state.columns.push(action.payload);
    },
    updateColumnLocally: (state, action: PayloadAction<Column>) => {
      const index = state.columns.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.columns[index] = action.payload;
      }
    },
    removeColumn: (state, action: PayloadAction<string>) => {
      state.columns = state.columns.filter(c => c.id !== action.payload);
    },
    reorderColumns: (state, action: PayloadAction<Column[]>) => {
      state.columns = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch projects';
      })
      .addCase(fetchProjectDetails.fulfilled, (state, action) => {
        state.currentProject = action.payload.project;
        state.columns = action.payload.columns;
        state.labels = action.payload.labels;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      })
      .addCase(createColumn.fulfilled, (state, action) => {
        state.columns.push(action.payload);
      })
      .addCase(updateColumn.fulfilled, (state, action) => {
        const index = state.columns.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.columns[index] = action.payload;
        }
      })
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.columns = state.columns.filter(c => c.id !== action.payload);
      });
  },
});

export const { setCurrentProject, addColumn, updateColumnLocally, removeColumn, reorderColumns } = projectsSlice.actions;
export default projectsSlice.reducer;
