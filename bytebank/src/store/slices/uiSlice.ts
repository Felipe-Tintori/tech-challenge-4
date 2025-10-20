import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  timestamp: number;
}

interface UIState {
  theme: 'light' | 'dark';
  isConnected: boolean;
  notifications: Notification[];
  modals: {
    [key: string]: boolean;
  };
  loading: {
    global: boolean;
    [key: string]: boolean;
  };
  snackbar: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration: number;
  };
}

// Initial State
const initialState: UIState = {
  theme: 'light',
  isConnected: true,
  notifications: [],
  modals: {},
  loading: {
    global: false,
  },
  snackbar: {
    visible: false,
    message: '',
    type: 'info',
    duration: 4000,
  },
};

// UI Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    // Network
    setNetworkStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },

    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.notifications.unshift(notification);
      
      // Keep only last 10 notifications
      if (state.notifications.length > 10) {
        state.notifications = state.notifications.slice(0, 10);
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Modals
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },

    // Loading
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setLoading: (state, action: PayloadAction<{ key: string; isLoading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.isLoading;
    },
    clearAllLoading: (state) => {
      Object.keys(state.loading).forEach(key => {
        if (key !== 'global') {
          state.loading[key] = false;
        }
      });
      state.loading.global = false;
    },

    // Snackbar
    showSnackbar: (state, action: PayloadAction<{
      message: string;
      type?: 'success' | 'error' | 'warning' | 'info';
      duration?: number;
    }>) => {
      state.snackbar = {
        visible: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 4000,
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.visible = false;
    },

    // Reset
    resetUIState: () => initialState,
  },
});

export const {
  setTheme,
  toggleTheme,
  setNetworkStatus,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  setGlobalLoading,
  setLoading,
  clearAllLoading,
  showSnackbar,
  hideSnackbar,
  resetUIState,
} = uiSlice.actions;

export default uiSlice.reducer;