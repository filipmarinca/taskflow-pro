import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import projectsReducer from './features/projectsSlice';
import tasksReducer from './features/tasksSlice';
import presenceReducer from './features/presenceSlice';
import chatReducer from './features/chatSlice';
import notificationsReducer from './features/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    presence: presenceReducer,
    chat: chatReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['socket/connected', 'socket/disconnected'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
