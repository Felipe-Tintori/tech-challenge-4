import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './index';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  loadUserFromStorage,
  clearError,
  setUser,
  resetAuthState 
} from '../slices/authSlice';
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectUserToken
} from '../selectors';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const token = useAppSelector(selectUserToken);

  // Actions
  const login = useCallback((email: string, password: string) => {
    return dispatch(loginUser({ email, password }));
  }, [dispatch]);

  const register = useCallback((email: string, password: string, name: string) => {
    return dispatch(registerUser({ email, password, name }));
  }, [dispatch]);

  const logout = useCallback(() => {
    return dispatch(logoutUser());
  }, [dispatch]);

  const loadUser = useCallback(() => {
    return dispatch(loadUserFromStorage());
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

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    token,
    
    // Actions
    login,
    register,
    logout,
    loadUser,
    clearAuthError,
    updateUser,
    resetAuth,
  };
};