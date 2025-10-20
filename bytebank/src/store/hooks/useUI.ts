import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './index';
import {
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
  resetUIState
} from '../slices/uiSlice';
import {
  selectTheme,
  selectIsConnected,
  selectNotifications,
  selectUnreadNotifications,
  selectModals,
  selectIsModalOpen,
  selectLoading,
  selectGlobalLoading,
  selectIsLoading,
  selectSnackbar
} from '../selectors';

export const useUI = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const theme = useAppSelector(selectTheme);
  const isConnected = useAppSelector(selectIsConnected);
  const notifications = useAppSelector(selectNotifications);
  const unreadNotifications = useAppSelector(selectUnreadNotifications);
  const modals = useAppSelector(selectModals);
  const loading = useAppSelector(selectLoading);
  const globalLoading = useAppSelector(selectGlobalLoading);
  const snackbar = useAppSelector(selectSnackbar);

  // Actions
  const changeTheme = useCallback((newTheme: 'light' | 'dark') => {
    dispatch(setTheme(newTheme));
  }, [dispatch]);

  const switchTheme = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  const updateNetworkStatus = useCallback((status: boolean) => {
    dispatch(setNetworkStatus(status));
  }, [dispatch]);

  const notify = useCallback((notification: any) => {
    dispatch(addNotification(notification));
  }, [dispatch]);

  const dismissNotification = useCallback((id: string) => {
    dispatch(removeNotification(id));
  }, [dispatch]);

  const clearAllNotifications = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  const showModal = useCallback((modalName: string) => {
    dispatch(openModal(modalName));
  }, [dispatch]);

  const hideModal = useCallback((modalName: string) => {
    dispatch(closeModal(modalName));
  }, [dispatch]);

  const hideAllModals = useCallback(() => {
    dispatch(closeAllModals());
  }, [dispatch]);

  const setAppLoading = useCallback((isLoading: boolean) => {
    dispatch(setGlobalLoading(isLoading));
  }, [dispatch]);

  const setComponentLoading = useCallback((key: string, isLoading: boolean) => {
    dispatch(setLoading({ key, isLoading }));
  }, [dispatch]);

  const clearLoading = useCallback(() => {
    dispatch(clearAllLoading());
  }, [dispatch]);

  const showMessage = useCallback((message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => {
    dispatch(showSnackbar({ message, type, duration }));
  }, [dispatch]);

  const hideMessage = useCallback(() => {
    dispatch(hideSnackbar());
  }, [dispatch]);

  const resetUI = useCallback(() => {
    dispatch(resetUIState());
  }, [dispatch]);

  // Helper functions
  const isModalVisible = useCallback((modalName: string) => {
    return modals[modalName] || false;
  }, [modals]);

  const isComponentLoading = useCallback((key: string) => {
    return loading[key] || false;
  }, [loading]);

  return {
    // State
    theme,
    isConnected,
    notifications,
    unreadNotifications,
    modals,
    loading,
    globalLoading,
    snackbar,

    // Actions
    changeTheme,
    switchTheme,
    updateNetworkStatus,
    notify,
    dismissNotification,
    clearAllNotifications,
    showModal,
    hideModal,
    hideAllModals,
    setAppLoading,
    setComponentLoading,
    clearLoading,
    showMessage,
    hideMessage,
    resetUI,

    // Helpers
    isModalVisible,
    isComponentLoading,
  };
};