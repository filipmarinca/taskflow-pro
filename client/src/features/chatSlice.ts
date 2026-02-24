import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { ChatMessage } from '../types';

interface ChatState {
  messages: Record<string, ChatMessage[]>;
  typingUsers: Record<string, string[]>;
  loading: boolean;
}

const initialState: ChatState = {
  messages: {},
  typingUsers: {},
  loading: false,
};

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (projectId: string) => {
    const response = await axios.get(`/api/projects/${projectId}/chat`);
    return { projectId, messages: response.data };
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ projectId, content, mentions }: { projectId: string; content: string; mentions: string[] }) => {
    const response = await axios.post(`/api/projects/${projectId}/chat`, {
      content,
      mentions,
    });
    return { projectId, message: response.data };
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<{ projectId: string; message: ChatMessage }>) => {
      if (!state.messages[action.payload.projectId]) {
        state.messages[action.payload.projectId] = [];
      }
      state.messages[action.payload.projectId].push(action.payload.message);
    },
    setTyping: (state, action: PayloadAction<{ projectId: string; userId: string; isTyping: boolean }>) => {
      const { projectId, userId, isTyping } = action.payload;
      if (!state.typingUsers[projectId]) {
        state.typingUsers[projectId] = [];
      }
      if (isTyping && !state.typingUsers[projectId].includes(userId)) {
        state.typingUsers[projectId].push(userId);
      } else if (!isTyping) {
        state.typingUsers[projectId] = state.typingUsers[projectId].filter(id => id !== userId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages[action.payload.projectId] = action.payload.messages;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (!state.messages[action.payload.projectId]) {
          state.messages[action.payload.projectId] = [];
        }
        state.messages[action.payload.projectId].push(action.payload.message);
      });
  },
});

export const { addMessage, setTyping } = chatSlice.actions;
export default chatSlice.reducer;
