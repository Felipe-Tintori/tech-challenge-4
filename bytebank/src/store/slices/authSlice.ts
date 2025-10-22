import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  loginUserAsync, 
  registerUserAsync, 
  logoutUserAsync, 
  loadUserAsync,
  checkAuthStatusAsync
} from '../../presentation/adapters/authThunks';

// Types baseados na entidade de domínio
interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  createdAt: string; // ISO string para serialização
  updatedAt: string; // ISO string para serialização
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  token: string | null;
  isInitialized: boolean;
}

// Initial State
const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  token: null,
  isInitialized: false,
};

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      // Se o usuário foi removido, limpar também o token
      if (!action.payload) {
        state.token = null;
      }
    },
    resetAuthState: () => initialState,
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    clearAuthState: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.error = null;
      // Manter isInitialized como true para evitar loops
    },
  },
  extraReducers: (builder) => {
    // Login com Clean Architecture
    builder
      .addCase(loginUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Register com Clean Architecture
    builder
      .addCase(registerUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(registerUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Logout com Clean Architecture
    builder
      .addCase(logoutUserAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.token = null;
      })
      .addCase(logoutUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load user com Clean Architecture
    builder
      .addCase(loadUserAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.isInitialized = true;
      })
      .addCase(loadUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isInitialized = true;
      });

    // Check auth status com Clean Architecture
    builder
      .addCase(checkAuthStatusAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatusAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.isInitialized = true;
      })
      .addCase(checkAuthStatusAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isInitialized = true;
      });
  },
});

export const { clearError, setUser, resetAuthState, setInitialized, clearAuthState } = authSlice.actions;
export default authSlice.reducer;