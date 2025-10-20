import { Middleware, isRejectedWithValue } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { showSnackbar, addNotification } from '../slices/uiSlice';

export const errorMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  // Handle rejected actions
  if (isRejectedWithValue(action)) {
    const errorMessage = action.payload as string || 'Ocorreu um erro inesperado';
    
    // Show snackbar for user feedback
    store.dispatch(showSnackbar({
      message: errorMessage,
      type: 'error',
      duration: 5000,
    }));
    
    // Add to notifications for later review
    store.dispatch(addNotification({
      type: 'error',
      message: errorMessage,
      duration: 5000,
    }));
    
    if (__DEV__) {
      console.error('🚨 Redux Error:', {
        action: action.type,
        error: action.payload,
        meta: action.meta,
      });
    }
  }
  
  return next(action);
};