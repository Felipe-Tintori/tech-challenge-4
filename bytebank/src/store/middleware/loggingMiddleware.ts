import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const loggingMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  if (__DEV__) {
    const actionWithType = action as { type: string };
    console.group(`🔄 Action: ${actionWithType.type}`);
    console.log('Previous State:', store.getState());
    console.log('Action:', action);
    
    const result = next(action);
    
    console.log('Next State:', store.getState());
    console.groupEnd();
    
    return result;
  }
  
  return next(action);
};