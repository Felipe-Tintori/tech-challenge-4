import { createAsyncThunk } from '@reduxjs/toolkit';
import { DIContainer } from '../../infrastructure/di/DIContainer';
import { AuthCredentials, RegisterData } from '../../domain/entities/User';

// Instância do container DI
const diContainer = DIContainer.getInstance();

/**
 * Thunks de autenticação usando Clean Architecture
 */

export const loginUserAsync = createAsyncThunk(
  'auth/loginUser',
  async (credentials: AuthCredentials, { rejectWithValue }) => {
    try {
      const user = await diContainer.loginUseCase.execute(credentials);
      const plainObject = user.toPlainObject();
      // Garantir que as datas são strings serializáveis
      return {
        ...plainObject,
        createdAt: plainObject.createdAt instanceof Date ? plainObject.createdAt.toISOString() : plainObject.createdAt,
        updatedAt: plainObject.updatedAt instanceof Date ? plainObject.updatedAt.toISOString() : plainObject.updatedAt,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro ao fazer login');
    }
  }
);

export const registerUserAsync = createAsyncThunk(
  'auth/registerUser',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const user = await diContainer.registerUseCase.execute(userData);
      const plainObject = user.toPlainObject();
      // Garantir que as datas são strings serializáveis
      const result = {
        ...plainObject,
        createdAt: plainObject.createdAt instanceof Date ? plainObject.createdAt.toISOString() : plainObject.createdAt,
        updatedAt: plainObject.updatedAt instanceof Date ? plainObject.updatedAt.toISOString() : plainObject.updatedAt,
      };
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro ao registrar usuário');
    }
  }
);

export const logoutUserAsync = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await diContainer.logoutUseCase.execute();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro ao fazer logout');
    }
  }
);

export const loadUserAsync = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await diContainer.loadUserUseCase.execute();
      if (!user) return null;
      
      const plainObject = user.toPlainObject();
      // Garantir que as datas são strings serializáveis
      return {
        ...plainObject,
        createdAt: plainObject.createdAt instanceof Date ? plainObject.createdAt.toISOString() : plainObject.createdAt,
        updatedAt: plainObject.updatedAt instanceof Date ? plainObject.updatedAt.toISOString() : plainObject.updatedAt,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro ao carregar usuário');
    }
  }
);

export const checkAuthStatusAsync = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const isAuthenticated = await diContainer.userRepository.isAuthenticated();
      if (isAuthenticated) {
        const user = await diContainer.userRepository.getCurrentUser();
        if (!user) return null;
        
        const plainObject = user.toPlainObject();
        // Garantir que as datas são strings serializáveis
        return {
          ...plainObject,
          createdAt: plainObject.createdAt instanceof Date ? plainObject.createdAt.toISOString() : plainObject.createdAt,
          updatedAt: plainObject.updatedAt instanceof Date ? plainObject.updatedAt.toISOString() : plainObject.updatedAt,
        };
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro ao verificar status de autenticação');
    }
  }
);