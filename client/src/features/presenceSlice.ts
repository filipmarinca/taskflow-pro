import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Presence } from '../types';

interface PresenceState {
  users: Record<string, Presence>;
}

const initialState: PresenceState = {
  users: {},
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    setPresence: (state, action: PayloadAction<Presence>) => {
      state.users[action.payload.userId] = action.payload;
    },
    removePresence: (state, action: PayloadAction<string>) => {
      delete state.users[action.payload];
    },
    updateCursor: (state, action: PayloadAction<{ userId: string; x: number; y: number }>) => {
      if (state.users[action.payload.userId]) {
        state.users[action.payload.userId].cursor = { x: action.payload.x, y: action.payload.y };
      }
    },
    setViewing: (state, action: PayloadAction<{ userId: string; viewing: string }>) => {
      if (state.users[action.payload.userId]) {
        state.users[action.payload.userId].viewing = action.payload.viewing;
      }
    },
  },
});

export const { setPresence, removePresence, updateCursor, setViewing } = presenceSlice.actions;
export default presenceSlice.reducer;
