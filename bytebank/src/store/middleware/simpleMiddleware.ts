import { Middleware } from '@reduxjs/toolkit';

/**
 * Simple performance monitoring middleware
 */
export const performanceMiddleware: Middleware = (store) => (next) => (action) => {
  const startTime = performance.now();
  
  try {
    const result = next(action);
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    // Log slow actions
    if (executionTime > 100) {
      console.warn(`Slow action detected: ${(action as any).type} took ${executionTime.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    console.error(`Action ${(action as any).type} failed:`, error);
    throw error;
  }
};

/**
 * Simple logging middleware for development
 */
export const loggingMiddleware: Middleware = (store) => (next) => (action) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Dispatching action:', (action as any).type);
    const result = next(action);
    console.log('New state:', store.getState());
    return result;
  }
  
  return next(action);
};

/**
 * Error handling middleware
 */
export const errorMiddleware: Middleware = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    console.error('Redux action error:', {
      action: (action as any).type,
      error: error instanceof Error ? error.message : String(error),
      state: store.getState(),
    });
    
    // You can dispatch error actions here if needed
    // store.dispatch(setError(error.message));
    
    throw error;
  }
};

/**
 * Analytics middleware
 */
export const analyticsMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Track user actions for analytics
  if (typeof (action as any).type === 'string') {
    const actionType = (action as any).type;
    
    // Only track specific actions
    const trackableActions = [
      'auth/login',
      'auth/logout',
      'auth/register',
      'transactions/addTransaction',
      'transactions/deleteTransaction',
    ];
    
    if (trackableActions.includes(actionType)) {
      // Send to analytics service
      console.log('Analytics:', actionType, Date.now());
    }
  }
  
  return result;
};