import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './index';
import { 
  clearError,
  setUser,
  resetAuthState 
} from '../slices/authSlice';
import {
  loginUserAsync,
  registerUserAsync,
  logoutUserAsync,
  loadUserAsync,
  checkAuthStatusAsync
} from '../../presentation/adapters/authThunks';
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectUserToken
} from '../selectors';
import { AuthCredentials, RegisterData } from '../../domain/entities/User';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const token = useAppSelector(selectUserToken);
  const isInitialized = useAppSelector(state => state.auth.isInitialized);

  // Actions com Clean Architecture
  const login = useCallback((email: string, password: string) => {
    const credentials: AuthCredentials = { email, password };
    return dispatch(loginUserAsync(credentials));
  }, [dispatch]);

  const register = useCallback((email: string, password: string, name: string) => {
    const userData: RegisterData = { email, password, name };
    return dispatch(registerUserAsync(userData));
  }, [dispatch]);

  const logout = useCallback(() => {
    return dispatch(logoutUserAsync());
  }, [dispatch]);

  const loadUser = useCallback(() => {
    return dispatch(loadUserAsync());
  }, [dispatch]);

  const checkAuthStatus = useCallback(() => {
    return dispatch(checkAuthStatusAsync());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const updateUser = useCallback((userData: any) => {
    dispatch(setUser(userData));
  }, [dispatch]);

  const resetAuth = useCallback(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  // Utilitários
  const getUserId = useCallback(() => {
    return user?.id || null;
  }, [user]);

  const getUserName = useCallback(() => {
    return user?.name || '';
  }, [user]);

  const getUserEmail = useCallback(() => {
    return user?.email || '';
  }, [user]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    token,
    isInitialized,
    
    // Actions
    login,
    register,
    logout,
    loadUser,
    checkAuthStatus,
    clearAuthError,
    updateUser,
    resetAuth,

    // Utilities
    getUserId,
    getUserName,
    getUserEmail,
  };
};